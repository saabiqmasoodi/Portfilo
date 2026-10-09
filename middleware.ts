/**
 * middleware.ts — Per-request nonce Content-Security-Policy
 * ---------------------------------------------------------------------------
 * This is the security heart of the site. For every request we:
 *
 *   1. Generate a cryptographically random, single-use nonce.
 *   2. Build a strict CSP that embeds that nonce.
 *   3. Forward the CSP on the REQUEST headers so Next.js knows to stamp the
 *      nonce onto every <script>/<style> tag it renders (this is documented
 *      Next.js behaviour: it parses the nonce out of the request's
 *      `Content-Security-Policy` header).
 *   4. Copy the CSP onto the RESPONSE so the browser enforces it.
 *
 * Because the nonce is unknown to an attacker, even if they manage to inject
 * markup (stored XSS, a malicious MD file, a bad dependency), their inline
 * <script> will be BLOCKED by the browser. That is the single most valuable
 * defence on a site that belongs to a minor.
 *
 * REQUIREMENT: nonce-based CSP only works with dynamic rendering, which is why
 * `app/layout.tsx` sets `export const dynamic = 'force-dynamic'`.
 */
import { NextResponse, type NextRequest } from 'next/server'

const DEV_ONLY_SOURCES =
  process.env.NODE_ENV !== 'production'
    ? // Hot reload needs a websocket + looser script rules in dev only.
      "ws: wss: 'unsafe-eval' http://localhost:* http://127.0.0.1:*"
    : ''

/**
 * Cloudflare Turnstile (bot check on the contact form).
 *
 * Only opened up when a Turnstile key is actually configured, so the default
 * policy stays maximally strict. Turnstile needs three things:
 *   • script-src  — its api.js. Modern browsers satisfy this via our nonce +
 *                   'strict-dynamic'; the host entry is only a fallback for
 *                   older browsers that ignore 'strict-dynamic'.
 *   • frame-src   — the widget renders inside a Cloudflare iframe.
 *   • connect-src — the widget posts its challenge result back to Cloudflare.
 */
const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com'
const TURNSTILE_ENABLED = Boolean(
  process.env.TURNSTILE_SITE_KEY || process.env.TURNSTILE_SECRET_KEY,
)
const TURNSTILE_SOURCES = TURNSTILE_ENABLED ? TURNSTILE_ORIGIN : ''

/**
 * `font-src 'self'` is all we need — `next/font/google` downloads the font
 * files at BUILD time and serves them from our own origin. We never talk to
 * fonts.googleapis.com, so we never leak visitor IPs to Google.
 */
function buildCsp(nonce: string) {
  const directives: Record<string, string | null> = {
    'default-src': "'self'",

    // 'strict-dynamic' lets Next's own module scripts load its chunks without
    // us having to enumerate domains. Modern browsers honour it and IGNORE the
    // host allow-list / 'unsafe-inline', which is what makes this strict.
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", TURNSTILE_SOURCES, DEV_ONLY_SOURCES]
      .filter(Boolean)
      .join(' '),

    // Tailwind/Next inject a <style> tag or style="" attributes in places.
    // 'unsafe-inline' here is a deliberate, low-risk trade-off: CSS injection
    // can deface a page but cannot execute script.
    'style-src': ["'self'", "'unsafe-inline'", DEV_ONLY_SOURCES].filter(Boolean).join(' '),

    // No remote images are allowed at all. data: is needed for inline SVG,
    // blob: for a canvas if you add one later.
    'img-src': "'self' data: blob:",

    'font-src': "'self' data:",

    // No analytics, no third-party beacons, no telemetry. Turnstile is the only
    // exception, and only when it is configured.
    'connect-src': ["'self'", TURNSTILE_SOURCES, DEV_ONLY_SOURCES].filter(Boolean).join(' '),

    'media-src': "'self'",

    // Same-origin only, plus the Turnstile iframe when it is enabled.
    'frame-src': ["'self'", TURNSTILE_SOURCES].filter(Boolean).join(' '),
    'child-src': ["'self'", TURNSTILE_SOURCES].filter(Boolean).join(' '),

    // Kill every legacy plugin surface: Flash, Java applets, <object>, <embed>.
    'object-src': "'none'",

    // Blocks <base> tag hijacking.
    'base-uri': "'self'",

    // A form can only ever post to this origin. This alone defeats a huge
    // class of form-hijacking / phishing attacks.
    'form-action': "'self'",

    // Modern clickjacking defence (X-Frame-Options: DENY is also sent).
    'frame-ancestors': "'none'",

    // Opt out of all speculative future features.
    'upgrade-insecure-requests': null,
  }

  return Object.entries(directives)
    .map(([key, value]) => (value === null ? key : `${key} ${value}`))
    .join('; ')
}

/** Strip characters that would let a value break out of the header. */
function sanitiseNonce(value: string) {
  return value.replace(/[^A-Za-z0-9+/=_-]/g, '')
}

export function middleware(request: NextRequest) {
  const nonce = sanitiseNonce(btoa(crypto.randomUUID()))
  const cspHeader = buildCsp(nonce)

  // 1. Hand the nonce to Next.js so it can stamp it onto its own tags.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // 2. Tell the browser to enforce it.
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Run on every page + API request, but skip:
     *   - Next.js immutable build assets (hashed filenames, cannot be attacked)
     *   - raw image/font files
     *   - favicon / icons
     * Hashed `_next/static` chunks still get the static headers from
     * next.config.mjs; they just do not need a nonce.
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)',
      missing: [
        // Next.js prefetches routes with these headers. We deliberately skip
        // CSP on prefetches: a prefetched payload would carry a stale nonce.
        // (This site uses plain <a> anchors, so nothing prefetches anyway.)
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}