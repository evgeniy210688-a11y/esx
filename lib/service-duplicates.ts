import type { ServiceListing } from './service-directory';

const addressKey = (value: string) => value.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').replace(/\s+/gu, ' ').trim();
function phoneKey(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0082')) digits = '0' + digits.slice(4);
  else if (digits.startsWith('82')) digits = '0' + digits.slice(2);
  return digits.length >= 8 ? digits : '';
}
export function findDuplicateListings<T extends ServiceListing>(rows: T[]): { first: T; second: T; reasons: string[] }[] {
  const keys = rows.map(row => ({
    address: addressKey(row.address ?? ''),
    phones: new Set([row.phone ?? '', ...(row.phones ?? []).map(phone => phone.number)].map(phoneKey).filter(Boolean)),
  }));
  const pairs: { first: T; second: T; reasons: string[] }[] = [];
  for (let a = 0; a < rows.length; a++) for (let b = a + 1; b < rows.length; b++) {
    if (rows[a].id === rows[b].id) continue;
    const left = keys[a], right = keys[b];
    const reasons: string[] = [];
    if (left.address && left.address === right.address) reasons.push('Адрес');
    if ([...left.phones].some(phone => right.phones.has(phone))) reasons.push('Телефон');
    if (reasons.length) pairs.push({ first: rows[a], second: rows[b], reasons });
  }
  return pairs;
}
