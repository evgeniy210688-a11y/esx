import type { Metadata } from 'next';
export const siteOrigin = 'https://www.88esx.com';
export function publicPageMetadata(path: string, title: string, description: string): Metadata {
  return { title, description, alternates: { canonical: siteOrigin + path },
    openGraph: { type: 'website', siteName: 'ESX', url: siteOrigin + path, title, description },
    twitter: { card: 'summary', title, description } };
}
