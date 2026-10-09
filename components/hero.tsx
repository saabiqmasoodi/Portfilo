import { BirthdayCountdown } from '@/components/birthday-countdown'
import { NeonButton } from '@/components/ui/neon-button'
import { PixelBadge } from '@/components/ui/pixel-badge'
import { ageUnit, getAgeInfo } from '@/lib/age'
import { safeExternalUrl, siteConfig } from '@/lib/site-config'

/**
 * Hero. This is a Server Component — `getAgeInfo()` runs on the server, so the
 * exact date of birth never reaches the browser, and the age is recalculated
 * on every single request.
 */
export function Hero() {
  const ageInfo = getAgeInfo()
  const github = safeExternalUrl(siteConfig.social.github)

  const stats = [
    // Age is dynamic and only appears when BIRTHDATE is configured. The
    // fallback keeps the 2x2 stat grid full without inventing a number.
    ageInfo
      ? { label: 'Age', value: String(ageInfo.age), accent: 'text-neon-cyan' }
      : { label: 'Focus', value: 'Game Dev', accent: 'text-neon-cyan' },
    { label: 'Games Built', value: '12+', accent: 'text-neon-lime' },
    { label: 'Engine', value: 'Godot 4', accent: 'text-neon-magenta' },
    { label: 'From', value: 'Srinagar', accent: 'text-neon-violet' },
  ]

  return (
    <section id="home" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      {/* ---------- Background layers (all decorative, no JS) ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-neon-aurora opacity-70" />
        <div className="absolute inset-0 bg-dot-grid bg-dot-grid [mask-image:radial-gradient(70%_60%_at_50%_35%,#000_20%,transparent_100%)]" />
        {/* Floating neon orbs */}
        <div className="absolute left-[8%] top-16 h-64 w-64 animate-float rounded-full bg-neon-cyan/20 blur-[80px]" />
        <div
          className="absolute right-[6%] top-40 h-72 w-72 animate-float-slow rounded-full bg-neon-magenta/20 blur-[90px]"
          style={{ animationDelay: '-4s' }}
        />
        <div
          className="absolute left-1/3 top-[35%] h-56 w-56 animate-float rounded-full bg-neon-violet/20 blur-[80px]"
          style={{ animationDelay: '-7s' }}
        />
        {/* Scanline sweep */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="h-16 w-full animate-scan-line bg-gradient-to-b from-transparent via-neon-cyan/[0.045] to-transparent" />
        </div>
      </div>

      <div className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* ================= LEFT ================= */}
          <div className="flex flex-col items-start gap-7">
            <PixelBadge tone="cyan" dot>
              Level 12 &middot; Player One
            </PixelBadge>

            <div className="flex flex-col gap-4">
              <h1 className="font-display text-[2.75rem] font-bold leading-[0.98] tracking-tighter text-ink sm:text-6xl lg:text-7xl">
                <span className="block text-ink-muted">Hi, I&apos;m</span>
                <span className="text-neon-gradient">Saabiq.</span>
              </h1>

              <p className="font-mono text-sm uppercase tracking-[0.2em] text-neon-cyan sm:text-base">
                {siteConfig.role}
              </p>

              <p className="max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
                I&apos;m a young developer from{' '}
                <span className="font-semibold text-ink">
                  {siteConfig.location.city}, {siteConfig.location.region}
                </span>{' '}
                who makes games, models 3D worlds in Blender, and builds robots with Arduino. Right
                now I&apos;m learning everything I can — one small project at a time.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <NeonButton href="#projects" tone="cyan" variant="solid">
                <span aria-hidden="true">▶</span>
                See My Games
              </NeonButton>
              <NeonButton href="#about" tone="magenta" variant="ghost">
                More About Me
              </NeonButton>
              {github ? (
                <NeonButton href={github} tone="lime" variant="ghost" external>
                  GitHub
                  <span aria-hidden="true">↗</span>
                </NeonButton>
              ) : null}
            </div>

            {/* Dynamic age + live birthday countdown (only when BIRTHDATE is set) */}
            {ageInfo ? (
              <div className="flex flex-col gap-3 rounded-panel border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold tabular-nums text-neon-cyan text-glow-cyan">
                    {ageInfo.age}
                  </span>
                  <span className="text-sm text-ink-muted">{ageUnit(ageInfo.age)}</span>
                </div>
                <span className="hidden h-8 w-px bg-white/10 sm:block" />
                <div className="flex flex-col gap-1">
                  <span className="font-pixel text-[8px] uppercase tracking-widest text-ink-faint">
                    Next Birthday
                  </span>
                  <BirthdayCountdown
                    years={ageInfo.countdown.years}
                    months={ageInfo.countdown.months}
                    days={ageInfo.countdown.days}
                    isBirthdayToday={ageInfo.isBirthdayToday}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* ================= RIGHT — player card ================= */}
          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            {/* Glow behind the card */}
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-neon-cyan/20 via-neon-violet/10 to-neon-magenta/20 blur-3xl"
            />

            <div className="glass scanlines pixel-corners overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-neon-magenta/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-neon-amber/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-neon-lime/70" />
                <span className="ml-2 font-mono text-[11px] text-ink-faint">player-card.json</span>
              </div>

              <div className="flex flex-col gap-6 p-6 sm:p-7">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-cyan/40 bg-gradient-to-br from-neon-violet/25 to-neon-cyan/15 font-display text-xl font-bold text-ink shadow-glow-cyan">
                      {siteConfig.initials}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-void bg-neon-lime text-[10px] text-void">
                      ★
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-bold text-ink">
                      {siteConfig.name}
                    </p>
                    <p className="truncate font-mono text-[11px] uppercase tracking-wider text-neon-cyan">
                      @{siteConfig.shortName.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* XP bar */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[8px] uppercase tracking-widest text-ink-faint">
                      Game Dev XP
                    </span>
                    <span className="font-mono text-[11px] font-bold text-neon-lime">LVL 3</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="absolute inset-y-0 left-0 w-[68%] rounded-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta" />
                    <div className="absolute inset-0 animate-pulse-glow rounded-full bg-neon-violet/40 blur-md" />
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-ink-faint">
                    <span>68 / 100</span>
                    <span className="animate-caret-blink">_</span>
                  </div>
                </div>

                {/* Stats */}
                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-1 bg-void/50 px-4 py-3">
                      <dt className="font-pixel text-[8px] uppercase tracking-widest text-ink-faint">
                        {stat.label}
                      </dt>
                      <dd className={`font-mono text-sm font-bold ${stat.accent}`}>{stat.value}</dd>
                    </div>
                  ))}
                </dl>

                {/* Now playing */}
                <div className="flex flex-col gap-2">
                  <span className="font-pixel text-[8px] uppercase tracking-widest text-ink-faint">
                    Now Learning
                  </span>
                  <ul className="flex flex-col gap-1.5 font-mono text-xs text-ink-muted">
                    <li className="flex items-center gap-2">
                      <span className="text-neon-lime" aria-hidden="true">
                        ✓
                      </span>
                      Godot 4 &middot; 3D level building
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-neon-lime" aria-hidden="true">
                        ✓
                      </span>
                      Blender &middot; low-poly modelling
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="animate-blink text-neon-cyan" aria-hidden="true">
                        ▸
                      </span>
                      Next: my own first 3D platformer
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}