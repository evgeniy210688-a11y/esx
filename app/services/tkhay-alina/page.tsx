import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { companyPhotos, companyPhones } from '@/lib/service-media';
import { normalizeServiceCity, serviceLanguages, type ServiceListing } from '@/lib/service-directory';
import { splitServiceDescription, serviceItems } from '@/lib/service-description';
import { validSocialLinks, socialNetworks } from '@/lib/service-socials';
import '../services.css';
import '../services-light.css';
import '../services-soft.css';
import './profile.css';
import CitizenshipPicker from './CitizenshipPicker';

export const metadata: Metadata = { title: 'Tkhay Alina — ESX', description: 'Личная страница Tkhay Alina на ESX.' };
export const dynamic = 'force-dynamic';

export default async function AlinaPage() {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const { data, error } = await client.from('esx_service_listings')
    .select('id,name,description,city,category,address,phone,phones,photo,photos,website,social_links,service_languages,has_interpreter,interpreter_languages')
    .eq('id', '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf').eq('status', 'published').maybeSingle();
  if (error) return <main className="services-page services-directory specialist-profile"><div className="services-main"><Link href="/services">← К специалистам</Link><p role="alert">Не удалось загрузить страницу. Попробуйте обновить её позже.</p></div></main>;
  if (!data) notFound();
  const specialist = data as ServiceListing;
  const photos = companyPhotos(specialist);
  const content = splitServiceDescription(specialist.description);
  const services = serviceItems(content.services);
  const phones = companyPhones(specialist);
  const socials = validSocialLinks(specialist.social_links);
  return <div className="services-page services-directory specialist-profile">
    <header className="services-top"><Link href="/">ESX</Link><nav><Link href="/services">← К специалистам</Link></nav></header>
    <main className="services-main"><article className="services-card">
      <div className="specialist-heading">
        {photos[0] && <Image src={photos[0]} alt={specialist.name} width={160} height={160} unoptimized className="specialist-portrait" />}
        <div><p className="services-eyebrow">{normalizeServiceCity(specialist.city)}</p><h1>{specialist.name}</h1><p>{specialist.category}</p></div>
      </div>
      <CitizenshipPicker />
      <section className="services-card-section"><h2>Описание</h2><p className="specialist-description">{content.description}</p></section>
      {services.length > 0 && <section className="services-card-section"><h2>Услуги</h2><ul className="services-item-list">{services.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
      {specialist.service_languages.length > 0 && <section className="services-card-section"><h2>Языки общения</h2><div className="services-tags">{specialist.service_languages.map(language => <span key={language}>{serviceLanguages[language]}</span>)}</div></section>}
      {specialist.address?.trim() && <section className="services-card-section"><h2>Адрес</h2><p>{specialist.address}</p></section>}
      {(phones.length > 0 || socials.length > 0) && <section className="services-card-section"><h2>Контакты</h2><div className="services-contacts">{phones.map((phone, index) => <a key={index} href={'tel:' + phone.number.replace(/[^+0-9]/g, '')}>{phone.number}</a>)}{socials.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{socialNetworks[link.network]} ↗</a>)}</div></section>}
    </article></main>
  </div>;
}
