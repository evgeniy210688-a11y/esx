import type { BusinessHours } from './service-hours';
import type { CompanyPhone } from './service-media';
import type { SocialLink } from './service-socials';
export const serviceLanguages = { ru: 'Русский', uz: 'Узбекский', zh: 'Китайский', vi: 'Вьетнамский', en: 'Английский', ko: 'Корейский' } as const;
export type ServiceLanguage = keyof typeof serviceLanguages;
export type ServiceListing = { business_hours?: BusinessHours | null; id: string; name: string; description: string; city: string; category: string; address: string; phone: string | null; phones?: CompanyPhone[]; photo?: string | null; photos?: string[]; website: string | null; social_links?: SocialLink[]; service_languages: ServiceLanguage[]; has_interpreter: boolean; interpreter_languages: ServiceLanguage[] };
export type ServiceFilters = { query?: string; city: string; category: string; language: string; interpreter: boolean; interpreterLanguage: string };
export function matchesService(s: ServiceListing, f: ServiceFilters) {
  return (!f.query?.trim() || s.name.normalize('NFKC').toLowerCase().includes(f.query.trim().normalize('NFKC').toLowerCase())) && (!f.city || s.city === f.city) && (!f.category || s.category === f.category)
    && (!f.language || s.service_languages.some(l => l === f.language))
    && (!f.interpreter || s.has_interpreter)
    && (!f.interpreterLanguage || (s.has_interpreter && s.interpreter_languages.some(l => l === f.interpreterLanguage)));
}
export function safeServiceWebsite(value: string | null) {
  try { const url = new URL(value || ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
