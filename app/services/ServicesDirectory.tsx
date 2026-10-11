"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminEntry from '@/app/admin/AdminEntry';
import { supabase } from '@/lib/supabase';
import { matchesService, safeServiceWebsite, serviceLanguages, type ServiceListing, type ServiceFilters } from '@/lib/service-directory';
import './services.css';
import { interfaceLanguages, serviceLabels, type InterfaceLanguage } from './serviceLabels';
import { socialNetworks, validSocialLinks } from '@/lib/service-socials';
const flags = { ru: 'ru', uz: 'uz', zh: 'cn', vi: 'vn', en: 'gb', ko: 'kr', tr: 'tr' } as const;
const empty: ServiceFilters = { city: '', category: '', language: '', interpreter: false, interpreterLanguage: '' };
export default function ServicesDirectory() {
  const [language, setLanguage] = useState<InterfaceLanguage>('ru');
  const t = serviceLabels[language];
  useEffect(() => {
    try { const saved = localStorage.getItem('esx-services-language'); if (interfaceLanguages.some(l => l.code === saved)) {
      // Restore this page's saved preference after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(saved as InterfaceLanguage);
    } } catch {}
  }, []);
  function chooseLanguage(value: InterfaceLanguage) { setLanguage(value); try { localStorage.setItem('esx-services-language', value); } catch {} }
  const languageName = (code: string) => new Intl.DisplayNames([language], { type: 'language' }).of(code) ?? code;
  const languageOptions = Object.keys(serviceLanguages).map(code => <option key={code} value={code}>{languageName(code)}</option>);

  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [filters, setFilters] = useState(empty);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      try {
        const rows: ServiceListing[] = [];
        // Fetch every page: Supabase's default row limit must not silently hide listings.
        for (let from = 0; ; from += 500) {
          const { data, error } = await supabase.from('esx_service_listings')
            .select('id,name,description,city,category,address,phone,website,social_links,service_languages,has_interpreter,interpreter_languages')
            .eq('status', 'published').order('name').order('id').range(from, from + 499).abortSignal(controller.signal);
          if (error) throw error;
          rows.push(...(data as ServiceListing[]));
          if (data.length < 500) break;
        }
        if (active) { setListings(rows); setStatus('ready'); }
      } catch { if (active) setStatus('error'); }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [attempt]);
  function update<K extends keyof ServiceFilters>(key: K, value: ServiceFilters[K]) { setFilters(current => ({ ...current, [key]: value })); }
  const visible = listings.filter(s => matchesService(s, filters));
  const cities = [...new Set(listings.map(s => s.city))].sort((a,b) => a.localeCompare(b, 'ru'));
  const categories = [...new Set(listings.map(s => s.category))].sort((a,b) => a.localeCompare(b, 'ru'));
  return <div className="services-page" lang={language}>
    <header className="services-top"><Link href="/" aria-label={"ESX — " + t[2]}>ESX<span> / {t[1]}</span></Link><nav aria-label={t[36]}><Link href="/">{t[2]}</Link><Link href="/chat">{t[3]} ↗</Link></nav><div className="services-interface-language"><span id="services-language-label">{t[0]}</span><details className="services-language-picker" onKeyDown={e => { if (e.key === 'Escape') { e.currentTarget.open = false; e.currentTarget.querySelector('summary')?.focus(); } }}><summary aria-labelledby="services-language-label services-language-value"><Image src={'/flags/' + flags[language] + '.svg'} alt="" width={24} height={16} unoptimized /><span id="services-language-value">{interfaceLanguages.find(l => l.code === language)?.name}</span><span aria-hidden="true">▾</span></summary><ul aria-labelledby="services-language-label">{interfaceLanguages.map(l => <li key={l.code}><button type="button" lang={l.code} aria-pressed={language === l.code} onClick={e => { chooseLanguage(l.code); const picker = e.currentTarget.closest('details'); if (picker) { picker.open = false; picker.querySelector('summary')?.focus(); } }}><Image src={'/flags/' + flags[l.code] + '.svg'} alt="" width={24} height={16} unoptimized /><span>{l.name}</span>{language === l.code && <span aria-hidden="true">✓</span>}</button></li>)}</ul></details></div></header>
    <main className="services-main"><section className="services-intro"><p className="services-eyebrow">ESX • {t[4]}</p><h1>{t[5]}</h1><p>{t[6]}</p></section>
    <AdminEntry language={language} />
    <section className="services-filters" aria-label={t[7]}>
      <label>{t[8]}<select value={filters.city} onChange={e => update('city', e.target.value)}><option value="">{t[9]}</option>{cities.map(city => <option key={city}>{city}</option>)}</select></label>
      <label>{t[10]}<select value={filters.category} onChange={e => update('category', e.target.value)}><option value="">{t[11]}</option>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
      <label>{t[12]}<select value={filters.language} onChange={e => update('language', e.target.value)}><option value="">{t[13]}</option>{languageOptions}</select></label>
      <label>{t[14]}<select value={filters.interpreterLanguage} onChange={e => update('interpreterLanguage', e.target.value)}><option value="">{t[13]}</option>{languageOptions}</select></label>
      <label className="services-check"><input type="checkbox" checked={filters.interpreter} onChange={e => update('interpreter', e.target.checked)} />{t[15]}</label>
      <button type="button" onClick={() => setFilters(empty)}>{t[16]}</button>
    </section>
    <p className="services-note">{t[17]}</p>
    <div aria-live="polite" role="status">{status === 'loading' ? <p>{t[18]}</p> : status === 'error' ? <div className="services-empty"><h2>{t[19]}</h2><p>{t[20]}</p><button onClick={() => { setStatus('loading'); setAttempt(a => a + 1); }}>{t[21]}</button></div> : <p>{t[22]} {visible.length}</p>}</div>
    {status === 'ready' && !visible.length && <div className="services-empty"><h2>{listings.length ? t[23] : t[24]}</h2><p>{listings.length ? t[25] : t[26]}</p></div>}
    {status === 'ready' && <section className="services-grid" aria-label={t[27]}>{visible.map(s => { const website = safeServiceWebsite(s.website); return <article key={s.id} className="services-card"><p className="services-eyebrow">{s.city} · {s.category}</p><h2>{s.name}</h2><p>{s.description}</p><address>{s.address}</address><div className="services-tags">{s.service_languages.map(l => <span key={l}>{languageName(l)}</span>)}</div><p className="services-interpreter">{s.has_interpreter ? t[28] + " " + s.interpreter_languages.map(l => languageName(l)).join(', ') : t[29]}</p><div className="services-contacts">{s.phone && <a href={'tel:' + s.phone.replace(/[^+0-9]/g, '')}>{s.phone}</a>}{website && <a href={website} target="_blank" rel="noopener noreferrer">{t[30]} ↗</a>}{validSocialLinks(s.social_links).map((link,index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">{link.network === "other" ? t[37] : socialNetworks[link.network]} ↗</a>)}</div></article>; })}</section>}
    <aside className="services-business"><h2>{t[31]}</h2><p>{t[32]}</p><Link href="/contact">{t[33]} ↗</Link></aside>
    </main><footer className="services-footer">ESX · {t[34]} · <Link href="/admin">{t[35]}</Link></footer></div>;
}
