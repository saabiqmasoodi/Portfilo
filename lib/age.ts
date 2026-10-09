/**
 * lib/age.ts — Dynamic age calculation (SERVER ONLY)
 * ---------------------------------------------------------------------------
 * PRIVACY DESIGN
 * Saabiq is a minor, so his exact date of birth is NOT a public piece of data.
 * That is why:
 *
 *   1. The DOB lives in a NON-public env var (`BIRTHDATE`). Because it lacks
 *      the `NEXT_PUBLIC_` prefix it is stripped from the client bundle at build
 *      time and can only be read on the server.
 *   2. `import 'server-only'` makes the build FAIL LOUDLY if this file is ever
 *      accidentally imported from a Client Component — a safety net so the
 *      value can never end up in browser-visible JavaScript.
 *   3. The browser only ever receives the resulting integer (e.g. `11`).
 *      Someone can see that he is 11, but cannot derive 30 September 2015.
 *
 * GRACEFUL DEGRADATION
 * A missing or malformed `BIRTHDATE` must never take the whole site down. On a
 * host such as Vercel the variable is configured separately from the code, and
 * forgetting it previously produced a 500 on every page load. Instead we now
 * return `null`, log a single warning, and every caller renders a tidy fallback
 * (the age panel simply disappears). When `BIRTHDATE` IS set, everything works
 * exactly as before.
 *
 * UPDATES AUTOMATICALLY
 * The pages render dynamically (see `dynamic = 'force-dynamic'` in
 * app/layout.tsx), so `getAgeInfo()` runs on every request. Turn 12? The site
 * says 12. No rebuild, no manual edit. Timezone comparisons are done in UTC so
 * a visitor in another country never sees the age flip a day early.
 */
import 'server-only'

/**
 * Plausibility guard: a misconfigured BIRTHDATE should never print a silly age.
 * We hide the value rather than throw, because a missing optional display value
 * must not crash an otherwise healthy page.
 */
const MIN_PLAUSIBLE_AGE = 1
const MAX_PLAUSIBLE_AGE = 120

/** Warn at most once per message so a misconfiguration cannot flood the logs. */
const warned = new Set<string>()
function warnOnce(message: string) {
  if (warned.has(message)) return
  warned.add(message)
  console.warn('[age]', message)
}

export type AgeInfo = {
  /** Whole years since birth, recalculated on the server for every request. */
  age: number
  /** `{ years, months, days }` remaining until the next birthday. */
  countdown: { years: number; months: number; days: number }
  /** True when today IS the birthday. Used to fire the confetti easter egg. */
  isBirthdayToday: boolean
}

/** Parsed DOB, or `null` when BIRTHDATE is absent/invalid. Never throws. */
function getBirthDate(): Date | null {
  const raw = process.env.BIRTHDATE?.trim()

  if (!raw) {
    warnOnce(
      'BIRTHDATE is not set — the age and birthday countdown are hidden. Set ' +
        "BIRTHDATE=YYYY-MM-DD in your hosting provider's environment variables " +
        '(e.g. Vercel -> Settings -> Environment Variables) to show them.',
    )
    return null
  }

  // Strict YYYY-MM-DD validation — rejects 2015-9-3, 31/09/2015, "hello", etc.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (!match?.[1] || !match[2] || !match[3]) {
    warnOnce('BIRTHDATE must look exactly like YYYY-MM-DD (for example 2010-01-31).')
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(Date.UTC(year, month - 1, day))

  // Rejects impossible dates like 2015-02-30 (JS silently rolls these over).
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    warnOnce(`BIRTHDATE "${raw}" is not a real calendar date.`)
    return null
  }

  return date
}

/** Difference in whole years between `dob` and `now`, both read in UTC. */
function diffInWholeYears(dob: Date, now: Date) {
  let age = now.getUTCFullYear() - dob.getUTCFullYear()
  const monthDelta = now.getUTCMonth() - dob.getUTCMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < dob.getUTCDate())) {
    age -= 1
  }
  return age
}

/**
 * Compute everything the UI needs about age/birthday in one server call.
 *
 * Returns `null` when BIRTHDATE is missing or invalid — callers MUST render a
 * graceful fallback rather than assume a value. This function never throws.
 *
 * @param now Injectable for tests.
 */
export function getAgeInfo(now: Date = new Date()): AgeInfo | null {
  const dob = getBirthDate()
  if (!dob) return null

  const age = diffInWholeYears(dob, now)

  if (age < MIN_PLAUSIBLE_AGE || age > MAX_PLAUSIBLE_AGE) {
    warnOnce(
      `BIRTHDATE "${process.env.BIRTHDATE}" produces an implausible age (${age}). Check the year.`,
    )
    return null
  }

  const isBirthdayToday =
    now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() === dob.getUTCDate()

  // Next birthday: same month/day, in `now`'s year or the following one.
  let next = Date.UTC(now.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate())
  if (next <= now.getTime()) {
    next = Date.UTC(now.getUTCFullYear() + 1, dob.getUTCMonth(), dob.getUTCDate())
  }

  /*
   * Split the remaining time into whole months + leftover days.
   *
   * Why not just loop month by month? Because `setUTCMonth` overflows: on
   * 31 January, adding one month lands on 3 March. Counting months arithmetically
   * and clamping the day to each target month's length avoids that entirely.
   */
  const targetDay = dob.getUTCDate()

  /** `from` plus `months`, landing on `targetDay`, clamped to month length. */
  const addMonths = (from: Date, months: number): Date => {
    const probe = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, 1))
    const daysInMonth = new Date(
      Date.UTC(probe.getUTCFullYear(), probe.getUTCMonth() + 1, 0),
    ).getUTCDate()
    return new Date(
      Date.UTC(probe.getUTCFullYear(), probe.getUTCMonth(), Math.min(targetDay, daysInMonth)),
    )
  }

  const nextDate = new Date(next)
  const startYear = now.getUTCFullYear()
  const nextYear = nextDate.getUTCFullYear()

  // Total whole months between `now` and `next`, then dial back one if we have
  // not yet reached the target day-of-month this month.
  let totalMonths = (nextYear - startYear) * 12 + (nextDate.getUTCMonth() - now.getUTCMonth())
  if (addMonths(now, totalMonths).getTime() > next) {
    totalMonths -= 1
  }

  const monthsElapsed = addMonths(now, Math.max(0, totalMonths))
  const leftoverDays = Math.max(
    0,
    Math.round((next - monthsElapsed.getTime()) / 86_400_000),
  )

  const years = Math.floor(Math.max(0, totalMonths) / 12)
  const months = Math.max(0, totalMonths) % 12

  return { age, countdown: { years, months, days: leftoverDays }, isBirthdayToday }
}

/** "11" -> "11 years old" (grammar-aware for age 1). */
export function formatAge(age: number): string {
  return `${age} ${ageUnit(age)}`
}

/** "11" -> "years old", "1" -> "year old". Used when the number is styled separately. */
export function ageUnit(age: number): string {
  return age === 1 ? 'year old' : 'years old'
}
