import TopicLinks from './TopicLinks';
import Link from 'next/link';
import { publishedServices } from '@/lib/service-snapshot';
import { serviceProfilePath } from '@/lib/service-profile-path';

// Keep every link server-rendered, even while the directory is collapsed.
export default function DirectoryIndex() {
  const listings = [...publishedServices].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return <details lang="ru" style={{ maxWidth: 1200, margin: '24px auto', padding: '0 24px 32px' }}>
    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Справочник услуг в Южной Корее</summary>
    <TopicLinks />
    <nav aria-label="Все компании и специалисты">
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Все компании и специалисты</h2>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px 24px', marginTop: 16, listStyle: 'none', padding: 0 }}>
        {listings.map(listing => <li key={listing.id}><Link href={serviceProfilePath(listing.id)} prefetch={false}>{listing.name}</Link>{listing.city && <span> — {listing.city}</span>}</li>)}
      </ul>
    </nav>
  </details>;
}
