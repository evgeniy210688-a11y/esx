import slugs from './service-profile-slugs.json';

// Registered paths stay stable when a listing's display name is edited.
export function serviceProfilePath(id: string): string {
  const slug = (slugs as Record<string, string>)[id];
  return slug ? '/services/' + encodeURIComponent(slug) : '/services/profile/' + id;
}

export function serviceProfileId(slug: string): string | undefined {
  return Object.entries(slugs).find(([, value]) => value === slug)?.[0];
}
