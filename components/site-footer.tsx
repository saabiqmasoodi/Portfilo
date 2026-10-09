import { NeonButton } from '@/components/ui/neon-button'
import { safeExternalUrl, siteConfig } from '@/lib/site-config'

export function SiteFooter() {
  const github = safeExternalUrl(siteConfig.social.github)
  const scratch = safeExternalUrl(siteConfig.social.scratch)
  const year = new Date().getUTCFullYear()

  return (
    <footer className="relative mt-8 border-t border-white/10 bg-void/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-violet/50 to-transparent"
      />

      <div className="shell flex flex-col gap-8 py-10">
        {/* Top row */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2">
            <p className="font-display text-lg font-bold text-ink">
              {siteConfig.name}
              <span className="text-neon-magenta">.</span>
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
              {siteConfig.role}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <NeonButton href="#home" tone="cyan" variant="ghost" className="px-5 py-2.5">
              Back to Top ↑
            </NeonButton>
            {github ? (
              <NeonButton href={github} tone="lime" variant="ghost" external className="px-5 py-2.5">
                GitHub ↗
              </NeonButton>
            ) : null}
            {scratch ? (
              <NeonButton href={scratch} tone="magenta" variant="ghost" external className="px-5 py-2.5">
                Scratch ↗
              </NeonButton>
            ) : null}
          </div>
        </div>

        {/* Privacy statement */}
        <div className="rounded-card border border-white/10 bg-white/[0.02] p-5">
          <p className="font-pixel text-[8px] uppercase tracking-[0.3em] text-ink-faint">
            Privacy Notice
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
            This website does not collect analytics, set cookies, or store anything you type. It
            contains no advertising or third-party trackers. Saabiq&apos;s date of birth, email
            address, phone number and home address are deliberately not published here — the age
            you see is calculated on the server and refreshed automatically.
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 font-mono text-[11px] text-ink-faint sm:flex-row sm:items-center">
          <p>
            © {year} {siteConfig.shortName}. Built with care in {siteConfig.location.city}.
          </p>
          <p className="flex items-center gap-1.5">
            {siteConfig.builtWith}
            <span aria-hidden="true" className="text-neon-magenta">
              ♥
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}