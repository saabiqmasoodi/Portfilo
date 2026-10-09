import type { ReactNode } from 'react'

type SectionHeadingProps = {
  /** Tiny retro eyebrow, e.g. "02 / PROJECTS". */
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
}

const accentCycle = [
  'group-hover:text-neon-cyan',
  'group-hover:text-neon-magenta',
  'group-hover:text-neon-lime',
  'group-hover:text-neon-violet',
] as const

/** Consistent section header: pixel eyebrow + display title + lede. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <header
      className={`group relative flex flex-col gap-4 ${
        align === 'center' ? 'items-center text-center' : 'items-start'
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="h-px w-8 bg-gradient-to-r from-neon-cyan to-transparent" />
        <span className="text-pixel-xs uppercase tracking-[0.3em] text-ink-faint">
          {eyebrow}
        </span>
      </span>

      <h2
        className={`max-w-2xl font-display text-3xl font-bold leading-[1.1] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={`max-w-2xl text-base leading-relaxed text-ink-muted ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {description}
        </p>
      ) : null}
    </header>
  )
}

export { accentCycle }