'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

type NeonCardProps = {
  children: ReactNode
  className?: string
  /** Accent used for the hover border and cursor spotlight. */
  tone?: 'cyan' | 'magenta' | 'lime' | 'violet'
  /** Adds the retro corner brackets. */
  corners?: boolean
  /** Removes the default padding so you can control layout fully. */
  raw?: boolean
}

const rgb = {
  cyan: '34, 211, 238',
  magenta: '255, 46, 136',
  lime: '163, 255, 18',
  violet: '167, 139, 250',
} as const

/**
 * The site's core surface: glassmorphism + a glowing border + a spotlight that
 * follows the cursor.
 *
 * Implementation notes:
 *  • Pointer position is written straight to CSS custom properties on the
 *    node. No React state, so moving the mouse never triggers a render.
 *  • Updates are coalesced into one `requestAnimationFrame`, so a fast mouse
 *    cannot cause hundreds of style writes per second.
 *  • All of it is skipped under prefers-reduced-motion.
 */
export function NeonCard({
  children,
  className = '',
  tone = 'cyan',
  corners = false,
  raw = false,
}: NeonCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  /**
   * One native `pointermove` listener attached in an effect, rather than a React
   * `onPointerMove` prop. Native listeners are fire-and-forget: no re-render is
   * triggered, we only write two CSS custom properties.
   */
  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Skip the work entirely for visitors who asked for reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const onMove = (event: Event) => {
      // Coalesce to one write per animation frame.
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const { clientX, clientY } = event as PointerEvent
        const rect = node.getBoundingClientRect()
        node.style.setProperty('--x', `${clientX - rect.left}px`)
        node.style.setProperty('--y', `${clientY - rect.top}px`)
      })
    }

    node.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      node.removeEventListener('pointermove', onMove)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={ref}
      style={{ '--spot': rgb[tone] } as CSSProperties}
      className={[
        'group relative isolate overflow-hidden rounded-card border border-white/10',
        'bg-white/[0.035] shadow-card backdrop-blur-xl',
        'transition-all duration-500 ease-out-expo',
        'hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.055]',
        'hover:shadow-[0_0_0_1px_rgba(var(--spot),0.35),0_28px_60px_-32px_rgba(var(--spot),0.65)]',
        corners ? 'pixel-corners' : '',
        raw ? '' : 'p-6 sm:p-7',
        className,
      ].join(' ')}
    >
      {/* Cursor spotlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(240px circle at var(--x, 50%) var(--y, 50%), rgba(var(--spot),0.16), transparent 70%)',
        }}
      />
      {/* Top edge highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {children}
    </div>
  )
}