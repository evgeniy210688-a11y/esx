import Link from 'next/link';
import { directoryTopics } from '@/lib/directory-topics';

export default function TopicLinks() {
  return <section lang="ru" style={{ maxWidth: 1200, margin: '32px auto', padding: '0 24px' }}>
    <h2 style={{ fontSize: 24, fontWeight: 600 }}>Справочник услуг в Южной Корее</h2>
    <p>Компании и специалисты для жителей Кореи. Выберите направление, чтобы найти услуги, адреса и контакты. Русскоязычные специалисты отмечают русский язык в своих карточках.</p>
    <nav aria-label="Услуги по направлениям"><ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, padding: '16px 0', listStyle: 'none' }}>
      {directoryTopics.map(topic => <li key={topic.slug}><Link href={'/services/category/' + topic.slug} style={{ textDecoration: 'underline' }}>{topic.title}</Link></li>)}
    </ul></nav>
  </section>;
}
