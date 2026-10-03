"use client";

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { copy, type Language } from '@/app/design/content';
import AccountLink from '@/app/account/AccountLink';
import './ChatMenu.css';

const labels: Record<Language, string> = { ru: 'Настройки', ko: '설정', en: 'Settings', zh: '设置', tr: 'Ayarlar', vi: 'Cài đặt', km: 'ការកំណត់', kk: 'Параметрлер' };
const links = ['/', '/korea', '/about', '/advertising', '/contact'];

export default function ChatMenu({ language }: { language: Language }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); button.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return <div ref={root} className="chat-header-menu" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={button} className="chat-header-menu-toggle" type="button" aria-label={labels[language]} title={labels[language]} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94L14.7 6.3z" /></svg>
    </button>
    {open && <div id={id} role="navigation" aria-label={labels[language]} className="chat-header-menu-panel">
      {links.map((href, index) => <Link key={href} href={href} onClick={() => setOpen(false)}>{copy[language][index]}</Link>)}
      <AccountLink language={language} onClick={() => setOpen(false)} />
    </div>}
  </div>;
}
