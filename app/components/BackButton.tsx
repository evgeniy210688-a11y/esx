"use client";
import { usePathname, useRouter } from 'next/navigation';

const labels: Record<string, string> = {
  ru: 'Назад', en: 'Back', ko: '뒤로', uz: 'Orqaga', zh: '返回',
  vi: 'Quay lại', tr: 'Geri', kk: 'Артқа', km: 'ត្រឡប់ក្រោយ',
};

export default function BackButton({ language = 'en' }: { language?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  function back() {
    if (window.history.length > 1) router.back();
    else router.replace(pathname === '/' ? '/services' : '/');
  }
  return <div className="esx-back-row"><button type="button" className="esx-back-button" onClick={back}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 5l-7 7 7 7M7 12h14" /></svg>
    <span>{labels[language] ?? labels.en}</span>
  </button></div>;
}
