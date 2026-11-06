import { serviceCategories } from './service-options';
import { specialistRole } from './service-description';
import type { ServiceListing } from './service-directory';
import type { InterfaceLanguage } from '../app/services/serviceLabels';

const personRoleLabels: Record<InterfaceLanguage, { manager: string; interpreter: string }> = { ru: { manager: 'Специалист', interpreter: 'Переводчик' }, en: { manager: 'Specialist', interpreter: 'Interpreter' }, ko: { manager: '전문가', interpreter: '통역사' }, uz: { manager: 'Mutaxassis', interpreter: 'Tarjimon' }, zh: { manager: '专业人士', interpreter: '口译员' }, vi: { manager: 'Chuyên gia', interpreter: 'Phiên dịch viên' }, tr: { manager: 'Uzman', interpreter: 'Tercüman' } };

export function specialistDisplayRole(listing: Pick<ServiceListing, 'description' | 'category' | 'listing_kind'>, language: InterfaceLanguage, translated?: {description?: string; category?: string}) {
  const explicit = specialistRole(listing.description, translated?.description).role;
  const legacy = !serviceCategories.some(category => category === listing.category) ? translated?.category?.trim() || listing.category.trim() : '';
  const fallback = personRoleLabels[language][listing.listing_kind === 'interpreter' ? 'interpreter' : 'manager'];
  const role = explicit || legacy || fallback;
  return role.charAt(0).toLocaleUpperCase(language) + role.slice(1);
}
