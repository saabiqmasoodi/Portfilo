/**
 * app/opengraph-image.tsx — social share card, generated at request time.
 *
 * Rendered as a PNG by `next/og`. Uses only the built-in font (no font file
 * is fetched), so this route makes zero external requests.
 *
 * Contains nothing personal: no email, no location precision beyond "Srinagar",
 * no date of birth.
 */
import { ImageResponse } from 'next/og'

import { siteConfig } from '@/lib/site-config'

export const runtime = 'nodejs'
export const alt = `${siteConfig.name} — ${siteConfig.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  const tags = ['Scratch', 'Godot 4', 'Blender', 'Arduino', 'Robotics']

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: '#05060d',
          backgroundImage:
            'radial-gradient(70% 60% at 12% 8%, rgba(167,139,250,0.30) 0%, transparent 60%), radial-gradient(60% 60% at 88% 22%, rgba(34,211,238,0.26) 0%, transparent 60%), radial-gradient(70% 70% at 55% 105%, rgba(255,46,136,0.22) 0%, transparent 65%)',
          color: '#e9edfa',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Pixel eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', width: 48, height: 3, backgroundColor: '#22d3ee' }} />
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: 6,
              color: '#9aa4c2',
              textTransform: 'uppercase',
            }}
          >
            Portfolio
          </div>
        </div>

        {/* Name + role */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
            <div style={{ display: 'flex', fontSize: 40, color: '#9aa4c2' }}>Hi, I&apos;m</div>
            <div
              style={{
                display: 'flex',
                fontSize: 104,
                fontWeight: 700,
                letterSpacing: -3,
                backgroundImage: 'linear-gradient(100deg,#22d3ee,#a78bfa,#ff2e88)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Saabiq.
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: '#22d3ee', letterSpacing: 1 }}>
            {siteConfig.role}
          </div>
          {/* satori (next/og) requires an explicit `display` on any element
              with more than one child, so this is `flex` even though it looks
              like plain text. */}
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              color: '#9aa4c2',
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            I make games, model in 3D, and build robots — from {siteConfig.location.city},{' '}
            {siteConfig.location.region}.
          </div>
        </div>

        {/* Tag row */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                display: 'flex',
                padding: '12px 22px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.14)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                fontSize: 22,
                color: '#c9d1e8',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}