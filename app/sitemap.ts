import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/site-config'

/**
 * Only the public home page exists. There is deliberately no per-project page
 * that could leak anything, and no "contact" page URL that could be scraped.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}