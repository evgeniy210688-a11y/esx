"use client";
import { useEffect, useRef, useState } from 'react';
import { copy, type Language } from '@/app/design/content';
import './ChatShortcuts.css';

const topLabels: Record<Language, string> = { ru: 'Наверх', en: 'Back to top', ko: '맨 위로', zh: '返回顶部', tr: 'Başa dön', vi: 'Lên đầu trang', km: 'ទៅខាងលើ', kk: 'Жоғарыға' };
export default function ChatShortcuts({ language }: { language: Language }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const t = copy[language];
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div ref={root} className="chat-shortcuts">
    {open && <nav id="chat-shortcut-menu" className="chat-shortcut-menu" aria-label={t[44]}>{[['/', 0], ['/korea', 1], ['/about', 2], ['/advertising', 3], ['/contact', 4]].map(([url, index]) => <a key={url} href={String(url)}>{t[Number(index)]}</a>)}</nav>}
    <button type="button" aria-label={t[8]} title={t[8]} onClick={() => window.location.assign(`/chat/${crypto.randomUUID()}`)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0ZM7 10h9M7 14h6" /></svg></button>
    <button ref={toggle} type="button" aria-label={t[44]} aria-expanded={open} aria-controls="chat-shortcut-menu" onClick={() => setOpen(value => !value)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={open ? 'M6 6L18 18M18 6L6 18' : 'M4 6H20M4 12H20M4 18H20'} /></svg></button>
    <button type="button" aria-label={topLabels[language]} title={topLabels[language]} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 11L12 5L18 11M12 5V20" /></svg></button>
  </div>;
}
