'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { safeExternalUrl, siteConfig } from '@/lib/site-config'

const links = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Games' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

/**
 * Sticky header with a scroll-spy highlight and a mobile drawer.
 *
 * Uses plain <a> anchors rather than <Link> on purpose: Next's client-side
 * prefetch would cache a payload containing a CSP nonce from an earlier
 * request, which the browser then rejects.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)

      // Highlight whichever section occupies the middle of the viewport.
      const middle = window.innerHeight / 2
      let current = ''
      for (const link of links) {
        const node = document.querySelector(link.href)
        if (!node) continue
        const rect = node.getBoundingClientRect()
        if (rect.top <= middle && rect.bottom >= middle) current = link.href
      }
      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const github = safeExternalUrl(siteConfig.social.github)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/10 bg-void/80 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="shell flex h-16 items-center justify-between gap-4" aria-label="Main">
        {/* Logo */}
        <a href="#home" className="group flex items-center gap-2.5">
          {/*
            Site monogram, NOT the Basement game art — that logo belongs on
            its own project card. See public/images/games/the-basement.png.
          */}
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-neon-cyan/40 bg-void/60">
            <Image
              src="/icon.svg"
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-contain"
              loading="eager"
              priority
            />
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-ink">
            {siteConfig.shortName}
            <span className="text-neon-magenta">.</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`relative rounded-full px-4 py-2 font-display text-sm font-medium transition-colors duration-300 ${
                  active === link.href
                    ? 'text-neon-cyan'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {link.label}
                {active === link.href ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 -bottom-0.5 h-px bg-neon-cyan"
                  />
                ) : null}
              </a>
            </li>
          ))}
          {github ? (
            <li className="ml-2">
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="rounded-full border border-white/10 px-4 py-2 font-display text-sm font-medium text-ink-muted transition-all duration-300 hover:border-neon-lime/40 hover:text-neon-lime"
              >
                GitHub ↗
              </a>
            </li>
          ) : null}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-ink transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan md:hidden"
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                open ? 'top-1.5 rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-opacity duration-200 ${
                open ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                open ? 'top-1.5 -rotate-45' : 'top-3'
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-white/10 bg-void/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out-expo md:hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="shell flex flex-col gap-1 py-4">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-4 py-3 font-display text-base font-medium text-ink-muted transition-colors hover:bg-white/5 hover:text-neon-cyan"
              >
                {link.label}
                <span aria-hidden="true" className="font-mono text-xs">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Subtle top gradient line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent"
      />
    </header>
  )
}