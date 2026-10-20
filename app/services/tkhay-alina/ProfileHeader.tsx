'use client';
import { useEffect, useState } from 'react';
import ServicesHeader from '../ServicesHeader';
import { interfaceLanguages, type InterfaceLanguage } from '../serviceLabels';
export default function ProfileHeader() {
  const [language, setLanguage] = useState<InterfaceLanguage>('ru');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('esx-services-language');
      if (interfaceLanguages.some(item => item.code === saved)) {
        queueMicrotask(() => setLanguage(saved as InterfaceLanguage));
      }
    } catch { /* Storage is optional. */ }
  }, []);
  function chooseLanguage(value: InterfaceLanguage) {
    setLanguage(value);
    try { localStorage.setItem('esx-services-language', value); } catch { /* Storage is optional. */ }
  }
  return <ServicesHeader language={language} chooseLanguage={chooseLanguage} />;
}