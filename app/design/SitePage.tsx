"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { copy, languages, type Language } from './content';
import './design.css';
import BusinessHero from './BusinessHero';
import KoreaSection from './KoreaSection';
import HelpSection from './HelpSection';
import BackToTop from './BackToTop';
import UsefulApps from './UsefulApps';

const navigation = [{ id: 'home', label: 0 }, { id: 'korea', label: 1 }, { id: 'about', label: 2 }, { id: 'advertising', label: 3 }, { id: 'contact', label: 4 }];
export default function SitePage({ section = 'home' }: { section?: 'home' | 'korea' | 'about' | 'advertising' | 'contact' }) {
  const siteRef = useRef<HTMLDivElement>(null);
  const [language,setLanguage] = useState<Language>('ru');
  const [draft,setDraft] = useState({name:'',email:'',message:''});
  const [saved,setSaved] = useState<'saved'|'error'|null>(null);
  const [room,setRoom] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  useEffect(()=>{
    try {
      const lang = localStorage.getItem('esx-language');
      // Restore browser-only preferences after hydration; server render uses Russian.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if(languages.some(l=>l.code===lang)) setLanguage(lang as Language);
      const stored = localStorage.getItem('esx-contact-draft');
      if(stored) {const value=JSON.parse(stored); if(['name','email','message'].every(k=>typeof value[k]==='string')) setDraft(value);}
    } catch {}
  },[]);
  useEffect(()=>{document.documentElement.lang=language;document.title=`ESX — ${copy[language][{ home: 5, korea: 1, about: 2, advertising: 3, contact: 4 }[section]]}`;},[language, section]);
  useEffect(() => {
    const site = siteRef.current;
    if (!site || !('IntersectionObserver' in window)) return;
    const elements = site.querySelectorAll<HTMLElement>(
      '.useful-apps-heading, .useful-app, .help-heading, .help-article, .section-heading, .subheading, .holiday, .place, .source-row, .about, .advertising, .contact, .esx-footer'
    );
    const reveal = (element: HTMLElement) => {
      element.classList.remove('reveal-pending');
      element.classList.add('reveal-visible');
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          reveal(entry.target as HTMLElement);
        } else if (entry.boundingClientRect.top >= window.innerHeight) {
          entry.target.classList.remove('reveal-visible');
          entry.target.classList.add('reveal-pending');
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    elements.forEach(element => {
      // Already visible content stays visible, including restored scroll positions.
      element.classList.add('scroll-reveal');
      if (element.getBoundingClientRect().top >= window.innerHeight) element.classList.add('reveal-pending');
      observer.observe(element);
    });
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        const element = event.target.closest<HTMLElement>('.reveal-pending');
        if (element) { reveal(element); observer.unobserve(element); }
      }
    };
    site.addEventListener('focusin', onFocus);
    return () => {
      observer.disconnect();
      site.removeEventListener('focusin', onFocus);
      elements.forEach(element => {
        element.classList.remove('scroll-reveal', 'reveal-pending', 'reveal-visible');
        element.style.removeProperty('--reveal-delay');
      });
    };
  }, [section]);
  const t=copy[language];
  function navigationHref(id: string) { return id === 'home' ? '/' : '/' + id; }
  function choose(lang:Language) {setLanguage(lang);try {localStorage.setItem('esx-language',lang);}catch{}}
  return <div ref={siteRef} className="esx-site" lang={language}><div className="cyber-background" aria-hidden="true"><i className="cyber-circuit circuit-left"/><i className="cyber-circuit circuit-right"/><i className="cyber-halo halo-one"/><i className="cyber-halo halo-two"/><i className="cyber-rail"/></div>
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}><defs><filter id="esx-remove-black" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 1 1 0 0" /></filter></defs></svg>
    <header className={`esx-header ${menuOpen ? "menu-open" : ""}`} ><span aria-hidden="true" className="header-glass" style={{ backdropFilter: "blur(24px) saturate(145%)", WebkitBackdropFilter: "blur(24px) saturate(145%)" }} /><div className="header-inner">
      <a className="header-logo" href={navigationHref('home')} aria-label={`ESX — ${t[0]}`}><Image src="/esx-logo.png" alt="ESX" width={1254} height={1254} sizes="(max-width: 760px) 64px, 80px" preload /></a>
      <button type="button" className="menu-toggle" aria-label={t[44]} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}><span/><span/><span/></button>
      <nav id="main-navigation" aria-label={t[44]}>{navigation.map(({id,label:i})=><a style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }} onClick={() => setMenuOpen(false)} className={i===4?'nav-contact':''} href={navigationHref(id)} key={id}>{t[i]}{i===4&&<span>↗</span>}</a>)}</nav>
    </div></header>
    <main className="site-main">
      <section className="language-panel" aria-label={t[10]}><div className="language-label"><span>◎</span><div><strong>{t[10]}</strong><small>{t[11]}</small></div></div><div className="language-row">{languages.map(l=><button lang={l.code} key={l.code} onClick={()=>choose(l.code)} aria-pressed={language===l.code} className={language===l.code?'selected':''}><span>{l.code.toUpperCase()}</span>{l.name}</button>)}</div></section>
      {section === 'korea' && <KoreaSection language={language} />}
      {section === 'advertising' && (
<section id="advertising" className="advertising"><div><div className="eyebrow">{t[3]}</div><h1 style={{ fontSize: 'clamp(30px, 3.3vw, 43px)', lineHeight: 1.1 }}>{t[26]}</h1><p>{t[27]}</p><a href="/contact" className="button light">{t[31]} ↗</a></div><div className="ad-formats"><small>{t[45]}</small>{[28,29,30].map((n,i)=><div key={n}><span>0{i+1}</span><h3>{t[n]}</h3><span>↗</span></div>)}</div></section>
      )}
      {section === 'home' && <>
      <BusinessHero language={language} onStart={()=>setRoom(`${window.location.origin}/chat/${crypto.randomUUID()}`)} />
      {room&&<section className="invite" aria-label={t[12]}><div><h2>{t[12]}</h2><p>{t[13]}</p><a className="button blue" href={room}>{t[8]} ↗</a></div><QRCodeSVG value={room} size={180} title={t[12]}/></section>}
      <UsefulApps language={language} />



      <HelpSection language={language} />
      </>}
      {section === 'about' && (
      <section id="about" className="about"><div className="about-art" aria-hidden="true"><Image src="/about-chat.png" alt="" fill sizes="(max-width: 760px) calc(100vw - 32px), 50vw" style={{ objectFit: "cover", objectPosition: "center" }} /></div><div><div className="eyebrow blue-ink">{t[2]}</div><h1 style={{ fontSize: 'clamp(30px, 3.3vw, 43px)', lineHeight: 1.1 }}>{t[24]}</h1><p>{t[25]}</p><a href="/contact" className="text-link">{t[4]} ↗</a></div></section>
      )}
      {section === 'contact' && (
      <section id="contact" className="contact"><div><div className="eyebrow blue-ink">{t[4]}</div><h1 style={{ fontSize: 'clamp(30px, 3.3vw, 43px)', lineHeight: 1.1 }}>{t[32]}</h1><p>{t[33]}</p><div className="contact-phone" aria-label="English / 한국어"><div className="phone-speaker" aria-hidden="true"/><div className="phone-chat-title">ESX<span>EN ↔ KO</span></div><div className="phone-messages"><div className="phone-message incoming"><span lang="en">Hi! How are you?</span><small lang="ko">안녕하세요! 잘 지내세요?</small></div><div className="phone-message outgoing"><span lang="ko">네, 잘 지내요! 반가워요.</span><small lang="en">I am doing well! Nice to meet you.</small></div></div><div className="phone-compose" aria-hidden="true"><span>···</span><span>↑</span></div><div className="phone-home" aria-hidden="true"/></div></div><form onSubmit={e=>{e.preventDefault();try{localStorage.setItem('esx-contact-draft',JSON.stringify(draft));setSaved('saved');}catch{setSaved('error');}}}><div className="form-row">{(['name','email'] as const).map((key,i)=><label key={key}>{t[34+i]}<input required type={key==='email'?'email':'text'} autoComplete={key} value={draft[key]} onChange={e=>{setDraft({...draft,[key]:e.target.value});setSaved(null);}}/></label>)}</div><label>{t[36]}<textarea required rows={4} value={draft.message} onChange={e=>{setDraft({...draft,message:e.target.value});setSaved(null);}}/></label><p className="form-note">{t[38]}</p><button className="button blue" type="submit">{t[37]} ↗</button><p role="status">{saved?t[saved==='saved'?39:47]:''}</p></form></section>
      )}
    </main>
    <footer className="esx-footer"><div><a className="footer-logo" href={navigationHref('home')} aria-label={`ESX — ${t[0]}`}><Image src="/esx-logo-white.svg" alt="ESX" width={100} height={100} unoptimized /></a><p>{t[40]}</p></div><nav aria-label={t[44]}>{navigation.map(({id,label:i})=><a href={navigationHref(id)} key={id}>{t[i]}</a>)}</nav><div className="footer-bottom"><span>© {new Date().getFullYear()} ESX</span><span>{t[5]} ↗</span></div></footer>
    <BackToTop language={language} />
  </div>;
}


