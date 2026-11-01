import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-seo';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/services', '/about', '/contact', '/advertising', '/korea', '/legal', '/services/tkhay-alina'].map(path => ({ url: siteOrigin + path }));
}
