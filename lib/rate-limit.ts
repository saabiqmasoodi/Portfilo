/**
 * lib/rate-limit.ts — Abuse prevention for the contact endpoint
 * ---------------------------------------------------------------------------
 * PRIVACY NOTE
 * We never store a raw IP address. Every request is keyed by a SHA-256 hash
 * of (IP + a daily-rotating salt). That is enough to stop one person spamming
 * the form, while making the stored data useless to anyone who later gains
 * access to it — and it means we are not accumulating personal data.
 *
 * STORAGE
 * Two providers, picked automatically:
 *   • Upstash Redis (REST, zero npm dependencies) when UPSTASH_* env vars exist.
 *     This is what you want in production on Vercel — it works across every
 *     serverless instance.
 *   • An in-process Map otherwise. Fine for `next dev` and single-node hosts,
 *     NOT reliable across multiple instances. Console-warned at boot.
 */
import { createHash } from 'node:crypto'

type Bucket = { count: number; resetAt: number }

const memory = new Map<string, Bucket>()

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const useUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN)

if (!useUpstash && process.env.NODE_ENV === 'production') {
  console.warn(
    '[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN are not set — falling back to an ' +
      'in-memory limiter. On serverless hosting this limit can be bypassed by ' +
      'spreading requests across instances. See README -> Rate limiting.',
  )
}

/** Salted, truncated, irreversible identifier for a request. */
export function pseudonymise(value: string): string {
  // Rotating daily salt: hashes cannot be correlated across days.
  const dayBucket = Math.floor(Date.now() / 86_400_000)
  const salt = process.env.RATE_LIMIT_SALT ?? 'change-me-in-env'
  return createHash('sha256').update(`${salt}:${dayBucket}:${value}`).digest('hex').slice(0, 32)
}

type UpstashPipelineResponse = Array<{ result: number | string | null }>

/**
 * Fixed-window counter, incremented atomically.
 * `EXPIRE ... NX` means the TTL is only set the first time a key appears, so a
 * spammer cannot keep pushing their own window forward forever.
 */
async function hitUpstash(key: string, windowSeconds: number) {
  const response = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, String(windowSeconds), 'NX'],
    ]),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Upstash returned ${response.status}`)
  }

  const payload = (await response.json()) as UpstashPipelineResponse
  return Number(payload[0]?.result ?? 0)
}

function hitMemory(key: string, windowSeconds: number) {
  const now = Date.now()
  const existing = memory.get(key)

  if (!existing || existing.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    // Opportunistic cleanup keeps the Map from growing unbounded.
    if (memory.size > 5_000) {
      for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k)
    }
    return 1
  }

  existing.count += 1
  return existing.count
}

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  /** Seconds until the window resets. */
  retryAfterSeconds: number
}

/**
 * Consume one token for `key`.
 * Fails OPEN on infrastructure errors: if Redis is down we would rather accept
 * a message than silently lose it. The honeypot + Turnstile layers still apply.
 */
export async function rateLimit(
  key: string,
  { limit = 3, windowSeconds = 900 }: { limit?: number; windowSeconds?: number } = {},
): Promise<RateLimitResult> {
  try {
    const count = useUpstash
      ? await hitUpstash(`rl:${key}`, windowSeconds)
      : hitMemory(key, windowSeconds)

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: windowSeconds,
    }
  } catch (error) {
    console.error('[rate-limit] backend error, failing open:', (error as Error).message)
    return { success: true, limit, remaining: limit, retryAfterSeconds: 0 }
  }
}

/** Best-effort client IP from platform headers. */
export function clientIpFrom(headers: Headers): string {
  const candidates = [
    headers.get('cf-connecting-ip'),
    headers.get('x-real-ip'),
    headers.get('x-forwarded-for'),
  ]
  for (const header of candidates) {
    if (!header) continue
    const value = header.split(',')[0]?.trim()
    if (value) return value
  }
  return 'unknown'
}