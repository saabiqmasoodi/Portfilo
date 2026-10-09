/**
 * app/api/contact/route.ts — Hardened contact endpoint
 * ---------------------------------------------------------------------------
 * Defence layers, in order of cost (cheapest first):
 *
 *   1. Method check          — only POST.
 *   2. Origin check          — must match the site origin (CSRF defence).
 *   3. Content-Type check    — must be JSON, so no simple cross-site form
 *                              POST can reach it (CSRF defence again).
 *   4. Body size limit       — no giant-payload DoS.
 *   5. Honeypot              — a hidden field only bots fill in.
 *   6. Time trap             — humans take >3s, bots submit instantly.
 *   7. Rate limit            — 3 messages per 15 min per hashed identity.
 *   8. Turnstile (optional)  — Google-grade proof-of-human.
 *   9. Sanitisation          — strip markup/control chars, enforce lengths.
 *  10. Outbound allow-list   — only ever POST to the configured provider.
 *  11. Generic responses     — never reveal which check failed, never echo
 *                              input back, never log message content.
 */
import { NextResponse, type NextRequest } from 'next/server'

import { clientIpFrom, pseudonymise, rateLimit } from '@/lib/rate-limit'
import { sanitizeEmail, sanitizeName, sanitizeText } from '@/lib/sanitize'

// Node runtime so we can use node:crypto inside the rate limiter.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

/** Hard cap on the request body. Our real messages are far smaller. */
const MAX_BODY_BYTES = 8_192
const MIN_FILL_MS = 3_000
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_SEC = 900

type Payload = {
  name?: unknown
  email?: unknown
  message?: unknown
  company?: unknown
  elapsedMs?: unknown
  turnstileToken?: unknown
}

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function POST(request: NextRequest) {
  /* ---------- 1. Method ---------- */
  // (Next.js routes only reach here for POST anyway, but be explicit.)

  /* ---------- 2. Origin / CSRF ---------- */
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return json({ ok: false, error: 'Request rejected.' }, 403)
      }
    } catch {
      return json({ ok: false, error: 'Request rejected.' }, 403)
    }
  }

  /* ---------- 3. Content-Type ---------- */
  // Requiring application/json means a plain cross-site <form> cannot submit
  // here, because browsers only allow simple content types in no-CORS forms.
  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ ok: false, error: 'Unsupported request format.' }, 415)
  }

  /* ---------- 4. Body size ---------- */
  const declaredLength = Number(request.headers.get('content-length') ?? '0')
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'Message is too large.' }, 413)
  }

  let payload: Payload
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: 'Message is too large.' }, 413)
    }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return json({ ok: false, error: 'Unsupported request format.' }, 400)
    }
    payload = parsed as Payload
  } catch {
    return json({ ok: false, error: 'Unsupported request format.' }, 400)
  }

  /* ---------- 5. Honeypot ---------- */
  // A human never sees this field, so it is always empty. Respond with a
  // *success* shape on purpose: telling a bot it was caught teaches it to
  // retry differently.
  const honeypot =
    typeof payload.company === 'string' ? payload.company.trim() : payload.company != null ? 'x' : ''
  if (honeypot) {
    return json({ ok: true }, 200)
  }

  /* ---------- 6. Time trap ---------- */
  const elapsed = typeof payload.elapsedMs === 'number' ? payload.elapsedMs : 0
  if (elapsed < MIN_FILL_MS) {
    return json({ ok: false, error: 'Please take a moment before sending.' }, 400)
  }

  /* ---------- 7. Rate limit ---------- */
  // Keyed on a salted, truncated SHA-256 of the IP — no raw IP is stored.
  const identity = pseudonymise(clientIpFrom(request.headers))
  const limit = await rateLimit(identity, {
    limit: RATE_LIMIT_MAX,
    windowSeconds: RATE_LIMIT_WINDOW_SEC,
  })
  if (!limit.success) {
    return json(
      {
        ok: false,
        error: `You have reached the limit of ${RATE_LIMIT_MAX} messages. Please try again in 15 minutes.`,
      },
      429,
    )
  }

  /* ---------- 8. Turnstile (optional) ---------- */
  if (process.env.TURNSTILE_SECRET_KEY) {
    const token = typeof payload.turnstileToken === 'string' ? payload.turnstileToken : ''
    const verified = await verifyTurnstile(token, clientIpFrom(request.headers))
    if (!verified) {
      return json({ ok: false, error: 'Captcha failed. Please try again.' }, 400)
    }
  }

  /* ---------- 9. Sanitise + validate ---------- */
  const name = sanitizeName(payload.name, 60)
  const message = sanitizeText(payload.message, 1500)
  const emailRaw =
    payload.email === undefined || payload.email === null || payload.email === ''
      ? null
      : sanitizeEmail(payload.email, 120)

  // Resolve to a plain string once, so no optional-chaining narrowing is needed
  // later on.
  const replyTo = emailRaw?.ok ? emailRaw.value : undefined

  // Generic message so attackers cannot map the validation rules.
  if (!name.ok || !message.ok || (emailRaw !== null && !emailRaw.ok)) {
    return json(
      { ok: false, error: 'Please check your name and message, then try again.' },
      400,
    )
  }

  /* ---------- 10. Deliver ---------- */
  const apiKey = process.env.RESEND_API_KEY
  const toAddress = process.env.CONTACT_TO_EMAIL

  if (!apiKey || !toAddress) {
    // Misconfiguration on our side, not the visitor's fault.
    console.error('[contact] RESEND_API_KEY / CONTACT_TO_EMAIL is not configured.')
    return json(
      { ok: false, error: 'The contact form is not set up yet. Please try again later.' },
      503,
    )
  }

  /**
   * The default Resend sender works without owning a domain, but it can ONLY
   * deliver to the address the Resend account belongs to. That is exactly our
   * use case: a contact form that mails the site owner. Set CONTACT_FROM_EMAIL
   * to a verified domain address later if you want to change it.
   */
  const fromAddress =
    process.env.CONTACT_FROM_EMAIL?.trim() || 'Portfolio Contact <onboarding@resend.dev>'

  // `name.value` is already restricted to [A-Za-z0-9 ._'-] by sanitizeName, so
  // it cannot contain CR/LF and therefore cannot inject extra mail headers.
  const subject = `Portfolio message from ${name.value}`

  /*
   * Plain-text body on purpose. Sending `text` instead of `html` means the
   * visitor's message can never be interpreted as markup by any mail client,
   * which removes the entire HTML-injection class of bug from the email path.
   */
  const body = [
    `From: ${name.value}`,
    replyTo ? `Reply-to: ${replyTo}` : 'Reply-to: (not supplied)',
    '',
    message.value,
  ].join('\n')

  try {
    const upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        subject,
        text: body,
        // Only set when the visitor actually gave an address to reply to.
        ...(replyTo ? { reply_to: replyTo } : {}),
        // No visitor IP, user agent or fingerprint is forwarded.
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    })

    if (!upstream.ok) {
      console.error('[contact] provider responded', upstream.status)
      return json(
        { ok: false, error: 'Something went wrong on our side. Please try again later.' },
        502,
      )
    }
  } catch (error) {
    console.error('[contact] delivery failed:', (error as Error).message)
    return json(
      { ok: false, error: 'Could not send your message. Please try again later.' },
      502,
    )
  }

  /* ---------- 11. Log metadata only ---------- */
  // Lengths, never content. Never the IP, never the message text.
  console.info('[contact] delivered', {
    nameLength: name.value.length,
    messageLength: message.value.length,
    hasReplyTo: Boolean(replyTo),
  })

  return json({ ok: true }, 200)
}

/** Server-side Cloudflare Turnstile verification. Never logs the token. */
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!token) return false
  try {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY ?? '',
      response: token,
      remoteip: ip,
    })
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    })
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    // Fail closed on captcha errors: rejecting is safer than accepting spam.
    return false
  }
}

/**
 * Any other method hits this. 405 + `Allow` is the correct HTTP response.
 */
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Method not allowed.' },
    {
      status: 405,
      headers: {
        Allow: 'POST',
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  )
}