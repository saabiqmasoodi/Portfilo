'use client'

import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type CommonProps = {
  children: ReactNode
  tone?: 'cyan' | 'magenta' | 'lime'
  variant?: 'solid' | 'ghost'
  className?: string
}

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>
type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

/**
 * Rendered as: an external <a>, an internal <Link>, or a real <button> when
 * `button` is set. `href` wins over `button` if both are passed.
 */
type NeonButtonProps = CommonProps & {
  href?: string
  /** Adds target=_blank + rel="noopener noreferrer nofollow". */
  external?: boolean
  /** Render a native <button type="submit">. */
  button?: boolean
} & (AnchorProps | NativeButtonProps)

const styles = {
  cyan: {
    solid:
      'bg-neon-cyan text-void hover:bg-white hover:shadow-[0_0_36px_-6px_rgba(34,211,238,0.85)]',
    ghost:
      'border border-neon-cyan/40 text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10 hover:shadow-glow-cyan',
  },
  magenta: {
    solid:
      'bg-neon-magenta text-white hover:bg-white hover:text-void hover:shadow-[0_0_36px_-6px_rgba(255,46,136,0.85)]',
    ghost:
      'border border-neon-magenta/40 text-neon-magenta hover:border-neon-magenta hover:bg-neon-magenta/10 hover:shadow-glow-magenta',
  },
  lime: {
    solid:
      'bg-neon-lime text-void hover:bg-white hover:shadow-[0_0_36px_-6px_rgba(163,255,18,0.75)]',
    ghost:
      'border border-neon-lime/40 text-neon-lime hover:border-neon-lime hover:bg-neon-lime/10 hover:shadow-glow-lime',
  },
} as const

/**
 * Pill button with a shine sweep on hover.
 *
 * SECURITY: for any `external` link we hard-code `rel="noopener noreferrer"`
 * so the destination can never reach back through `window.opener`
 * (tabnabbing) or read the referrer.
 */
export function NeonButton({
  children,
  href,
  tone = 'cyan',
  variant = 'ghost',
  className = '',
  external = false,
  button = false,
  ...rest
}: NeonButtonProps) {
  const classes = [
    'group/btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full',
    'px-6 py-3 font-display text-sm font-semibold tracking-tight',
    'transition-all duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0',
    styles[tone][variant],
    className,
  ].join(' ')

  const content = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
      {/* Shine sweep */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
      >
        <span className="absolute -inset-y-8 left-0 w-1/3 animate-shine bg-white/25 blur-md" />
      </span>
    </>
  )

  if (button) {
    return (
      <button type="submit" className={classes} {...(rest as NativeButtonProps)}>
        {content}
      </button>
    )
  }

  if (!href) {
    return (
      <span className={classes} {...(rest as AnchorProps)}>
        {content}
      </span>
    )
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={classes}
        {...(rest as AnchorProps)}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} {...(rest as AnchorProps)}>
      {content}
    </Link>
  )
}