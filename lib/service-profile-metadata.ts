import type { ServiceListing } from './service-directory';
import { publicPageMetadata } from './site-seo';
import { serviceProfilePath } from './service-profile-path';

export function serviceProfileMetadata(data: ServiceListing) {
  const identity = [data.name, data.category, data.city].filter(Boolean).join(' — ');
  const description = `${identity}. Услуги, контакты и адрес в справочнике ESX.`;
  return publicPageMetadata(serviceProfilePath(data.id), `${identity} | ESX`, description);
}
