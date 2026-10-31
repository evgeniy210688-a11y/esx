'use client';
import Link from 'next/link';
import SocialIcon from './SocialIcon';
import Image from 'next/image';
import { companyPhotos, companyPhones } from '@/lib/service-media';
import { normalizeServiceCity, interpreterLanguageOptions, type ServiceListing } from '@/lib/service-directory';
import { splitServiceDescription, serviceItems } from '@/lib/service-description';
import { validSocialLinks, socialNetworks } from '@/lib/service-socials';
import '../services.css';
import '../services-light.css';
import '../services-soft.css';
import './profile.css';
import ProfileHeader from './ProfileHeader';
import ProfileEditor from './ProfileEditor';
import ProfileSections from './ProfileSections';
import ProfileAddresses from './ProfileAddresses';
import ServiceTopics from './ServiceTopics';
import type { ProfileContent } from '@/lib/specialist-content';
import { useProfileLanguage } from './ProfileLanguage';
import { profileCity } from './profileCopy';


export default function ProfilePage({data}:{data:ServiceListing & {profile_content:ProfileContent | null}}) {
  const {language,t} = useProfileLanguage();
  const specialist = data;
  const photos = companyPhotos(specialist);
  const content = splitServiceDescription(specialist.description);
  const services = serviceItems(content.services);
  const phones = companyPhones(specialist);
  const socials = validSocialLinks(specialist.social_links);
  return <div className="services-page services-directory specialist-profile">
    <ProfileHeader />
    <main className="services-main"><Link className="profile-back" href="/services">← {t('Назад')}</Link><article className="services-card"><ProfileEditor />
      <div className="specialist-heading">
        {photos[0] && <Image src={photos[0]} alt={specialist.name} width={160} height={160} unoptimized className="specialist-portrait" />}
        <div><p className="services-eyebrow">{normalizeServiceCity(specialist.city) === 'Хвасонг, Паран' ? profileCity[language] : t(specialist.city)}</p><h1>{specialist.name}</h1><p>{t(specialist.category)}</p>{specialist.represented_company && <p>{specialist.represented_company}</p>}</div>
      </div>

      <section className="services-card-section"><h2>{t('Описание')}</h2><p className="specialist-description">{t(content.description)}</p></section>
      
      {specialist.service_languages.length > 0 && <section className="services-card-section"><h2>{t('Языки общения')}</h2><div className="services-tags">{specialist.service_languages.map(code => <span key={code}>{new Intl.DisplayNames([language],{type:'language'}).of(code) ?? interpreterLanguageOptions[code]}</span>)}</div></section>}
      <ProfileSections>
        <div>{services.length > 0 ? <ul className="services-item-list">{services.map((item, index) => <li key={index}>{t(item)}</li>)}</ul> : <p>{t('Уточните услуги у специалиста.')}</p>}</div>
        <div><div className="services-contacts specialist-contact-list">{phones.map((phone, index) => <a key={index} href={'tel:' + phone.number.replace(/[^+0-9]/g, '')}>{phone.number}</a>)}{socials.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"><SocialIcon network={link.network} /><span>{socialNetworks[link.network]} ↗</span></a>)}{phones.length === 0 && socials.length === 0 && <p>{t('Контакты пока не указаны.')}</p>}</div></div>
        <ProfileAddresses paranAddress={specialist.address ?? ''} />
      </ProfileSections>
      
    </article><ServiceTopics initialContent={data.profile_content as ProfileContent | null} /></main>
  </div>;
}
