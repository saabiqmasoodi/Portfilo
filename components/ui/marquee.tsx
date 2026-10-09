import type { ReactNode } from 'react'

type MarqueeProps = {
  items: string[]
  /** Seconds for one full loop. */
  speed?: number
  tone?: 'cyan' | 'magenta' | 'lime'
}

/**
 * Endless retro ticker.
 *
 * The list is duplicated and translated -50%, which is the standard CSS-only
 * loop. `aria-hidden` on the copy stops screen readers from announcing every
 * item twice. The animation is neutralised by prefers-reduced-motion.
 */
export function Marquee({ items, speed = 28, tone = 'cyan' }: MarqueeProps) {
  const tones = {
    cyan: 'text-neon-cyan',
    magenta: 'text-neon-magenta',
    lime: 'text-neon-lime',
  } as const

  // Pauses on hover so it stays readable. `group-hover:[animation-play-state:paused]`
  // below is a CSS utility, not JS, so there is no re-render on hover.
  return (
    <div className="group relative flex overflow-hidden border-y border-white/10 bg-white/[0.02] py-4">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void to-transparent" />

      <div
        className="flex shrink-0 animate-marquee items-center gap-8 pr-8 group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center gap-8 pr-8"
            aria-hidden={copy === 1}
          >
            {items.map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-8">
                <span
                  className={`font-pixel text-pixel-sm uppercase tracking-widest ${tones[tone]}`}
                >
                  {item}
                </span>
                <span className="h-1.5 w-1.5 rotate-45 bg-white/25" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}