'use client';
import { useEffect, useRef, useState } from 'react';
import type { InterfaceLanguage } from './serviceLabels';
export default function DirectoryThemeToggle({language}: {language: InterfaceLanguage}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [darkTheme, setDarkTheme] = useState(false);
  useEffect(() => {
    let dark = false;
    try { dark = localStorage.getItem('esx-directory-theme') === 'dark'; } catch {}
    buttonRef.current?.closest('.services-directory')?.setAttribute('data-theme', dark ? 'dark' : 'light');
    queueMicrotask(() => setDarkTheme(dark));
  }, []);
  function toggleTheme() {
    const dark = !darkTheme;
    setDarkTheme(dark);
    buttonRef.current?.closest('.services-directory')?.setAttribute('data-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem('esx-directory-theme', dark ? 'dark' : 'light'); } catch {}
  }

  return <button ref={buttonRef} type="button" className="directory-theme-toggle" aria-label={{ru:'Ночная тема',en:'Dark mode',ko:'다크 모드',uz:'Tungi rejim',zh:'深色模式',vi:'Chế độ tối',tr:'Karanlık mod'}[language]} aria-pressed={darkTheme} onClick={toggleTheme}><span className="theme-sun" aria-hidden="true">☀</span><span className="theme-moon" aria-hidden="true">☾</span><span className="theme-knob" aria-hidden="true" /></button>;
}
