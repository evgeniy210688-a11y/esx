"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AccountLink from '../account/AccountLink';
import { copy, type Language } from './content';
import './design.css';

const sections = ['/', '/korea', '/about', '/advertising', '/contact'];

export default function SiteHeader({ language, actions }: { language: Language; actions?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const t = copy[language];

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return <>
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id="esx-remove-black" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 1 1 0 0" /></filter></defs></svg>
    <header ref={header} className={`esx-header ${open ? 'menu-open' : ''}`}>
      <span aria-hidden="true" className="header-glass" style={{ backdropFilter: 'blur(24px) saturate(145%)', WebkitBackdropFilter: 'blur(24px) saturate(145%)' }} />
      <div className="header-inner">
        <Link className="header-logo" href="/" aria-label={`ESX — ${t[0]}`}><Image src="/esx-logo.png" alt="ESX" width={1254} height={1254} sizes="(max-width: 760px) 64px, 80px" preload /></Link>
        {actions && <div className="site-header-actions">{actions}</div>}
        <button ref={toggle} type="button" className="menu-toggle" aria-label={t[44]} aria-expanded={open} aria-controls="account-site-navigation" onClick={() => setOpen(!open)}><span /><span /><span /></button>
        <nav id="account-site-navigation" aria-label={t[44]}>
          {sections.map((href, index) => <Link key={href} href={href} className={index === 4 ? 'nav-contact' : ''} style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }} onClick={() => setOpen(false)}>{t[index]}{index === 4 && <span>↗</span>}</Link>)}
          <AccountLink language={language} onClick={() => setOpen(false)} />
        </nav>
      </div>
    </header>
  </>;
}
