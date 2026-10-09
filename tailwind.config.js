/**
 * Tailwind CSS Design System — "Dark Arcade"
 * ---------------------------------------------------------------------------
 * Fonts are wired to CSS variables that `app/layout.tsx` fills in via
 * `next/font/google`. IMPORTANT: `next/font` SELF-HOSTS the font files at build
 * time, so the browser never contacts fonts.googleapis.com. That means:
 *   1. No third-party font CDN request  -> visitor IPs are not leaked to Google.
 *   2. `font-src` in our CSP can stay at `'self'` (maximum privacy).
 *
 * To swap a font, change it in app/layout.tsx only. Nothing here needs to know
 * the actual family name.
 *
 * @type {import('tailwindcss').Config}
 */
const config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ------------------------------------------------------------------
       * TYPOGRAPHY
       * ---------------------------------------------------------------- */
      fontFamily: {
        // Body copy — Plus Jakarta Sans (friendly + very legible)
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Big titles — Space Grotesk (geometric, playful, sharp)
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Retro micro-labels — Press Start 2P (ALWAYS uppercase, tiny sizes)
        pixel: ['var(--font-pixel)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Code + stats — JetBrains Mono
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Pixel fonts need generous line-height or they look broken.
        'pixel-xs': ['0.5rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'pixel-sm': ['0.625rem', { lineHeight: '1.7' }],
        'pixel-md': ['0.75rem', { lineHeight: '1.8' }],
      },

      /* ------------------------------------------------------------------
       * COLOR — synthwave / dark arcade
       * ---------------------------------------------------------------- */
      colors: {
        // Base surfaces (deep slate / charcoal, never pure black)
        void: '#05060d',
        surface: {
          DEFAULT: '#0a0d18',
          raised: '#111629',
          overlay: '#171d33',
        },
        // Foreground
        ink: {
          DEFAULT: '#e9edfa',
          muted: '#9aa4c2',
          faint: '#6a7392',
        },
        // Neon accents
        neon: {
          magenta: '#ff2e88',
          pink: '#f472b6',
          cyan: '#22d3ee',
          lime: '#a3ff12', // "arcade green"
          violet: '#a78bfa',
          amber: '#fbbf24',
        },
        grid: 'rgba(148,163,184,0.07)',
      },

      /* ------------------------------------------------------------------
       * SHADOWS & GLOWS
       * ---------------------------------------------------------------- */
      boxShadow: {
        'glow-cyan': '0 0 0 1px rgba(34,211,238,0.35), 0 0 24px -4px rgba(34,211,238,0.45)',
        'glow-magenta': '0 0 0 1px rgba(255,46,136,0.35), 0 0 24px -4px rgba(255,46,136,0.45)',
        'glow-lime': '0 0 0 1px rgba(163,255,18,0.35), 0 0 24px -4px rgba(163,255,18,0.4)',
        'glow-violet': '0 0 0 1px rgba(167,139,250,0.35), 0 0 24px -4px rgba(167,139,250,0.45)',
        'card': '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 50px -30px rgba(0,0,0,0.9)',
      },

      /* ------------------------------------------------------------------
       * BACKGROUNDS
       * ---------------------------------------------------------------- */
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, rgba(5,6,13,0) 0%, rgba(5,6,13,0.85) 70%, #05060d 100%), linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)',
        'dot-grid': 'radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)',
        'neon-aurora':
          'radial-gradient(60% 55% at 15% 10%, rgba(167,139,250,0.22) 0%, transparent 60%), radial-gradient(50% 50% at 85% 20%, rgba(34,211,238,0.18) 0%, transparent 60%), radial-gradient(60% 60% at 50% 100%, rgba(255,46,136,0.14) 0%, transparent 65%)',
      },
      backgroundSize: {
        'grid-fade': '100% 100%, 44px 44px, 44px 44px',
        'dot-grid': '22px 22px',
      },

      /* ------------------------------------------------------------------
       * ANIMATIONS
       * All of these are disabled automatically for users who ask for
       * reduced motion (see globals.css -> prefers-reduced-motion).
       * ---------------------------------------------------------------- */
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-22px,0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.55', filter: 'blur(28px)' },
          '50%': { opacity: '0.9', filter: 'blur(36px)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '42%': { opacity: '1' },
          '45%': { opacity: '0.55' },
          '48%': { opacity: '1' },
          '92%': { opacity: '1' },
          '94%': { opacity: '0.7' },
        },
        'grid-move': {
          '0%': { backgroundPosition: '0 0, 0 0, 0 0' },
          '100%': { backgroundPosition: '0 0, 0 44px, 0 44px' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shine: {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(220%) skewX(-18deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'caret-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 11s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 7s ease-in-out infinite',
        blink: 'blink 1.1s step-end infinite',
        flicker: 'flicker 6s linear infinite',
        'grid-move': 'grid-move 3.2s linear infinite',
        'scan-line': 'scan-line 9s linear infinite',
        shine: 'shine 2.4s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        'rise-in': 'rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'caret-blink': 'caret-blink 1.05s step-end infinite',
      },

      /* ------------------------------------------------------------------
       * MISC
       * ---------------------------------------------------------------- */
      borderRadius: {
        card: '1rem',
        panel: '1.25rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      maxWidth: {
        shell: '76rem',
      },
    },
  },
  plugins: [],
}

module.exports = config