import type { BusinessHours } from './service-hours';
import type { CompanyPhone } from './service-media';
import type { SocialLink } from './service-socials';
export const serviceLanguages = { ru: 'Русский', uz: 'Узбекский', zh: 'Китайский', vi: 'Вьетнамский', en: 'Английский', ko: 'Корейский' } as const;
export type ServiceLanguage = keyof typeof serviceLanguages;
export type ServiceBranch = { id: string; name: string; city: string; address: string; phone: string };
export function validServiceBranches(branches: ServiceBranch[]) {
  return new Set(branches.map(b => b.id)).size === branches.length && branches.every(b =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b.id) &&
    b.name.trim().length > 0 && b.name.trim().length <= 200 &&
    b.city.trim().length > 0 && b.city.trim().length <= 100 &&
    b.address.trim().length > 0 && b.address.trim().length <= 500 &&
    (!b.phone.trim() || (/^\+?[0-9 ()-]{3,30}$/.test(b.phone.trim()) && b.phone.replace(/\D/g, '').length >= 3)));
}
export function normalizeServiceCity(value: string) {
  const city = value.normalize('NFKC').trim().replace(/\s+/g, ' ');
  if (/^хвасонг?\s*,\s*чоам$/i.test(city)) return 'Хвасонг, Чоам';
  return /^хвасонг?(?:\s*,\s*паран)?$/i.test(city) ? 'Хвасонг, Паран' : city;
}
export function serviceCities(listing: { city: string; branches?: ServiceBranch[] }) {
  return [...new Set([listing.city, ...(listing.branches ?? []).map(branch => branch.city)].map(normalizeServiceCity).filter(Boolean))];
}
export type ListingKind = 'company' | 'manager' | 'interpreter';
export const listingKindLabels = { company: 'Компания', manager: 'Менеджер', interpreter: 'Переводчик' } as const;
export function isPersonalListing(listing: { listing_kind?: ListingKind }) {
  return listing.listing_kind === 'manager' || listing.listing_kind === 'interpreter';
}
export type ServiceListing = { represented_company?: string | null; listing_kind?: ListingKind; branches?: ServiceBranch[]; has_manager?: boolean; business_hours?: BusinessHours | null; id: string; name: string; description: string; city: string; category: string; address: string; phone: string | null; phones?: CompanyPhone[]; photo?: string | null; photos?: string[]; website: string | null; social_links?: SocialLink[]; service_languages: ServiceLanguage[]; has_interpreter: boolean; interpreter_languages: ServiceLanguage[] };
export function validListingIdentity(listing: Pick<ServiceListing, 'listing_kind' | 'name' | 'city' | 'category' | 'address'>) {
  return (isPersonalListing(listing) ? [listing.name] : [listing.name, listing.city, listing.category, listing.address]).every(value => value.trim().length > 0);
}
export function serviceCategory(listing: Pick<ServiceListing, 'category'>) {
  const category = listing.category.normalize('NFKC').trim().replace(/\s+/g, ' ');
  if (/образован|обучен|автошкол|школ|курсы|курс |репетитор|учеб|университет|колледж|детский сад|education|training|school|tutor|courses|university|college/i.test(category)) return 'Образование';
  if (/автодилер|автосалон|продажа автомобилей|покупка и аренда автомобилей|car dealer|car rental/i.test(category)) return 'Покупка и аренда автомобилей';
  if (/недвижим|риелтор|риэлтор|аренда квартир|продажа квартир|аренда домов|продажа домов|аренда офис|real estate|realtor|property rental/i.test(category)) return 'Недвижимость';
  if (/^консультант по визовым вопросам$/i.test(category)) return 'Визы и иммиграция';
  return /^(международный\s+)?медицинский\s+координатор$/i.test(category)
    ? 'Медицина и клиники'
    : listing.category;
}
export type ServiceFilters = { query?: string; city: string; category: string; language: string; interpreter: boolean; interpreterLanguage: string };
function normalizeSearch(value: string) {
  return value.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
export function matchesService(s: ServiceListing, f: ServiceFilters, translated?: { description?: string; category?: string; city?: string }) {
  const terms = normalizeSearch(f.query ?? '').split(/\s+/).filter(Boolean);
  const searchable = normalizeSearch([
    s.name, s.represented_company, s.category, serviceCategory(s), s.description, s.city, s.address,
    s.listing_kind ? listingKindLabels[s.listing_kind] : '',
    ...(s.branches ?? []).flatMap(branch => [branch.name, branch.city, branch.address]),
    translated?.description ?? '', translated?.category ?? '', translated?.city ?? '',
  ].join(' '));
  return terms.every(term => searchable.includes(term)) && (!f.city || serviceCities(s).includes(normalizeServiceCity(f.city))) && (!f.category || serviceCategory(s) === f.category)
    && (!f.language || s.service_languages.some(l => l === f.language))
    && (!f.interpreter || s.has_interpreter)
    && (!f.interpreterLanguage || (s.has_interpreter && s.interpreter_languages.some(l => l === f.interpreterLanguage)));
}
export function safeServiceWebsite(value: string | null) {
  try { const url = new URL(value || ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
