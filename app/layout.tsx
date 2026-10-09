/**
 * app/layout.tsx — Fonts, metadata, and privacy defaults
 * ---------------------------------------------------------------------------
 * FONT SECURITY NOTE (important, and the reason we do it this way):
 * `next/font/google` DOWNLOADS the font files once at build time and serves
 * them from our own domain as hashed, self-hosted assets. The browser never
 * requests fonts.googleapis.com, so:
 *   • our CSP can keep `font-src 'self'` (no third-party font origin), and
 *   • no visitor IP addresses are handed to Google on page view.
 * Do not "fix" this by adding a <link> to Google Fonts — that would undo both.
 */
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Press_Start_2P, Space_Grotesk } from 'next/font/google'

import './globals.css'

import { siteConfig } from '@/lib/site-config'

/* ==========================================================================
   1. FONTS
   Each family is registered as a CSS variable and mapped in
   tailwind.config.js -> theme.extend.fontFamily
   ========================================================================== */

// Primary display face for big titles. Geometric + a bit playful, but still
// very readable at large sizes.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  // Add `preload: false` here if you are ever worried about font payload size.
})

// Body copy. Inter is the most legible UI font there is at small sizes.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

// Micro retro labels: "PLAYABLE", "IN PROGRESS", section eyebrows.
// NOTE: Press Start 2P only ships one weight (400) and has no italic/bold.
const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-pixel',
  // Press Start 2P is ~100 KB per weight; skip preloading to keep LCP fast
  // since it is only ever used for tiny decorative labels.
  preload: false,
})

// Stats, code, and the terminal-ish bits.
const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '700'],
})

const fontVariables = [
  spaceGrotesk.variable,
  inter.variable,
  pressStart2P.variable,
  jetBrainsMono.variable,
].join(' ')

/* ==========================================================================
   2. METADATA
   Contains NO personal contact details by design.
   ========================================================================== */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.role}`,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: `${siteConfig.shortName} Portfolio`,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'technology',
  keywords: [
    'Saabiq Masoodi',
    'game developer',
    'Scratch games',
    'Godot 4',
    'Blender',
    '3D modelling',
    'Arduino robot',
    'Srinagar Kashmir',
    'young game developer',
  ],
  alternates: { canonical: '/' },
  robots: {
    index: siteConfig.indexable,
    follow: siteConfig.indexable,
    googleBot: {
      index: siteConfig.indexable,
      follow: siteConfig.indexable,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // iOS/Android "app" metadata — no deep links, no store id, nothing tracking.
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    // Prevents iOS/Safari from auto-linking phone numbers, emails and street
    // addresses found in the text. A small but real privacy win.
    telephone: false,
    email: false,
    address: false,
    date: false,
    url: false,
  },
  openGraph: {
    type: 'website',
    siteName: `${siteConfig.shortName} — Portfolio`,
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: siteConfig.description,
    url: '/',
    locale: 'en_IN',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: siteConfig.description,
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
  },
  manifest: '/manifest.webmanifest',
  // No `verification` keys committed to source control — set them via env if
  // you register the site with Google/Bing Search Console.
}

/* ==========================================================================
   3. VIEWPORT
   ========================================================================== */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05060d' },
    { media: '(prefers-color-scheme: light)', color: '#05060d' },
  ],
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // NOT setting `maximumScale` — pinching to zoom must stay available for
  // accessibility.
}

/* ==========================================================================
   4. LAYOUT
   ========================================================================== */

/**
 * Nonce-based CSP requires a fresh render per request (see middleware.ts), and
 * Next.js explicitly documents that nonces do not work with static generation.
 * Side benefit: `getAgeInfo()` also runs per request, so the age on the site is
 * genuinely dynamic — turn 12 and it says 12, with no rebuild.
 *
 * If you ever switch to a static export you must remove this line AND swap
 * middleware.ts for the static CSP at the bottom of next.config.mjs, otherwise
 * pages render without a nonce and the browser blocks them.
 */
export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} dark`}>
      {/*
        React 19 automatically hoists <meta> tags into <head>, so there is no
        need (and no benefit) to render a literal <head> element here.
      */}
      <body className="relative min-h-dvh overflow-x-hidden bg-void text-ink">
        {/*
          Privacy-by-default: no referrer leakage, no auto-translation
          (which would send page text to Google Translate), no ad personalisation
          tags, and no third-party analytics or pixels anywhere on this site.
        */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="google" content="notranslate" />
        <meta name="rating" content="general" />
        <meta name="color-scheme" content="dark" />

        {/*
          Keyboard users can jump straight to the content. The link stays
          visually hidden until it receives focus.
        */}
        <a
          href="#main"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-lg border border-neon-cyan bg-void px-4 py-2 font-pixel text-pixel-xs text-neon-cyan shadow-glow-cyan"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}