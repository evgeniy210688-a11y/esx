import Link from 'next/link';
import { publishedServices } from '@/lib/service-snapshot';
import { serviceProfilePath } from '@/lib/service-profile-path';

// A visible, server-rendered index lets visitors and crawlers reach every profile.
export default function DirectoryIndex() {
  const listings = [...publishedServices].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return <nav aria-label="Все компании и специалисты" style={{ maxWidth: 1200, margin: '24px auto', padding: '0 24px 32px' }}>
    <details>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Все компании и специалисты ({listings.length})</summary>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px 24px', marginTop: 16, listStyle: 'none', padding: 0 }}>
        {listings.map(listing => <li key={listing.id}><Link href={serviceProfilePath(listing.id)} prefetch={false}>{listing.name}</Link>{listing.city && <span> — {listing.city}</span>}</li>)}
      </ul>
    </details>
  </nav>;
}
