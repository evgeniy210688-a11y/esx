'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { companyPhotos, companyPhones } from '@/lib/service-media';
import { cardContent, serviceItems, specialistRole } from '@/lib/service-description';
import { safeServiceWebsite, isPersonalListing, type ServiceListing } from '@/lib/service-directory';
import { validSocialLinks, socialNetworks } from '@/lib/service-socials';
import { displayTranslation, preparedTranslations, translationKey } from '@/lib/service-translations';
import { interfaceLanguages, type InterfaceLanguage } from '../serviceLabels';
import { profileLabel } from '../tkhay-alina/profileCopy';
import AnimatedPanel from './AnimatedPanel';
import useDismissOutside from '../tkhay-alina/useDismissOutside';
import ContactIcon from '../ContactIcon';
import SocialIcon from '../tkhay-alina/SocialIcon';
import './listing-profile.css';
import ServicesHeader from '../ServicesHeader';
import '../services.css';
import '../services-light.css';
import '../services-soft.css';
import '../tkhay-alina/profile.css';

export default function ListingProfile({ data }: { data: ServiceListing }) {
  const [language, setLanguage] = useState<InterfaceLanguage>('ru');
  const [active, setActive] = useState<number | null>(null);
  const sections = useDismissOutside<HTMLDivElement>(() => setActive(null));
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
  const personal = isPersonalListing(data);
  const roleContent = specialistRole(data.description, translated?.description);
  const content = cardContent(personal ? roleContent.description : translated?.description ?? data.description);
  const items = serviceItems(content.services);
  const photos = companyPhotos(data);
  const phones = companyPhones(data);
  const socials = validSocialLinks(data.social_links);
  const website = safeServiceWebsite(data.website);
  const addresses = [{ id: data.id, name: '', address: data.address }, ...(data.branches ?? [])].filter(item => item.address?.trim());
  const showAddress = !personal || addresses.length > 0;
  const labels = [t('Услуги'), t('Контакты'), ...(showAddress ? [language === 'ru' ? 'Адрес' : t('Наш адрес')] : [])];
  return <div lang={language} className="services-page services-directory specialist-profile">
    <ServicesHeader showDirectory language={language} chooseLanguage={chooseLanguage} />
    <main className="services-main"><Link className="profile-back" href="/services">← {t('Назад')}</Link>
      <article className="services-card">
        <div className="specialist-heading">
          {photos[0] && <Image className="specialist-portrait" src={photos[0]} alt={data.name} width={160} height={160} unoptimized />}
          <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}><p className="services-eyebrow">{translated?.city ?? data.city}</p><h1>{data.name}</h1>{personal && roleContent.role && <p className="services-person-role">{roleContent.role}</p>}<p>{translated?.category ?? data.category}</p></div>
        </div>
        {content.description.trim() && <section className="services-card-section"><h2>{t('Описание')}</h2><p className="specialist-description">{content.description}</p></section>}
        <div ref={sections}><div className="specialist-actions" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>{labels.map((label, index) => <button key={index} id={`listing-button-${index}`} type="button" aria-expanded={active === index} aria-controls={`listing-panel-${index}`} onClick={() => setActive(current => current === index ? null : index)}>{label}<span aria-hidden="true">▾</span></button>)}</div>
        <AnimatedPanel index={0} open={active === 0}>
          {items.length > 0 && <ul className="services-item-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>}
        </AnimatedPanel>
        <AnimatedPanel index={1} open={active === 1}>
          <div className="services-contacts">{data.email && <a href={`mailto:${data.email}`}><ContactIcon kind="email" />{data.email}</a>}{phones.map((phone, index) => <a key={index} href={'tel:' + phone.number.replace(/[^+0-9]/g, '')}><ContactIcon kind="phone" />{phone.number}</a>)}{website && <a href={website} target="_blank" rel="noopener noreferrer"><ContactIcon kind="website" />{new URL(website).hostname} ↗</a>}{socials.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"><SocialIcon network={link.network} />{socialNetworks[link.network]} ↗</a>)}</div>
        </AnimatedPanel>
        {showAddress && <AnimatedPanel index={2} open={active === 2}>
          {addresses.map(item => <div key={item.id}>{item.name && <h2>{item.name}</h2>}<p style={{ overflowWrap: 'anywhere' }}><ContactIcon kind="address" />{item.address}</p>{!personal && <div className="services-map-links"><a href={'https://map.kakao.com/link/search/' + encodeURIComponent(item.address)} target="_blank" rel="noopener noreferrer">Kakao Map ↗</a><a href={'https://map.naver.com/p/search/' + encodeURIComponent(item.address)} target="_blank" rel="noopener noreferrer">Naver Map ↗</a></div>}</div>)}
        </AnimatedPanel>}</div>
      </article>
    </main>
  </div>;
}
