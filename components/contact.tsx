import { headers } from 'next/headers'

import { ContactForm } from '@/components/contact-form'
import { NeonCard } from '@/components/ui/neon-card'
import { PixelBadge } from '@/components/ui/pixel-badge'
import { Reveal } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { safeExternalUrl, siteConfig } from '@/lib/site-config'

const guarantees = [
  {
    icon: '🔒',
    title: 'No tracking, no cookies',
    body: 'This site runs zero analytics and sets zero cookies. There is nothing for anyone to profile you with.',
  },
  {
    icon: '🧤',
    title: 'No details about me',
    body: 'No email, no phone number, no address. Just a message box and public links.',
  },
  {
    icon: '✉️',
    title: 'Read by Saabiq himself',
    body: 'Messages go straight to Saabiq. Nothing is stored in a database and no address is published on this site.',
  },
  {
    icon: '🗑️',
    title: 'Nothing is stored',
    body: 'Your message goes straight from this page to the inbox and is not saved in any database.',
  },
]

export async function Contact() {
  const github = safeExternalUrl(siteConfig.social.github)
  const scratch = safeExternalUrl(siteConfig.social.scratch)

  /**
   * Resolved HERE, on the server, then passed to the Client Component.
   * Reading `process.env.RESEND_API_KEY` inside the form itself would
   * always be `undefined` in the browser, because non-public env vars are
   * stripped from the client bundle.
   */
  const formEnabled = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL)

  /**
   * Turnstile is OPTIONAL and self-disabling: if no site key is configured the
   * widget is not rendered at all and the form behaves exactly as before.
   * The site key is public by design (it appears in the HTML), but the SECRET
   * stays on the server — see app/api/contact/route.ts.
   */
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || undefined

  /**
   * The per-request CSP nonce, minted in middleware.ts. `next/script` needs it
   * to load Cloudflare's api.js under our 'strict-dynamic' policy.
   */
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="04 / Contact"
            title={
              <>
                Say <span className="text-neon-gradient">hello</span>
              </>
            }
            description="Want to tell me about a game, suggest something to build, or just say hi? Send a message — I read them all."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form */}
          <Reveal delay={80}>
            <NeonCard tone="cyan" corners className="relative">
              <div className="mb-6 flex flex-wrap items-center gap-2.5">
                <PixelBadge tone="cyan" dot>
                  Secure Form
                </PixelBadge>
                <PixelBadge tone="lime">No Database</PixelBadge>
              </div>
              <ContactForm
                enabled={formEnabled}
                turnstileSiteKey={turnstileSiteKey}
                nonce={nonce}
              />
            </NeonCard>
          </Reveal>

          {/* Guarantees + links */}
          <div className="flex flex-col gap-6">
            <Reveal delay={140}>
              <NeonCard tone="violet" className="flex flex-col gap-5">
                <span className="font-pixel text-pixel-xs uppercase tracking-widest text-neon-violet">
                  What happens to your message
                </span>
                <ul className="flex flex-col gap-4">
                  {guarantees.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span aria-hidden="true" className="text-base">
                        {item.icon}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <h4 className="font-display text-sm font-semibold text-ink">
                          {item.title}
                        </h4>
                        <p className="text-sm leading-relaxed text-ink-muted">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </NeonCard>
            </Reveal>

            {(github || scratch) && (
              <Reveal delay={200}>
                <NeonCard tone="lime" className="flex flex-col gap-4">
                  <span className="font-pixel text-pixel-xs uppercase tracking-widest text-neon-lime">
                    Find me online
                  </span>
                  <ul className="flex flex-col gap-3">
                    {github ? (
                      <li>
                        <a
                          href={github}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="group/link flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 transition-all duration-300 hover:border-neon-lime/40 hover:bg-neon-lime/5"
                        >
                          <span className="flex items-center gap-2.5 font-display text-sm font-semibold text-ink">
                            <span aria-hidden="true">⌨</span> GitHub
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-ink-faint transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                          >
                            ↗
                          </span>
                        </a>
                      </li>
                    ) : null}
                    {scratch ? (
                      <li>
                        <a
                          href={scratch}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="group/link flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 transition-all duration-300 hover:border-neon-cyan/40 hover:bg-neon-cyan/5"
                        >
                          <span className="flex items-center gap-2.5 font-display text-sm font-semibold text-ink">
                            <span aria-hidden="true">🐱</span> Scratch
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-ink-faint transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                          >
                            ↗
                          </span>
                        </a>
                      </li>
                    ) : null}
                  </ul>
                  <p className="text-xs leading-relaxed text-ink-faint">
                    Only these public profiles are linked. Please do not post my personal details
                    anywhere.
                  </p>
                </NeonCard>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}