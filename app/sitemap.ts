import { directoryTopics } from '@/lib/directory-topics';
import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-seo';
import { getPublishedServices } from '@/lib/service-live';
import { connection } from 'next/server';
import { serviceProfilePath } from '@/lib/service-profile-path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const publishedServices = await getPublishedServices();
  const pages = ['/', '/services', '/ru/services', '/ko/services', '/en/services', '/about', '/contact', '/advertising', '/korea', '/legal'];
  return [
    ...pages.map(path => ({ url: siteOrigin + path })),
    ...directoryTopics.map(topic => ({ url: siteOrigin + '/services/category/' + topic.slug })),
    ...publishedServices.map(listing => ({ url: siteOrigin + serviceProfilePath(listing.id) })),
  ];
}
