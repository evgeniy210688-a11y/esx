'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { companyPhotos, companyPhones } from '@/lib/service-media';
import { splitServiceDescription, serviceItems } from '@/lib/service-description';
import { safeServiceWebsite, type ServiceListing } from '@/lib/service-directory';
import { validSocialLinks, socialNetworks } from '@/lib/service-socials';
import { displayTranslation, preparedTranslations, translationKey } from '@/lib/service-translations';
import { interfaceLanguages, type InterfaceLanguage } from '../serviceLabels';
import { profileLabel } from '../tkhay-alina/profileCopy';
import ServicesHeader from '../ServicesHeader';
import '../services.css';
import '../services-light.css';
import '../services-soft.css';
import '../tkhay-alina/profile.css';

export default function ListingProfile({ data }: { data: ServiceListing }) {
  const [language, setLanguage] = useState<InterfaceLanguage>('ru');
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('esx-services-language');
      if (interfaceLanguages.some(item => item.code === saved)) setLanguage(saved as InterfaceLanguage);
    } catch { /* Storage is optional. */ }
  }, []);
  function chooseLanguage(value: InterfaceLanguage) {
    setLanguage(value);
    try { localStorage.setItem('esx-services-language', value); } catch { /* Storage is optional. */ }
  }
  const t = (text: string) => profileLabel(language, text);
  const translated = displayTranslation(language, preparedTranslations[translationKey(language, data)]);
  const items = serviceItems(splitServiceDescription(translated?.description ?? data.description).services);
  const photos = companyPhotos(data);
  const phones = companyPhones(data);
  const socials = validSocialLinks(data.social_links);
  const website = safeServiceWebsite(data.website);
  const addresses = [{ id: data.id, name: '', address: data.address }, ...(data.branches ?? [])].filter(item => item.address?.trim());
  const labels = [t('Услуги'), t('Контакты'), language === 'ru' ? 'Адрес' : t('Наш адрес')];
  return <div lang={language} className="services-page services-directory specialist-profile">
    <ServicesHeader showDirectory language={language} chooseLanguage={chooseLanguage} />
    <main className="services-main"><Link className="profile-back" href="/services">← {t('Назад')}</Link>
      <article className="services-card">
        <div className="specialist-heading">
          {photos[0] && <Image className="specialist-portrait" src={photos[0]} alt={data.name} width={160} height={160} unoptimized />}
          <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}><p className="services-eyebrow">{translated?.city ?? data.city}</p><h1>{data.name}</h1><p>{translated?.category ?? data.category}</p></div>
        </div>
        <div className="specialist-actions">{labels.map((label, index) => <button key={index} id={`listing-button-${index}`} type="button" aria-expanded={active === index} aria-controls={`listing-panel-${index}`} onClick={() => setActive(current => current === index ? null : index)}>{label}<span aria-hidden="true">▾</span></button>)}</div>
        <section id="listing-panel-0" role="region" aria-labelledby="listing-button-0" hidden={active !== 0} style={{ display: active === 0 ? undefined : 'none' }} className="profile-section-content">
          {items.length > 0 && <ul className="services-item-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>}
        </section>
        <section id="listing-panel-1" role="region" aria-labelledby="listing-button-1" hidden={active !== 1} style={{ display: active === 1 ? undefined : 'none' }} className="profile-section-content">
          <div className="services-contacts">{data.email && <a href={`mailto:${data.email}`}>{data.email}</a>}{phones.map((phone, index) => <a key={index} href={'tel:' + phone.number.replace(/[^+0-9]/g, '')}>{phone.number}</a>)}{website && <a href={website} target="_blank" rel="noopener noreferrer">{new URL(website).hostname} ↗</a>}{socials.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{socialNetworks[link.network]} ↗</a>)}</div>
        </section>
        <section id="listing-panel-2" role="region" aria-labelledby="listing-button-2" hidden={active !== 2} style={{ display: active === 2 ? undefined : 'none' }} className="profile-section-content">
          {addresses.map(item => <div key={item.id}>{item.name && <h2>{item.name}</h2>}<p style={{ overflowWrap: 'anywhere' }}>{item.address}</p></div>)}
        </section>
      </article>
    </main>
  </div>;
}
