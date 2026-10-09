import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/site-config'

/**
 * PWA manifest. Keep it minimal: no shortcuts, no share targets, no
 * related-applications. Nothing here can be used to fingerprint a device.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.role}`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#05060d',
    theme_color: '#05060d',
    categories: ['games', 'portfolio', 'personal'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  }
}