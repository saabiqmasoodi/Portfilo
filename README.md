# Saabiq Masoodi — Portfolio

A personal portfolio site built with **Next.js 15 (App Router)**, **Tailwind CSS 3**,
**TypeScript** and **Google Fonts**.

Dark-arcade aesthetic, with a security posture designed for a site owned by a
minor: no trackers, no personal contact details published, a nonce-based Content
Security Policy, and a hard-validated contact form.

---

## Quick start

```bash
# 1. Install Node.js 20 or newer from https://nodejs.org  (if you don't have it)

# 2. Install the packages
npm install

# 3. Create your private settings file
cp .env.example .env.local

# 4. Optionally set BIRTHDATE=YYYY-MM-DD in .env.local (hides the age if blank)

# 5. Start the site
npm run dev
```

Open <http://localhost:3000>.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript errors only |
| `npm run lint` | ESLint |

---

## The dynamic age

You asked for an age that updates itself. That is already done.

1. `.env.local` holds your real `BIRTHDATE=YYYY-MM-DD`. It has **no** `NEXT_PUBLIC_`
   prefix, so Next.js strips it from the browser bundle at build time.
2. `lib/age.ts` imports `server-only`. If anyone ever imports that file into a
   Client Component, the **build fails** instead of leaking the value.
3. `app/layout.tsx` sets `dynamic = 'force-dynamic'`, so the page renders fresh
   on every request and `getAgeInfo()` recalculates each time. Turn 12, and the
   site says 12. No rebuild needed.
4. Comparisons happen in **UTC**, so a visitor in another timezone never sees
   the number change a day early.
5. The browser receives only the integer `11`. It never receives the date.

The `BirthdayCountdown` component is given `{ years, months, days }` — not the
date — so even the countdown does not reveal when your birthday is.

To change the value, edit one line in `.env.local`. Nothing else.

---

## Design system

| Piece | Choice | Why |
| --- | --- | --- |
| Display | **Space Grotesk** | Geometric, playful, sharp at large sizes |
| Body | **Inter** | The most legible UI font at small sizes |
| Retro labels | **Press Start 2P** | Authentic arcade feel for tiny badges |
| Code / stats | **JetBrains Mono** | Tabular numbers for stat grids |

All four are loaded through `next/font/google`, which **self-hosts** them. The
browser never calls `fonts.googleapis.com`. That is why `font-src 'self'` is all
our CSP needs, and why no visitor IP is handed to Google.

Palette (defined in `tailwind.config.js`):

- Backgrounds: `void #05060d`, `surface #0a0d18 / #111629 / #171d33`
- Text: `ink #e9edfa`, `ink-muted #9aa4c2`, `ink-faint #6a7392`
- Accents: `neon-cyan`, `neon-magenta`, `neon-lime`, `neon-violet`, `neon-amber`

Animations: `float`, `pulse-glow`, `blink`, `flicker`, `grid-move`, `scan-line`,
`shine`, `marquee`, `rise-in`, `pop-in`. **All of them are switched off
automatically for visitors who set `prefers-reduced-motion`.**

### Reusable components

| Component | Purpose |
| --- | --- |
| `components/ui/neon-card.tsx` | Glassmorphism + glowing border + cursor spotlight |
| `components/ui/neon-button.tsx` | Pill button, 3 tones, link or `<button>` |
| `components/ui/pixel-badge.tsx` | Press Start 2P micro-label chip |
| `components/ui/section-heading.tsx` | Consistent eyebrow + title + lede |
| `components/ui/marquee.tsx` | Endless retro ticker |
| `components/ui/reveal.tsx` | Scroll-triggered fade/rise (reduced-motion aware) |
| `components/game-card.tsx` | The main project card — showcases the whole system |

---

## Security & privacy

### What is deliberately NOT on this site

- No email address
- No phone number
- No street address, no "near me", no landmarks
- No exact date of birth
- No analytics, no cookies, no pixels, no fonts from a third-party CDN
- No remote images at all (`remotePatterns: []`)

### Static headers — `next.config.mjs`

`X-Frame-Options: DENY` · `X-Content-Type-Options: nosniff` ·
`Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy` with
camera, microphone, geolocation, USB, payment and more all set to `()` ·
`X-DNS-Prefetch-Control: off` · HSTS · `Cross-Origin-Opener-Policy` ·
`Cross-Origin-Resource-Policy` · `Origin-Agent-Cluster` ·
`X-Powered-By` removed via `poweredByHeader: false`.

### The CSP — `middleware.ts`

The CSP is **not** in `next.config.js`, and that is deliberate. The strong version
of a Next.js CSP needs a **per-request nonce**. A nonce cannot live in a build
config file, because anyone can read the page source and find it there.

`middleware.ts` generates a fresh `crypto.randomUUID()` nonce per request and:

1. forwards the CSP on the **request** headers, which is how Next.js learns to
   stamp the nonce onto every `<script>` and `<style>` it renders, and
2. copies it onto the **response** for the browser to enforce.

The result: `script-src 'self' 'nonce-…' 'strict-dynamic'`. With
`'strict-dynamic'`, modern browsers **ignore** host allow-lists and
`'unsafe-inline'`. So if anything ever manages to inject markup into a page, its
inline script is still blocked.

`frame-ancestors 'none'` blocks clickjacking, `object-src 'none'` kills legacy
plugins, `form-action 'self'` means a form can only ever post to this origin, and
`base-uri 'self'` blocks `<base>` hijacking.

> Nonces require dynamic rendering, which is why `app/layout.tsx` has
> `export const dynamic = 'force-dynamic'`. If you ever go fully static, remove
> that line **and** simplify the middleware together, or pages will render
> without a nonce and be blocked. A ready-made static CSP is commented out at the
> bottom of `next.config.mjs`.

### The contact form — `app/api/contact/route.ts`

Eleven layers, cheapest first:

1. **POST only** — everything else gets `405`.
2. **Origin check** — the `Origin` header must match the site host (CSRF).
3. **`application/json` required** — a plain cross-site `<form>` cannot set that
   content type without CORS, which blocks CSRF at the spec level.
4. **Body capped at 8 KB** — no payload DoS.
5. **Honeypot** — a hidden `company` field. Bots fill it, humans never see it.
   It gets a fake success response so the bot learns nothing.
6. **Time trap** — humans take over 3 seconds; instant submits are refused.
7. **Rate limit** — 3 messages per 15 minutes.
8. **Turnstile** (optional) — server-side verification, **fails closed**.
9. **Sanitisation** — `lib/sanitize.ts` strips markup/protocol handlers/control
   characters/zero-width and bidi-override characters, decodes nothing, and
   enforces hard length caps. Invalid input is *rejected*, never silently
   rewritten.
10. **Outbound allow-list** — the server only ever POSTs to
    `https://api.resend.com/emails`.
11. **Generic responses + minimal logs** — you cannot probe which check failed,
    and nothing you typed comes back in the response. Logs record **lengths
    only**, never content, never an IP.

`origin-src` and the API's own request body are also covered by `form-action`
and the same-origin checks, so cross-site abuse is covered from both ends.

### Rate limiting

`lib/rate-limit.ts` keys every request on a **SHA-256 hash** of the IP plus a
salt that **rotates daily**. Consequences:

- No raw IP is ever stored.
- Hashes cannot be correlated across days.
- A default fallback warns you in the console if you are running without
  distributed storage.

It uses the [Upstash Redis](https://console.upstash.com/) REST API directly, so
there is **no extra npm dependency**. Without Upstash env vars it falls back to
an in-process `Map`, which is fine for local development but bypassable across
multiple serverless instances — set Upstash before you go live.

The limiter **fails open** if Redis is unreachable (a network outage should not
silently swallow someone's message). The honeypot and Turnstile layers still
apply.

---

## Content you should edit

| File | What to change |
| --- | --- |
| `lib/site-config.ts` | Your bio, stats, social links, and the `showSchool` privacy toggle |
| `lib/projects.ts` | Your real projects, descriptions, tool lists, links |
| `app/layout.tsx` | Meta description and keywords |

### The school privacy toggle

`siteConfig.showSchool` controls whether your school is printed on the site.
Naming a school tells anyone who is looking exactly where an 11-year-old spends
every weekday. The site currently prints `Srinagar, Kashmir` (city-level, which
is normal for a portfolio) and `D.P.S. Budgam`. **Set it to `false` and just say
"a student in Srinagar"** if you and your parents prefer that — it is a one-word
change and nothing breaks.

Ask a parent or guardian to read this decision with you.

### Project links

Only link public pages (Scratch, itch.io, a public GitHub repo). Never link a
private repository, and check that your game itself does not show your full
name, school, or photos of you.

---

## Before you deploy

1. `npm run build` — must pass with no errors.
2. Set `NEXT_PUBLIC_SITE_URL` to your real domain.
3. Set `BIRTHDATE`.
4. Set `RATE_LIMIT_SALT` to a long random string (`openssl rand -hex 32`).
5. Create the free Upstash database and set both `UPSTASH_*` vars.
6. If you want the contact form, set `RESEND_API_KEY` and `CONTACT_TO_EMAIL`
   (the form mails you directly — no parent inbox involved).
7. Deploy (Vercel is the easiest), then run the checklist below.

### Post-deploy checklist

- [ ] View source: `Ctrl+U`. You should **not** see your birth date anywhere.
- [ ] `view-source` should not contain any email address.
- [ ] DevTools → Network: the only requests are your own domain. No Google, no
      analytics, no third parties.
- [ ] DevTools → Application → Cookies: should be empty.
- [ ] Try `https://your-site.com/api/contact` in a browser → expect `405`.
- [ ] Submit the form 5 times quickly → the 4th should return "limit reached".
- [ ] In a private window, confirm nothing looks broken (it will if the CSP nonce
      is misconfigured — that is the one thing to re-check first).
- [ ] Add the domain to Google Search Console and request indexing.

---

## A note on being online

You are 11, and this is a good instinct: keep your personal details off your
website. A few habits worth keeping:

- Never put your address, phone number, school timetable, or live location in
  your game metadata.
- Do not put your face, name badge, or uniform in screenshots.
- Keep your public profiles on platforms designed to be public.
- Tell a parent or guardian before adding any new service (analytics, a
  comment widget, a Discord bot, a login).
- If someone online asks for your personal details, that is a red flag — tell an
  adult you trust.

---

## Project structure

```
app/
  api/contact/route.ts   Hardened contact endpoint (11 layers)
  globals.css            Base styles, glass/scanline utilities, reduced-motion
  icon.svg               Favicon
  layout.tsx             Fonts + metadata + privacy defaults
  opengraph-image.tsx    Generated social share card
  page.tsx               Home page
  robots.ts / sitemap.ts / manifest.ts
components/
  ui/                    Design system primitives
  hero.tsx  about.tsx  projects.tsx  skills.tsx  contact.tsx
  site-header.tsx  site-footer.tsx
  game-card.tsx          The showcase card
  contact-form.tsx       Client form with honeypot + time trap
  birthday-countdown.tsx Live countdown (no date leaked)
lib/
  age.ts                 Dynamic age, server-only
  sanitize.ts            Input cleaning
  rate-limit.ts          Salted, hashed, distributed rate limiting
  site-config.ts         All content in one place
  projects.ts            Project data
middleware.ts            Per-request nonce CSP
next.config.mjs          Static security headers
tailwind.config.js       Palette, fonts, keyframes
```