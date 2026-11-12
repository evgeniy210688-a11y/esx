import snapshot from './service-listings.snapshot.json';
import type { ServiceListing } from './service-directory';
import type { ProfileContent } from './specialist-content';

// Published-only export. Refresh this snapshot to publish directory changes
// while Supabase is restricted. See docs/service-snapshot.md.
export const publishedServices = snapshot as unknown as (ServiceListing & { profile_content: ProfileContent | null })[];
export function snapshotService(id: string) {
  return publishedServices.find(listing => listing.id === id) ?? null;
}
