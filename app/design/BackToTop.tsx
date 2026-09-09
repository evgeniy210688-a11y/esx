"use client";

import { type Language } from './content';

const labels: Record<Language, string> = {
  ru: 'Наверх', en: 'Back to top', ko: '맨 위로', zh: '返回顶部',
  tr: 'Başa dön', vi: 'Về đầu trang', km: 'ទៅខាងលើ', kk: 'Жоғарыға',
};

export default function BackToTop({ language }: { language: Language }) {
  return <button className="back-to-top" type="button" aria-label={labels[language]} title={labels[language]} onClick={() => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 11L12 5L18 11M12 5V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </button>;
}
