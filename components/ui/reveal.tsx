'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  /** Stagger in milliseconds. */
  delay?: number
  className?: string
}

/**
 * Fade + rise on scroll. Uses IntersectionObserver so it costs nothing until
 * the element is close to the viewport.
 *
 * ACCESSIBILITY: if the visitor prefers reduced motion we render the content
 * immediately, visible, with no animation at all.
 */
export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={shown ? { animationDelay: `${delay}ms` } : undefined}
      className={`${shown ? 'animate-rise-in' : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}