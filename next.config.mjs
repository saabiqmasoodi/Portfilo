/**
 * next.config.mjs — Production configuration & security headers
 * ---------------------------------------------------------------------------
 * WHY THE CSP LIVES IN `middleware.ts` AND NOT HERE
 *
 * The strongest Content-Security-Policy for a Next.js App Router app is a
 * NONCE-based one. A nonce is a random, single-use, per-request value. Because
 * it changes on every single response, it CANNOT be stored in a static config
 * file — a build-time constant is visible to anyone who views the page source,
 * which defeats the entire purpose.
 *
 *   • `next.config.mjs`  -> static headers that never change (this file)
 *   • `middleware.ts`    -> the dynamic nonce-based CSP header
 *
 * If you ever deploy as a fully static export and want to drop nonce support,
 * there is a ready-made static policy commented out at the bottom of this file.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Do not advertise the framework (info leak / banner)
  compress: true,

  // This site has no need for remote images. An empty allow-list means the
  // browser can never be tricked into loading a third-party tracker pixel.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    dangerouslyAllowSVG: false,
  },

  // Hides framework details from error pages in production.
  productionBrowserSourceMaps: false,

  /**
   * Browsers still probe the legacy `/favicon.ico` path even when the page
   * advertises an icon, which shows up as a harmless 404 in hosting logs.
   * Next.js serves the real icon from `app/icon.svg`; this quietly points the
   * old path at it instead of letting it 404.
   */
  async redirects() {
    return [{ source: '/favicon.ico', destination: '/icon.svg', permanent: false }]
  },

  /**
   * Security headers applied to EVERY response (including static assets).
   * -------------------------------------------------------------------------
   * These are the STATIC, never-changing headers. The Content-Security-Policy
   * is deliberately NOT here — it needs a per-request nonce and therefore
   * lives in middleware.ts. See the top of this file for the full explanation.
   *
   * Notes on the tricky ones:
   *  - X-DNS-Prefetch-Control: "off" — we self-host fonts via next/font, so
   *    there is zero reason to leak the visitor's DNS to any third party.
   *  - X-Powered-By is already disabled above.
   *  - `frame-ancestors 'none'` (in the CSP) is the modern replacement for
   *    X-Frame-Options; both are sent for legacy browser support.
   *  - Strict-Transport-Security is ignored over plain http://, so it is safe
   *    to leave on during local development.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: [
              'accelerometer=()',
              'autoplay=()',
              'browsing-topics=()',
              'camera=()',
              'display-capture=()',
              'encrypted-media=()',
              'fullscreen=(self)',
              'geolocation=()',
              'gyroscope=()',
              'interest-cohort=()',
              'magnetometer=()',
              'microphone=()',
              'midi=()',
              'payment=()',
              'publickey-credentials-create=()',
              'screen-wake-lock=()',
              'usb=()',
              'xr-spatial-tracking=()',
            ].join(', '),
          },
          // Security headers
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Origin-Agent-Cluster', value: '?1' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },

      // The contact API must never be cached by any CDN in between.
      // (We deliberately do NOT set a global Cache-Control here: Next.js
      // already applies `immutable` to content-hashed `_next/static` assets and
      // `no-store` to dynamically rendered pages. Overriding it globally would
      // wreck build-asset caching.)
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ]
  },

  /**
   * -------------------------------------------------------------------------
   * STATIC CSP — only needed if you abandon nonce support.
   *
   * You would then have to ALSO delete the middleware nonce logic and remove
   * `export const dynamic = 'force-dynamic'` from app/layout.tsx.
   *
   * Weaknesses vs. the nonce version:
   *   - `'unsafe-inline'` is required for Next.js hydration scripts, which is
   *     exactly the hole a nonce closes.
   *   - Inline event handlers are allowed.
   * -------------------------------------------------------------------------
   */
  // async headers() {
  //   const isDev = process.env.NODE_ENV !== 'production'
  //   const csp = [
  //     "default-src 'self'",
  //     `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  //     "style-src 'self' 'unsafe-inline'",
  //     "img-src 'self' data: blob:",
  //     "font-src 'self'",
  //     `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  //     "frame-src 'none'",
  //     "object-src 'none'",
  //     "base-uri 'self'",
  //     "form-action 'self'",
  //     "frame-ancestors 'none'",
  //     'upgrade-insecure-requests',
  //   ].join('; ')
  //   return [{ source: '/:path*', headers: [{ key: 'Content-Security-Policy', value: csp }] }]
  // },
}

export default nextConfig