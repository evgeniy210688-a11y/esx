export type CompanyPhone = { type: 'office' | 'mobile' | 'other'; number: string };
export function companyPhones(value: { phones?: CompanyPhone[]; phone: string | null }): CompanyPhone[] {
  return value.phones?.length ? value.phones : value.phone ? [{ type: 'other', number: value.phone }] : [];
}
export function validCompanyPhones(phones: CompanyPhone[]) {
  return phones.length <= 5 && phones.every(p => ['office', 'mobile', 'other'].includes(p.type) && /^\+?[0-9 ()-]{3,30}$/.test(p.number.trim()) && p.number.replace(/\D/g, '').length >= 3);
}
export function safeCompanyPhoto(photo: string | null | undefined) {
  return photo && photo.length <= 200000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo) ? photo : null;
}
export async function prepareCompanyPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error('invalid_photo');
  const bitmap = await createImageBitmap(file);
  try {
    if (!bitmap.width || !bitmap.height) throw new Error('invalid_photo');
    const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('invalid_photo');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    for (const quality of [0.82, 0.65, 0.45, 0.3]) { const result = canvas.toDataURL('image/jpeg', quality); if (safeCompanyPhoto(result)) return result; }
    throw new Error('photo_too_large');
  } finally { bitmap.close(); }
}
export const phoneLabels: Record<string, Record<CompanyPhone['type'], string>> = {
  ru: { office: 'Офисный', mobile: 'Мобильный', other: 'Телефон' },
  en: { office: 'Office', mobile: 'Mobile', other: 'Phone' },
  ko: { office: '사무실', mobile: '휴대전화', other: '전화' },
  zh: { office: '办公室', mobile: '手机', other: '电话' },
  uz: { office: 'Ofis', mobile: 'Mobil', other: 'Telefon' },
  vi: { office: 'Văn phòng', mobile: 'Di động', other: 'Điện thoại' },
  tr: { office: 'Ofis', mobile: 'Cep telefonu', other: 'Telefon' },
};

export function companyPhotos(value: { photos?: string[]; photo?: string | null }): string[] {
  const photos = (value.photos ?? []).filter((photo): photo is string => !!safeCompanyPhoto(photo)).slice(0, 21);
  return photos.length ? photos : safeCompanyPhoto(value.photo) ? [value.photo!] : [];
}
