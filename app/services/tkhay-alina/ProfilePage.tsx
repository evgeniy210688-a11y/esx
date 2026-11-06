'use client';
import { specialistDisplayRole, specialistFieldLabels } from '@/lib/specialist-role';
import { specialistRole } from '@/lib/service-description';
import { displayTranslation, preparedTranslations, translationKey } from '@/lib/service-translations';
import { categoryTranslation } from '@/lib/service-category-labels';
import ContactIcon from '../ContactIcon';
import Link from 'next/link';
import SocialIcon from './SocialIcon';
import Image from 'next/image';
import { companyPhotos, companyPhones } from '@/lib/service-media';
import { normalizeServiceCity, serviceCategory, interpreterLanguageOptions, type ServiceListing } from '@/lib/service-directory';
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
  const translated = displayTranslation(language, preparedTranslations[translationKey(language, specialist)]);
  const content = splitServiceDescription(specialistRole(specialist.description).description);
  const services = serviceItems(content.services);
  const phones = companyPhones(specialist);
  const socials = validSocialLinks(specialist.social_links);
  return <div className="services-page services-directory specialist-profile">
    <ProfileHeader />
    <main className="services-main"><Link className="profile-back" href="/services">← {t('Назад')}</Link><article className="services-card"><ProfileEditor />
      <div className={specialist.represented_company?.trim() ? "specialist-heading specialist-heading-with-company" : "specialist-heading"}>
        {photos[0] && <Image src={photos[0]} alt={specialist.name} width={160} height={160} unoptimized className="specialist-portrait" />}
        <div><p className="services-eyebrow">{normalizeServiceCity(specialist.city) === 'Хвасонг, Паран' ? profileCity[language] : t(specialist.city)}</p><h1>{specialist.name}</h1><p className="services-person-role">{specialistFieldLabels[language].specialty}: {specialistDisplayRole(specialist, language, translated)}</p><p>{specialistFieldLabels[language].category}: {categoryTranslation(serviceCategory(specialist), language) ?? translated?.category ?? specialist.category}</p></div>
          {specialist.represented_company?.trim() && <p className="specialist-represented-company">{specialist.represented_company.trim()}</p>}
      </div>

      <section className="services-card-section"><h2>{t('Описание')}</h2><p className="specialist-description">{t(content.description)}</p></section>
      
      {specialist.service_languages.length > 0 && <section className="services-card-section"><h2>{t('Языки общения')}</h2><div className="services-tags">{specialist.service_languages.map(code => <span key={code}>{new Intl.DisplayNames([language],{type:'language'}).of(code) ?? interpreterLanguageOptions[code]}</span>)}</div></section>}
      <ProfileSections>
        <div>{services.length > 0 ? <ul className="services-item-list">{services.map((item, index) => <li key={index}>{t(item)}</li>)}</ul> : <p>{t('Уточните услуги у специалиста.')}</p>}</div>
        <div><div className="services-contacts specialist-contact-list">{specialist.email && <a href={'mailto:' + specialist.email}><ContactIcon kind="email" />{specialist.email}</a>}{phones.map((phone, index) => <a key={index} href={'tel:' + phone.number.replace(/[^+0-9]/g, '')}><ContactIcon kind="phone" />{phone.number}</a>)}{socials.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"><SocialIcon network={link.network} /><span>{socialNetworks[link.network]} ↗</span></a>)}{!specialist.email && phones.length === 0 && socials.length === 0 && <p>{t('Контакты пока не указаны.')}</p>}</div></div>
        <ProfileAddresses paranAddress={specialist.address ?? ''} />
      </ProfileSections>
      
    </article><ServiceTopics initialContent={data.profile_content as ProfileContent | null} /></main>
  </div>;
}
