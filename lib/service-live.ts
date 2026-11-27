import { cache } from 'react';
import type { ServiceListing } from './service-directory';
import type { ProfileContent } from './specialist-content';

export const serviceCacheTag = 'published-service-listings';
export type PublicService = ServiceListing & { profile_content: ProfileContent | null };

export async function serviceRead<T>(path: string): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Service database is not configured');
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key },
    next: { revalidate: 30, tags: [serviceCacheTag] },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Service database unavailable (${response.status})`);
  return response.json() as Promise<T>;
}

// Only the published-only view is read. Never resurrect archived/deleted rows
// from the emergency snapshot when a record is absent or the database fails.
export const getPublishedServices = cache(async (): Promise<PublicService[]> => {
  const rows: PublicService[] = [];
  let cursor = '';
  for (;;) {
    const page = await serviceRead<PublicService[]>(
      'esx_public_service_listings?select=*&order=id&limit=100' + (cursor ? `&id=gt.${cursor}` : ''),
    );
    rows.push(...page);
    if (page.length < 100) return rows;
    const next = page[page.length - 1].id;
    if (next <= cursor) throw new Error('Invalid directory cursor');
    cursor = next;
  }
});

export const getPublishedService = cache(async (id: string): Promise<PublicService | null> => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const rows = await serviceRead<PublicService[]>(`esx_public_service_listings?select=*&id=eq.${id.toLowerCase()}&limit=1`);
  return rows[0] ?? null;
});
