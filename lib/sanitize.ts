/**
 * lib/sanitize.ts — Input sanitisation for the contact form
 * ---------------------------------------------------------------------------
 * Rule zero of defence: NEVER trust anything that arrives over the network.
 * Every field is treated as hostile.
 *
 * What this strips:
 *   • HTML/script tags            -> stored-XSS in admin inboxes / dashboards
 *   • Control characters           -> log injection, terminal escape abuse
 *   • Zero-width & bidi override  -> invisible-text spoofing tricks
 *   • HTML entities                -> `&lt;script&gt;` reconstituting on render
 *   • Excess whitespace            -> layout/spam abuse
 *   • Overlong values              -> payload-size / storage abuse
 *
 * Note the philosophy: we REJECT rather than silently "escape". If a submission
 * contains markup, it is refused outright instead of being quietly rewritten,
 * because a real person never types `<script>` into a "message" box.
 */

/** Characters that must never survive: C0/C1 controls, DEL, zero-width, bidi. */
const FORBIDDEN_CHARS =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/g

/** Anything that looks like markup or a protocol handler. */
const MARKUP = /<\s*\/?\s*[a-z!/?][^>]*>|<\s*script|javascript\s*:|data\s*:\s*text\/html|vbscript\s*:/gi

/** Common entity spellings that browsers re-expand into markup. */
const ENTITIES = /&(?:#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z]{2,10});/g

export type SanitizeResult =
  | { ok: true; value: string }
  | { ok: false; reason: string }

/**
 * Normalise and clean a free-text field.
 * @param input    Untrusted value of unknown type.
 * @param maxLength Hard cap enforced AFTER trimming.
 */
export function sanitizeText(input: unknown, maxLength: number): SanitizeResult {
  if (typeof input !== 'string') {
    return { ok: false, reason: 'must be text' }
  }

  // Cheap DoS guard before any regex work on very large strings.
  if (input.length > maxLength * 4) {
    return { ok: false, reason: 'too long' }
  }

  let value = input.normalize('NFKC')

  if (MARKUP.test(value)) {
    return { ok: false, reason: 'contains markup' }
  }
  MARKUP.lastIndex = 0

  value = value
    .replace(FORBIDDEN_CHARS, '')
    .replace(ENTITIES, '')
    // Collapse runs of spaces/tabs, and cap consecutive newlines.
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\r\n]/g, '\n')
    .trim()

  if (value.length === 0) {
    return { ok: false, reason: 'is empty' }
  }
  if (value.length > maxLength) {
    return { ok: false, reason: `must be ${maxLength} characters or fewer` }
  }

  return { ok: true, value }
}

/** Constrain a value to `[A-Za-z0-9 ._'-]` after cleaning. */
export function sanitizeName(input: unknown, maxLength = 60): SanitizeResult {
  const base = sanitizeText(input, maxLength)
  if (!base.ok) return base

  const value = base.value.replace(/[^A-Za-z0-9 ._'-]/g, '').replace(/\s{2,}/g, ' ').trim()
  if (value.length < 2) {
    return { ok: false, reason: 'must be at least 2 characters' }
  }
  if (value.length > maxLength) {
    return { ok: false, reason: `must be ${maxLength} characters or fewer` }
  }
  return { ok: true, value }
}

/**
 * Pragmatic email check. Not RFC 5322 — just strict enough that garbage
 * never reaches the mail provider, while never rejecting valid addresses.
 */
export function sanitizeEmail(input: unknown, maxLength = 120): SanitizeResult {
  const base = sanitizeText(input, maxLength)
  if (!base.ok) return base

  const value = base.value.toLowerCase()
  const ok = /^[^\s@,;:<>()[\]\\"]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(
    value,
  )
  if (!ok) {
    return { ok: false, reason: 'does not look like a valid email address' }
  }
  if (value.length > 254) {
    return { ok: false, reason: 'is too long' }
  }
  return { ok: true, value }
}

/**
 * Escape a value that will be interpolated into an HTML string we build
 * ourselves (e.g. the email subject line). Belt and braces alongside the
 * strip-everything-above approach.
 */
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string,
  )
}