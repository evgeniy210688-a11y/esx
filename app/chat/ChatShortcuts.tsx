"use client";
import { useEffect, useRef, useState } from 'react';
import { copy, languages, type Language } from '@/app/design/content';
import './ChatShortcuts.css';
import { useRouter } from 'next/navigation';
import AccountLink from '@/app/account/AccountLink';

export default function ChatShortcuts({ language, onLanguageChange }: { language: Language; onLanguageChange?: (value: Language) => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);
  useEffect(() => {
    if (onLanguageChange) return;
    const panel = document.querySelector<HTMLDetailsElement>('#chat-language-panel');
    const sync = () => setLanguagesOpen(panel?.open ?? false);
    const closeOutside = (event: PointerEvent) => {
      if (panel?.open && event.target instanceof Element && !panel.contains(event.target) && !event.target.closest('[aria-controls="chat-language-panel"]')) panel.open = false;
    };
    panel?.addEventListener('toggle', sync);
    document.addEventListener('pointerdown', closeOutside);
    return () => {
      panel?.removeEventListener('toggle', sync);
      document.removeEventListener('pointerdown', closeOutside);
    };
  }, [onLanguageChange]);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const t = copy[language];
  useEffect(() => {
    if (!open && !languagesOpen) return;
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) { setOpen(false); setLanguagesOpen(false); } };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); setLanguagesOpen(false); toggle.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open, languagesOpen]);
  return <div ref={root} className="chat-shortcuts">
    {open && <nav id="chat-shortcut-menu" className="chat-shortcut-menu" aria-label={t[44]}>{[['/', 0], ['/korea', 1], ['/about', 2], ['/advertising', 3], ['/contact', 4]].map(([url, index]) => <a key={url} href={String(url)}>{t[Number(index)]}</a>)}<AccountLink language={language} /></nav>}
    {languagesOpen && onLanguageChange && <div id="chat-shortcut-languages" className="chat-shortcut-menu chat-shortcut-languages" role="group" aria-label={t[10]}>{languages.map(item => <button key={item.code} type="button" lang={item.code} aria-pressed={language === item.code} onClick={() => { onLanguageChange(item.code); setLanguagesOpen(false); }}>{item.name}{language === item.code ? ' ✓' : ''}</button>)}</div>}
    <button type="button" aria-label={language === 'ru' ? 'Назад' : 'Back'} onClick={() => { if (window.history.length > 1) router.back(); else router.push('/'); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5L8 12L15 19" /></svg></button>
    <button type="button" aria-label={t[0]} title={t[0]} onClick={() => router.push('/')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10L12 3L21 10M5 9V21H10V15H14V21H19V9" /></svg></button>
    <button ref={toggle} type="button" aria-label={t[44]} aria-expanded={open} aria-controls="chat-shortcut-menu" onClick={() => { setLanguagesOpen(false); setOpen(value => !value); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={open ? 'M6 6L18 18M18 6L6 18' : 'M4 6H20M4 12H20M4 18H20'} /></svg></button>
    <button type="button" aria-label={t[10]} title={t[10]} aria-expanded={languagesOpen} aria-controls={onLanguageChange ? "chat-shortcut-languages" : "chat-language-panel"} onClick={() => {
      setOpen(false); if (onLanguageChange) { setLanguagesOpen(value => !value); return; }
      const panel = document.querySelector<HTMLDetailsElement>('#chat-language-panel');
      if (panel) { panel.open = !panel.open; if (panel.open) { panel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' }); panel.querySelector<HTMLElement>('select, summary, button')?.focus({ preventScroll: true }); } }
    }}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12H21M5 6H19M5 18H19"/></svg></button>
  </div>;
}
