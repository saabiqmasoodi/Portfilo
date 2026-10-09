import { NeonCard } from '@/components/ui/neon-card'
import { PixelBadge } from '@/components/ui/pixel-badge'
import { Reveal } from '@/components/ui/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { formatAge, getAgeInfo } from '@/lib/age'
import { siteConfig, safeExternalUrl } from '@/lib/site-config'

const timeline = [
  {
    year: 'Start',
    title: 'First games in Scratch',
    body: 'I started making small games — mazes, platformers, clickers — and discovered I wanted to keep building them.',
  },
  {
    year: 'Next',
    title: 'Robotics with Arduino',
    body: 'For a school project I wired and programmed an Arduino UNO robot, which taught me hardware is a whole other kind of debugging.',
  },
  {
    year: 'Now',
    title: 'Godot 4 & Blender',
    body: 'Moving into 3D: levels and scripts in Godot 4, and making my own models in Blender instead of downloading them.',
  },
  {
    year: 'Also',
    title: 'Founder of MARS//HABITAT',
    body: 'A space-science publication I started, writing about what it would actually take for humans to live on Mars.',
  },
]

const beliefs = [
  { icon: '◆', title: 'Finish what you start', body: 'Small, shipped projects teach more than big unfinished ones.' },
  { icon: '▲', title: 'Build, break, fix', body: 'Every bug I hit is something I understand better than yesterday.' },
  { icon: '★', title: 'Have fun with it', body: 'It is my hobby and my craft. Fun keeps me going.' },
]

export function About() {
  const ageInfo = getAgeInfo()
  // Resolved through the URL allow-list helper so the href can only ever be
  // http(s) — never javascript: or data:.
  const marsHabitatUrl = safeExternalUrl(siteConfig.marsHabitat.url)

  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="01 / About"
            title={
              <>
                A young developer who{' '}
                <span className="text-neon-gradient">loves to make things</span>
              </>
            }
            description={
              ageInfo
                ? `I am ${formatAge(ageInfo.age)}, I live in ${siteConfig.location.city}, ${siteConfig.location.region}, and I spend most of my time building games, modelling in 3D, or wiring up robots.`
                : `I live in ${siteConfig.location.city}, ${siteConfig.location.region}, and I spend most of my time building games, modelling in 3D, or wiring up robots.`
            }
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Story + timeline */}
          <Reveal delay={80}>
            <NeonCard tone="cyan" corners className="flex h-full flex-col gap-7">
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
                  How I got into making games
                </h3>
                <div className="flex flex-col gap-3.5 text-base leading-relaxed text-ink-muted">
                  <p>
                    It started with Scratch. I wanted to show my friends something I had made,
                    so I built a game, then another, then another. Somewhere in there it stopped
                    being about showing off and started being about the building itself.
                  </p>
                  <p>
                    These days I work in <strong className="text-ink">Godot 4</strong>, making
                    3D games and learning how real game development works — scenes, scripts,
                    physics, and why your character keeps falling through the floor. I also spend
                    time in <strong className="text-ink">Blender</strong> learning 3D modelling so
                    I can create my own art instead of depending on other people&apos;s work.
                  </p>
                  <p>
                    And then there is robotics. Building an Arduino robot showed me that
                    instructions only work if the real world cooperates — a lesson that turned
                    out to be useful for debugging code too.
                  </p>
                </div>
              </div>

              {/* ---------------- MARS//HABITAT ---------------- */}
              {marsHabitatUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-neon-amber/25 bg-gradient-to-br from-neon-amber/[0.09] via-transparent to-neon-magenta/[0.06] p-6">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-neon-amber/10 blur-2xl"
                  />
                  <div className="relative flex flex-col gap-3">
                    <span className="font-pixel text-pixel-xs uppercase tracking-widest text-neon-amber">
                      {siteConfig.marsHabitat.role} · Space Publication
                    </span>
                    <h4 className="font-display text-xl font-bold tracking-tight text-ink">
                      {siteConfig.marsHabitat.name}
                      <span className="text-neon-amber">.</span>
                    </h4>
                    <p className="font-mono text-xs uppercase tracking-wider text-neon-amber/80">
                      {siteConfig.marsHabitat.tagline}
                    </p>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {siteConfig.marsHabitat.description}
                    </p>
                    <a
                      href={marsHabitatUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="mt-1 inline-flex w-fit items-center gap-2 font-display text-sm font-semibold text-neon-amber transition-transform duration-300 hover:translate-x-1"
                    >
                      Visit marshabitat.vercel.app
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only-focusable">(opens in a new tab)</span>
                    </a>
                  </div>
                </div>
              ) : null}

              {/* Timeline */}
              <ol className="relative flex flex-col gap-5 border-l border-white/10 pl-6">
                {timeline.map((item) => (
                  <li key={item.title} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[1.9rem] top-1.5 h-2.5 w-2.5 rotate-45 border border-neon-cyan bg-void shadow-glow-cyan"
                    />
                    <span className="font-pixel text-[8px] uppercase tracking-[0.25em] text-neon-cyan">
                      {item.year}
                    </span>
                    <h4 className="mt-1.5 font-display text-base font-semibold text-ink">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                  </li>
                ))}
              </ol>

              {/* Location chips */}
              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
                <PixelBadge tone="violet">◎ {siteConfig.location.city}</PixelBadge>
                {siteConfig.showSchool ? (
                  <PixelBadge tone="amber">▣ {siteConfig.school}</PixelBadge>
                ) : null}
                <PixelBadge tone="lime">◆ Kashmir</PixelBadge>
              </div>
            </NeonCard>
          </Reveal>

          {/* Beliefs + quick facts */}
          <div className="flex flex-col gap-6">
            <Reveal delay={140}>
              <NeonCard tone="magenta" className="flex flex-col gap-5">
                <span className="font-pixel text-pixel-xs uppercase tracking-widest text-neon-magenta">
                  How I work
                </span>
                <ul className="flex flex-col gap-5">
                  {beliefs.map((belief) => (
                    <li key={belief.title} className="flex gap-3.5">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 text-neon-magenta transition-transform duration-300 group-hover:rotate-90"
                      >
                        {belief.icon}
                      </span>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-display text-sm font-semibold text-ink">
                          {belief.title}
                        </h4>
                        <p className="text-sm leading-relaxed text-ink-muted">{belief.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </NeonCard>
            </Reveal>

            <Reveal delay={200}>
              <NeonCard tone="lime" className="flex flex-col gap-4">
                <span className="font-pixel text-pixel-xs uppercase tracking-widest text-neon-lime">
                  Safe by design
                </span>
                <p className="text-sm leading-relaxed text-ink-muted">
                  This website has no email address, phone number or home address on it. Nothing
                  you type here is stored on the site, no trackers are running, and messages go
                  straight to Saabiq&apos;s inbox.
                </p>
                <a
                  href="#contact"
                  className="self-start font-display text-sm font-semibold text-neon-lime transition-transform duration-300 hover:translate-x-1"
                >
                  How to reach me safely →
                </a>
              </NeonCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}