/**
 * lib/site-config.ts — Single source of truth for site content.
 * ---------------------------------------------------------------------------
 * PRIVACY RULES ENFORCED HERE (read before you edit):
 *
 *   1. NO email address. NO phone number. NO street address. NO DOB.
 *   2. Contact happens EITHER through the on-page form (which delivers to the
 *      Resend inbox configured on the server) or through a public profile
 *      link. No address is ever hard-coded here.
 *   3. Location is city + region only. Never a house, street or landmark.
 *   4. `showSchool` exists because naming a school reveals a minor's daily
 *      location to anyone who wants to find them. Flip it to `false` if you
 *      would rather only say "Srinagar". Please talk to your parent about it.
 */

export const siteConfig = {
  name: 'Saabiq Masoodi',
  /** Used in the <title> suffix and the footer. */
  shortName: 'Saabiq',
  initials: 'SM',
  role: 'Game Developer in the Making',
  tagline: 'I build small worlds with big ideas.',
  description:
    'Saabiq Masoodi is an 11-year-old aspiring game developer from Srinagar, Kashmir. He makes games in Scratch and Godot 4, models in Blender, and builds robots with Arduino.',

  /**
   * Canonical origin. Set NEXT_PUBLIC_SITE_URL in .env.local — used for
   * canonical links, Open Graph URLs, sitemap and robots.txt.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  /** Set to true when deploying so search engines index the site. */
  indexable: process.env.NEXT_PUBLIC_INDEXABLE !== 'false',

  /* ------------------------------------------------------------------ */
  /* Public profile links. Only platforms designed to be public.          */
  /* ------------------------------------------------------------------ */
  social: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL ?? '',
    /**
     * Scratch profile. Scratch usernames are public by design and, unlike a
     * Gmail address, reveal nothing about your identity.
     */
    scratch: process.env.NEXT_PUBLIC_SCRATCH_URL ?? '',
  },

  /* ------------------------------------------------------------------ */
  /* Where the form is delivered.                                         */
  /* ------------------------------------------------------------------ */
  contact: {
    /**
     * IMPORTANT: set RESEND_API_KEY and CONTACT_TO_EMAIL on the server. The
     * destination address is never written into this repository, and never
     * reaches the browser. See app/api/contact/route.ts.
     *
     * NOTE: that variable is intentionally NOT read here. Anything without a
     * `NEXT_PUBLIC_` prefix is stripped from the client bundle, so a Client
     * Component importing this file would always see `undefined`. The form's
     * enabled state is therefore resolved on the server in
     * `components/contact.tsx` and passed down as a prop.
     */
    deliveryNote:
      'Messages go straight to Saabiq. Nothing is stored on this website.',
  },

  /* ------------------------------------------------------------------ */
  /* Location (city level only)                                          */
  /* ------------------------------------------------------------------ */
  location: {
    city: 'Srinagar',
    region: 'Kashmir',
    country: 'India',
  },

  /** Privacy toggle — see rule 4 above. */
  showSchool: true,
  school: 'D.P.S. Budgam',

  /**
   * MARS//HABITAT — Saabiq's own space-science publication.
   * Unlike the links above, this one is a hard-coded constant rather than an
   * env var: it is his own project, it is meant to be public, and it must
   * still render even when no .env file is present. It is always passed
   * through `safeExternalUrl()` before it reaches an href.
   */
  marsHabitat: {
    name: 'MARS//HABITAT',
    role: 'Founder',
    tagline: 'Designing the future of life beyond Earth.',
    description:
      'An educational publication exploring the science and engineering of human habitation on Mars — habitats, life support, ISRU, and the long road to a permanent settlement.',
    url: 'https://marshabitat.vercel.app/',
  } as const,

  /**
   * Marquee ticker content.
   * NOTE: the "age" stat is intentionally absent. It is computed dynamically
   * at render time by `lib/age.ts` so it can never go stale here.
   */
  ticker: [
    'Scratch',
    'Godot 4',
    'Blender',
    'Arduino UNO',
    'C#',
    'GDScript',
    'Pixel Art',
    '3D Modelling',
    'Robotics',
    'Level Design',
  ],

  /** Footer / legal bits. */
  builtWith: 'Next.js 15 · Tailwind CSS · TypeScript',
  copyrightYear: 2026,
} as const

/** Helper so components can render a link only when a URL is configured. */
export function safeExternalUrl(url: string): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    // Only allow protocols that cannot execute script.
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    return parsed.toString()
  } catch {
    return null
  }
}