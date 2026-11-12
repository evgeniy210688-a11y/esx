import slugs from './service-profile-slugs.json';

// Registered paths stay stable when a listing's display name is edited.
export function serviceProfilePath(id: string): string {
  if (id === '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf') return '/services/tkhay-alina';
  const slug = (slugs as Record<string, string>)[id];
  return slug ? '/services/' + encodeURIComponent(slug) : '/services/profile/' + id;
}

export function serviceProfileId(slug: string): string | undefined {
  return Object.entries(slugs).find(([, value]) => value === slug)?.[0];
}
