'use client'

import { useEffect, useState } from 'react'

type CountdownProps = {
  years: number
  months: number
  days: number
  isBirthdayToday: boolean
}

/**
 * Live countdown to the next birthday.
 *
 * PRIVACY: the browser is given only `{ years, months, days }`, never the
 * actual date. Someone can see "next birthday in 214 days" but cannot work
 * out the day, month or year of birth from the client bundle.
 *
 * This component only ticks days->hours->minutes->seconds from its own
 * starting point, so it does not need the date either.
 */
export function BirthdayCountdown({ years, months, days, isBirthdayToday }: CountdownProps) {
  const [remaining, setRemaining] = useState(days * 86_400_000)

  useEffect(() => {
    // Elapsed time since hydration, so the countdown is consistent client-side.
    const startedAt = Date.now()
    const initial = days * 86_400_000

    const tick = () => {
      const elapsed = Date.now() - startedAt
      setRemaining(Math.max(0, initial - elapsed))
    }

    const id = window.setInterval(tick, 1_000)
    return () => window.clearInterval(id)
  }, [days])

  const totalSeconds = Math.floor(remaining / 1000)
  const d = Math.floor(totalSeconds / 86_400)
  const h = Math.floor((totalSeconds % 86_400) / 3_600)
  const m = Math.floor((totalSeconds % 3_600) / 60)
  const s = totalSeconds % 60

  if (isBirthdayToday) {
    return (
      <span className="font-pixel text-pixel-xs uppercase tracking-widest text-neon-magenta">
        ★ Happy birthday to me ★
      </span>
    )
  }

  const cells: Array<[number, string]> = [
    [years * 12 + months, 'mo'],
    [d, 'd'],
    [h, 'h'],
    [m, 'm'],
    [s, 's'],
  ]

  return (
    <span className="flex items-center gap-1.5" aria-label="Time until my next birthday">
      {cells.map(([value, label], index) => (
        <span key={label} className="flex items-baseline gap-1.5">
          {index > 0 ? <span className="text-ink-faint">:</span> : null}
          <span className="font-mono text-sm font-bold tabular-nums text-neon-amber">
            {String(value).padStart(2, '0')}
          </span>
          <span className="font-pixel text-[8px] uppercase text-ink-faint">{label}</span>
        </span>
      ))}
    </span>
  )
}