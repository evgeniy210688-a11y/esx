"use client";
import { useEffect, useRef, useState } from 'react';
import { copy, type Language } from '@/app/design/content';
import './ChatShortcuts.css';

export default function ChatShortcuts({ language }: { language: Language }) {
  const [open, setOpen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);
  useEffect(() => {
    const panel = document.querySelector<HTMLDetailsElement>('#chat-language-panel');
    const sync = () => setLanguagesOpen(panel?.open ?? false);
    panel?.addEventListener('toggle', sync);
    return () => panel?.removeEventListener('toggle', sync);
  }, []);
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
    <button type="button" aria-label={t[0]} title={t[0]} onClick={() => window.location.assign('/')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10L12 3L21 10M5 9V21H10V15H14V21H19V9" /></svg></button>
    <button ref={toggle} type="button" aria-label={t[44]} aria-expanded={open} aria-controls="chat-shortcut-menu" onClick={() => setOpen(value => !value)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={open ? 'M6 6L18 18M18 6L6 18' : 'M4 6H20M4 12H20M4 18H20'} /></svg></button>
    <button type="button" aria-label={t[10]} title={t[10]} aria-expanded={languagesOpen} aria-controls="chat-language-panel" onClick={() => {
      setOpen(false);
      const panel = document.querySelector<HTMLDetailsElement>('#chat-language-panel');
      if (panel) { panel.open = !panel.open; if (panel.open) { panel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' }); panel.querySelector('select')?.focus({ preventScroll: true }); } }
    }}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12H21M5 6H19M5 18H19"/></svg></button>
  </div>;
}
