import type { ReactNode } from 'react'

type PixelBadgeProps = {
  children: ReactNode
  /** Accent colour. */
  tone?: 'cyan' | 'magenta' | 'lime' | 'violet' | 'amber'
  /** Optional pulsing dot on the left. */
  dot?: boolean
  className?: string
}

const tones = {
  cyan: 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan',
  magenta: 'border-neon-magenta/30 bg-neon-magenta/10 text-neon-magenta',
  lime: 'border-neon-lime/30 bg-neon-lime/10 text-neon-lime',
  violet: 'border-neon-violet/30 bg-neon-violet/10 text-neon-violet',
  amber: 'border-neon-amber/30 bg-neon-amber/10 text-neon-amber',
} as const

const dots = {
  cyan: 'bg-neon-cyan',
  magenta: 'bg-neon-magenta',
  lime: 'bg-neon-lime',
  violet: 'bg-neon-violet',
  amber: 'bg-neon-amber',
} as const

/**
 * Tiny retro label. Uses Press Start 2P, so keep the text SHORT (2-3 words)
 * and ALWAYS uppercase — pixel fonts are unreadable at small sizes otherwise.
 */
export function PixelBadge({
  children,
  tone = 'cyan',
  dot = false,
  className = '',
}: PixelBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-pixel-xs uppercase leading-none tracking-widest backdrop-blur-md ${tones[tone]} ${className}`}
    >
      {dot ? (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dots[tone]}`}
          />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dots[tone]}`} />
        </span>
      ) : null}
      {children}
    </span>
  )
}