import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/site-config'

/**
 * robots.txt — generated, so it always matches the configured domain.
 *
 * Note what is NOT here: no personal data, no sitemaps of anything private.
 * `/api/` is disallowed so the contact endpoint is never crawled or cached.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}