import type { Metadata } from 'next';
import { publicPageMetadata, siteOrigin } from './site-seo';
export const servicesLanguageAlternates = {
  ru: siteOrigin + '/ru/services',
  ko: siteOrigin + '/ko/services',
  en: siteOrigin + '/en/services',
  'x-default': siteOrigin + '/services',
};
const copy = {
  ru: ['Справочник услуг в Корее — ESX', 'Компании и специалисты в Южной Корее. Поиск услуг по городу и языку обслуживания.'],
  ko: ['한국 서비스 디렉터리 — ESX', '한국의 업체와 전문가를 찾아보세요. 지역과 서비스 언어별로 검색할 수 있습니다.'],
  en: ['Services directory in South Korea — ESX', 'Find companies and specialists in South Korea by city and service language.'],
};
export function servicesPageMetadata(language: keyof typeof copy): Metadata {
  const path = `/${language}/services`;
  return {...publicPageMetadata(path, copy[language][0], copy[language][1]),
    alternates: {canonical: siteOrigin + path, languages: servicesLanguageAlternates}};
}
