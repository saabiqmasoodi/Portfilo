import Image from 'next/image'

import type { Project } from '@/lib/projects'
import { statusLabel } from '@/lib/projects'
import { safeExternalUrl } from '@/lib/site-config'

import { NeonCard } from '@/components/ui/neon-card'

type GameCardProps = {
  project: Project
  index?: number
}

const accents = {
  cyan: {
    ring: 'hover:shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_28px_60px_-32px_rgba(34,211,238,0.6)]',
    cover: 'from-neon-cyan/25 via-neon-violet/10 to-transparent',
    text: 'text-neon-cyan',
    bar: 'bg-neon-cyan',
    badge: 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan',
  },
  magenta: {
    ring: 'hover:shadow-[0_0_0_1px_rgba(255,46,136,0.35),0_28px_60px_-32px_rgba(255,46,136,0.6)]',
    cover: 'from-neon-magenta/25 via-neon-violet/10 to-transparent',
    text: 'text-neon-magenta',
    bar: 'bg-neon-magenta',
    badge: 'border-neon-magenta/30 bg-neon-magenta/10 text-neon-magenta',
  },
  lime: {
    ring: 'hover:shadow-[0_0_0_1px_rgba(163,255,18,0.35),0_28px_60px_-32px_rgba(163,255,18,0.55)]',
    cover: 'from-neon-lime/25 via-neon-cyan/10 to-transparent',
    text: 'text-neon-lime',
    bar: 'bg-neon-lime',
    badge: 'border-neon-lime/30 bg-neon-lime/10 text-neon-lime',
  },
  violet: {
    ring: 'hover:shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_28px_60px_-32px_rgba(167,139,250,0.6)]',
    cover: 'from-neon-violet/25 via-neon-magenta/10 to-transparent',
    text: 'text-neon-violet',
    bar: 'bg-neon-violet',
    badge: 'border-neon-violet/30 bg-neon-violet/10 text-neon-violet',
  },
  amber: {
    ring: 'hover:shadow-[0_0_0_1px_rgba(251,191,36,0.35),0_28px_60px_-32px_rgba(251,191,36,0.55)]',
    cover: 'from-neon-amber/25 via-neon-magenta/10 to-transparent',
    text: 'text-neon-amber',
    bar: 'bg-neon-amber',
    badge: 'border-neon-amber/30 bg-neon-amber/10 text-neon-amber',
  },
} as const

/**
 * The portfolio's workhorse card: cover art placeholder, status, tool chips.
 *
 * SECURITY: `safeExternalUrl` refuses any URL that is not http(s), so a
 * `javascript:` or `data:` value could never end up in the href.
 */
export function GameCard({ project, index = 0 }: GameCardProps) {
  const accent = accents[project.accent]
  const href = safeExternalUrl(project.sourceUrl ?? '')
  const isFeatured = project.featured ?? false

  return (
    <article className="group/card h-full animate-rise-in" style={{ animationDelay: `${index * 70}ms` }}>
      <NeonCard
        raw
        tone={project.accent === 'amber' ? 'lime' : project.accent}
        corners
        className={`flex h-full flex-col ${accent.ring}`}
      >
        {/* ---------------- Cover art ---------------- */}
        <div
          className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${accent.cover} sm:h-44`}
        >
          {/* Arcade grid — always behind, and the full backdrop when a
              project has no real screenshot yet. */}
          <div className="absolute inset-0 bg-grid-fade bg-grid-fade opacity-70 transition-transform duration-700 ease-out-expo group-hover/card:scale-110" />

          {project.cover ? (
            <>
              <Image
                src={project.cover}
                alt={project.coverAlt ?? `Screenshot of ${project.title}`}
                fill
                /* Local 4:3 captures scale up; the optimiser resizes to the
                   box so we never ship the raw 144px original. */
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-cover transition-transform duration-700 ease-out-expo group-hover/card:scale-105 ${
                  project.coverFit === 'contain' ? 'object-contain p-4' : ''
                }`}
              />
              {/* Scrim: keeps the status/featured badges legible over any
                  screenshot, whatever its brightness. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-void/85 to-transparent"
              />
              {project.coverFit === 'contain' ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-void/40"
                />
              ) : null}
            </>
          ) : (
            <span
              className="relative text-6xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-out-expo group-hover/card:-translate-y-1 group-hover/card:scale-110 sm:text-7xl"
              aria-hidden="true"
            >
              {project.glyph}
            </span>
          )}

          {/* Status badge */}
          <span
            className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-pixel-xs uppercase leading-none tracking-widest backdrop-blur-md ${accent.badge}`}
          >
            {statusLabel[project.status]}
          </span>

          {/* Featured flag */}
          {isFeatured ? (
            <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-void/70 px-3 py-1.5 font-pixel text-pixel-xs uppercase leading-none tracking-widest text-ink-muted backdrop-blur-md">
              Featured
            </span>
          ) : null}

          {/* Bottom accent bar that grows on hover */}
          <span
            className={`absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-out-expo group-hover/card:scale-x-100 ${accent.bar}`}
          />
        </div>

        {/* ---------------- Body ---------------- */}
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-ink transition-colors duration-300 group-hover/card:text-white">
              {project.title}
            </h3>
            <p className={`font-mono text-xs uppercase tracking-wider ${accent.text}`}>
              {project.summary}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-ink-muted">{project.description}</p>

          {/* Tool chips */}
          <ul className="mt-auto flex flex-wrap gap-2 pt-1">
            {project.tools.map((tool) => (
              <li
                key={tool}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-ink-faint transition-colors duration-300 hover:border-white/20 hover:text-ink-muted"
              >
                {tool}
              </li>
            ))}
          </ul>

          {/* Action */}
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={`mt-1 inline-flex items-center gap-2 self-start font-display text-sm font-semibold ${accent.text} transition-transform duration-300 hover:translate-x-1`}
            >
              View project
              <span aria-hidden="true">→</span>
              <span className="sr-only-focusable">(opens in a new tab)</span>
            </a>
          ) : (
            <span className="mt-1 inline-flex items-center gap-2 self-start font-display text-sm font-semibold text-ink-faint">
              Coming soon
              <span aria-hidden="true">·</span>
            </span>
          )}
        </div>
      </NeonCard>
    </article>
  )
}