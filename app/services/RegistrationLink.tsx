import Link from 'next/link';

const labels: Record<string, string> = {
  ru: 'Зарегистрировать компанию или специалиста',
  en: 'Register a company or specialist', ko: '업체 또는 전문가 등록',
  uz: 'Kompaniya yoki mutaxassisni ro‘yxatdan o‘tkazish', zh: '注册公司或专业人士',
  vi: 'Đăng ký công ty hoặc chuyên gia', tr: 'Şirket veya uzman kaydı',
  km: 'ចុះឈ្មោះក្រុមហ៊ុន ឬអ្នកជំនាញ', kk: 'Компанияны немесе маманды тіркеу',
};
export default function RegistrationLink({ language }: { language: string }) {
  return <Link href="/services/register">{labels[language] ?? labels.en} →</Link>;
}
