import type { ServiceListing } from './service-directory';

const normalizedName = (value: string) => value.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
function phoneKey(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0082')) digits = '0' + digits.slice(4);
  else if (digits.startsWith('82')) digits = '0' + digits.slice(2);
  return digits.length >= 8 ? digits : '';
}
function socialKey(value: string) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || !url.pathname.replace(/\//g, '')) return '';
    return url.hostname.replace(/^www\./, '').toLowerCase() + url.pathname.replace(/\/+$/, '').toLowerCase();
  } catch { return ''; }
}
export function findDuplicateListings<T extends ServiceListing>(rows: T[]): { first: T; second: T; reasons: string[] }[] {
  const keys = rows.map(row => ({
    personal: row.listing_kind === 'manager' || row.listing_kind === 'interpreter',
    name: normalizedName(row.name),
    phones: new Set([row.phone ?? '', ...(row.phones ?? []).map(phone => phone.number)].map(phoneKey).filter(Boolean)),
    email: row.email?.trim().toLowerCase() ?? '',
    socials: new Set((row.social_links ?? []).map(link => socialKey(link.url)).filter(Boolean)),
  }));
  const pairs: { first: T; second: T; reasons: string[] }[] = [];
  for (let a = 0; a < rows.length; a++) for (let b = a + 1; b < rows.length; b++) {
    if (rows[a].id === rows[b].id || keys[a].personal !== keys[b].personal) continue;
    const left = keys[a], right = keys[b];
    const reasons: string[] = [];
    if (left.name && left.name === right.name) reasons.push('Имя / название');
    if ([...left.phones].some(phone => right.phones.has(phone))) reasons.push('Телефон');
    if (left.email && left.email === right.email) reasons.push('Email');
    if ([...left.socials].some(url => right.socials.has(url))) reasons.push('Соцсеть');
    if (reasons.length) pairs.push({ first: rows[a], second: rows[b], reasons });
  }
  return pairs;
}
