import catalog from './service-translations.generated.json';
export type ServiceTranslation = { description: string; city: string; category: string };
export type TranslationSource = { id: string; description: string; city: string; category: string };
export const preparedTranslations: Record<string, ServiceTranslation> = catalog;
export function translationKey(language: string, listing: TranslationSource) {
  return JSON.stringify([language, listing.id, listing.description, listing.city, listing.category]);
}
export function validTranslation(value: unknown): value is ServiceTranslation {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return ['description', 'city', 'category'].every(key => typeof item[key] === 'string');
}
