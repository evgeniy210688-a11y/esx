import { publishedServices } from '@/lib/service-snapshot';
import ServicesDirectory from './ServicesDirectory';

// Send the same public fields as the directory API in the initial HTML render.
export default function PublishedServicesDirectory({ routeLanguage }: { routeLanguage?: 'ru' | 'ko' | 'en' }) {
  const initialListings = publishedServices
    .map(({ profile_content, ...listing }) => { void profile_content; return listing; })
    .sort((a, b) => a.name.localeCompare(b.name, 'ru') || a.id.localeCompare(b.id));
  return <ServicesDirectory routeLanguage={routeLanguage} initialListings={initialListings} />;
}
