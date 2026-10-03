"use client";

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { copy, type Language } from '@/app/design/content';
import AccountLink from '@/app/account/AccountLink';
import './ChatMenu.css';

const labels: Record<Language, string> = { ru: 'Меню', ko: '메뉴', en: 'Menu', zh: '菜单', tr: 'Menü', vi: 'Menu', km: 'ម៉ឺនុយ', kk: 'Мәзір' };
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
    <button ref={button} className="chat-header-menu-toggle" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={open ? 'M6 6L18 18M18 6L6 18' : 'M4 6H20M4 12H20M4 18H20'} /></svg>
      {labels[language]}
    </button>
    {open && <div id={id} role="navigation" aria-label={labels[language]} className="chat-header-menu-panel">
      {links.map((href, index) => <Link key={href} href={href} onClick={() => setOpen(false)}>{copy[language][index]}</Link>)}
      <AccountLink language={language} onClick={() => setOpen(false)} />
    </div>}
  </div>;
}
