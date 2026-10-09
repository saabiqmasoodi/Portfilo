'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

import { NeonButton } from '@/components/ui/neon-button'
import { siteConfig } from '@/lib/site-config'

type Status =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'success' }
  | { state: 'error'; message: string }

/** Anti-bot signals, collected in the browser. */
const MIN_FILL_SECONDS = 3

/** Minimal shape of the Cloudflare Turnstile global (we use a tiny subset). */
type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId?: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type ContactFormProps = {
  /**
   * Resolved on the SERVER (see components/contact.tsx). It has to arrive as a
   * prop because `RESEND_API_KEY` is not a `NEXT_PUBLIC_` variable, so
   * it is unavailable inside this Client Component.
   */
  enabled: boolean
  /**
   * Cloudflare Turnstile site key. PUBLIC by design (it is visible in the HTML).
   * When absent, no widget is rendered and no token is required — the form
   * behaves exactly as it did before Turnstile existed.
   */
  turnstileSiteKey?: string
  /** Per-request CSP nonce, needed to load Cloudflare's script. */
  nonce?: string
}

export function ContactForm({ enabled, turnstileSiteKey, nonce }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const mountedAt = useRef<number>(0)

  /** Turnstile state. All of this is inert when no site key is configured. */
  const turnstileContainer = useRef<HTMLDivElement>(null)
  const turnstileWidgetId = useRef<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const [status, setStatus] = useState<Status>({ state: 'idle' })

  useEffect(() => {
    mountedAt.current = Date.now()
  }, [])

  /**
   * Mount the Turnstile widget. No site key => this entire block is a no-op and
   * nothing from Cloudflare is ever loaded.
   */
  const mountTurnstile = useCallback(() => {
    if (!turnstileSiteKey) return
    if (turnstileWidgetId.current) return
    if (!turnstileContainer.current || !window.turnstile) return

    turnstileWidgetId.current = window.turnstile.render(turnstileContainer.current, {
      sitekey: turnstileSiteKey,
      theme: 'dark',
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(null),
      'error-callback': () => setTurnstileToken(null),
    })
  }, [turnstileSiteKey])

  // Remove the widget on unmount so a re-render never stacks duplicates.
  useEffect(() => {
    return () => {
      const id = turnstileWidgetId.current
      if (id && window.turnstile) {
        window.turnstile.remove(id)
        turnstileWidgetId.current = null
      }
    }
  }, [])

  if (!enabled) {
    return (
      <div className="flex flex-col gap-3 rounded-card border border-white/10 bg-white/[0.03] p-6">
        <p className="font-display text-lg font-semibold text-ink">Contact is not switched on yet</p>
        <p className="text-sm leading-relaxed text-ink-muted">
          The contact form needs an access key before it can send anything. When it is on, you
          will see a form here.
        </p>
        <p className="text-sm text-ink-faint">
          Saabiq can switch it on himself — see the README.
        </p>
      </div>
    )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status.state === 'sending') return

    const form = event.currentTarget
    const data = new FormData(form)

    // If Turnstile is configured, a token is mandatory — the server fails
    // CLOSED, so submitting without one would just be rejected anyway.
    if (turnstileSiteKey && !turnstileToken) {
      setStatus({
        state: 'error',
        message: 'Please wait for the bot check to finish, then try again.',
      })
      return
    }

    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      // --- anti-bot signals (server verifies these) ---
      company: String(data.get('company') ?? ''), // honeypot: must stay empty
      elapsedMs: Date.now() - mountedAt.current, // time trap: bots submit instantly
      turnstileToken: turnstileToken ?? undefined,
    }

    setStatus({ state: 'sending' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Do not leak the page URL to the API host. Same-origin anyway.
        referrerPolicy: 'same-origin',
        credentials: 'omit',
      })

      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string }

      if (!response.ok || !result.ok) {
        setStatus({
          state: 'error',
          message:
            result.error ??
            (response.status === 429
              ? 'Too many messages from your network. Please try again later.'
              : 'Something went wrong. Please try again.'),
        })
        return
      }

      // Never echo what the visitor typed back to them or into the DOM.
      form.reset()
      mountedAt.current = Date.now()
      // A Turnstile token is single-use — get a fresh one for the next message.
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.reset(turnstileWidgetId.current)
      }
      setTurnstileToken(null)
      setStatus({ state: 'success' })
    } catch {
      setStatus({
        state: 'error',
        message: 'Could not reach the server. Check your connection and try again.',
      })
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-void/60 px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-faint/60 transition-all duration-300 focus:border-neon-cyan/60 focus:bg-void/80 focus:outline-none focus:ring-2 focus:ring-neon-cyan/25'

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
      // Prevents the browser from offering to save/autofill personal data here.
      autoComplete="off"
    >
      {/* --- Accessible status message --- */}
      <div aria-live="polite" aria-atomic="true">
        {status.state === 'success' ? (
          <p className="flex items-start gap-2.5 rounded-lg border border-neon-lime/30 bg-neon-lime/10 px-4 py-3 text-sm text-neon-lime">
            <span aria-hidden="true">✓</span>
            <span>Thanks — your message was sent. Saabiq will reply when he has time.</span>
          </p>
        ) : null}
        {status.state === 'error' ? (
          <p className="flex items-start gap-2.5 rounded-lg border border-neon-magenta/30 bg-neon-magenta/10 px-4 py-3 text-sm text-neon-magenta">
            <span aria-hidden="true">!</span>
            <span>{status.message}</span>
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-pixel text-pixel-xs uppercase tracking-widest text-ink-faint">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={60}
            autoComplete="off"
            spellCheck={false}
            placeholder="What should I call you?"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-pixel text-pixel-xs uppercase tracking-widest text-ink-faint">
            Your Email <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={120}
            autoComplete="off"
            spellCheck={false}
            placeholder="Only if you want a reply"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="font-pixel text-pixel-xs uppercase tracking-widest text-ink-faint">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={1500}
          placeholder="Say hello, ask about a game, or tell me what to build next."
          className={`${inputClass} resize-y`}
        />
      </div>

      {/*
        HONEYPOT — invisible to humans, irresistible to bots.
        `aria-hidden` + `tabIndex={-1}` + `autoComplete="off"` keeps screen
        readers and autofill away from it too.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company (leave this field empty)</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {/*
        TURNSTILE — only rendered when TURNSTILE_SITE_KEY is set. The script is
        loaded through next/script with the CSP nonce so it satisfies our
        'strict-dynamic' policy; Cloudflare's origins are only added to the CSP
        by middleware.ts when a key is present.
      */}
      {turnstileSiteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            nonce={nonce}
            onLoad={mountTurnstile}
            onReady={mountTurnstile}
          />
          <div
            ref={turnstileContainer}
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            aria-label="Bot verification"
          />
        </>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-xs leading-relaxed text-ink-faint">
          {siteConfig.contact.deliveryNote}
        </p>
        <NeonButton
          tone="cyan"
          variant="solid"
          button
          className="w-full sm:w-auto"
          disabled={status.state === 'sending'}
        >
          {status.state === 'sending' ? 'Sending…' : 'Send Message'}
        </NeonButton>
      </div>
    </form>
  )
}