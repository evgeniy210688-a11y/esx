import Link from 'next/link';
import { connection } from 'next/server';
import { getPublishedServices } from '@/lib/service-live';
import { notFound } from 'next/navigation';
import { directoryTopics, topicListings } from '@/lib/directory-topics';
import { publicPageMetadata } from '@/lib/site-seo';
import { serviceProfilePath } from '@/lib/service-profile-path';
import TopicLinks from '../../TopicLinks';

type Props = { params: Promise<{ topic: string }> };
export function generateStaticParams() { return directoryTopics.map(topic => ({ topic: topic.slug })); }
export async function generateMetadata({ params }: Props) {
  const { topic: slug } = await params;
  const topic = directoryTopics.find(item => item.slug === slug);
  if (!topic) notFound();
  return publicPageMetadata('/services/category/' + topic.slug, topic.title + ' | ESX', topic.description);
}
export default async function TopicPage({ params }: Props) {
  const { topic: slug } = await params;
  const topic = directoryTopics.find(item => item.slug === slug);
  if (!topic) notFound();
  await connection();
  const listings = topicListings(topic, await getPublishedServices());
  return <main lang="ru" style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '32px 20px', color: '#18365c' }}>
    <nav aria-label="Навигация"><Link href="/">ESX</Link> / <Link href="/services">Справочник</Link></nav>
    <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', margin: '24px 0', fontWeight: 700 }}>{topic.title}</h1>
    <p style={{ fontSize: 18, lineHeight: 1.7 }}>{topic.intro}</p>
    <section style={{ margin: '24px 0', padding: 20, background: '#edf4ff', borderRadius: 16 }}><h2 style={{ fontSize: 21, fontWeight: 600 }}>Что уточнить перед обращением</h2><p style={{ lineHeight: 1.7 }}>{topic.advice}</p></section>
    <h2 style={{ fontSize: 24, margin: '24px 0' }}>Компании и специалисты: {listings.length}</h2>
    <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20, padding: 0, listStyle: 'none' }}>
      {listings.map(listing => <li key={listing.id} style={{ padding: 24, background: '#fff', border: '1px solid #d4e1f2', borderRadius: 20 }}>
        <h3 style={{ fontSize: 22, fontWeight: 600 }}><Link href={serviceProfilePath(listing.id)}>{listing.name}</Link></h3>
        <p>{listing.city || 'Город уточняйте у специалиста'} · {listing.category}</p>
        <p style={{ lineHeight: 1.6, margin: '12px 0', whiteSpace: 'pre-line' }}>{listing.description.replace(/\*\*/g, '').slice(0, 350)}{listing.description.length > 350 ? '…' : ''}</p>
        {listing.address && <p style={{ overflowWrap: 'anywhere' }}>{listing.address}</p>}
        <Link href={serviceProfilePath(listing.id)} style={{ display: 'inline-block', marginTop: 16, textDecoration: 'underline' }}>Услуги и контакты →</Link>
      </li>)}
    </ul>
    <TopicLinks />
  </main>;
}
