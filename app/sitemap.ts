import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-seo';
import { publishedServices } from '@/lib/service-snapshot';
import { serviceProfilePath } from '@/lib/service-profile-path';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['/', '/services', '/ru/services', '/ko/services', '/en/services', '/about', '/contact', '/advertising', '/korea', '/legal'];
  return [
    ...pages.map(path => ({ url: siteOrigin + path })),
    ...publishedServices.map(listing => ({ url: siteOrigin + serviceProfilePath(listing.id) })),
  ];
}
