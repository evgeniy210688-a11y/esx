"use client";

import type { InterfaceLanguage } from './serviceLabels';

const labels: Record<InterfaceLanguage, string> = {
  ru: 'Наверх', en: 'Back to top', ko: '맨 위로', uz: 'Yuqoriga',
  zh: '返回顶部', vi: 'Về đầu trang', tr: 'Başa dön',
};

export default function ServicesBackToTop({ language }: { language: InterfaceLanguage }) {
  return <button className="services-back-to-top" type="button" aria-label={labels[language]} title={labels[language]} onClick={() => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 11L12 5L18 11M12 5V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </button>;
}
