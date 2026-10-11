"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { matchesService, safeServiceWebsite, serviceLanguages, type ServiceListing, type ServiceFilters } from '@/lib/service-directory';
import './services.css';
import { socialNetworks, validSocialLinks } from '@/lib/service-socials';
const empty: ServiceFilters = { city: '', category: '', language: '', interpreter: false, interpreterLanguage: '' };
const languageOptions = Object.entries(serviceLanguages).map(([code, name]) => <option key={code} value={code}>{name}</option>);
export default function ServicesDirectory() {
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
  return <div className="services-page" lang="ru">
    <header className="services-top"><Link href="/" aria-label="ESX — главная">ESX<span> / Южная Корея</span></Link><nav aria-label="Навигация"><Link href="/">Главная</Link><Link href="/chat">Открыть чат ↗</Link></nav></header>
    <main className="services-main"><section className="services-intro"><p className="services-eyebrow">ESX • СПРАВОЧНИК УСЛУГ</p><h1>Нужная услуга.<br />На понятном языке.</h1><p>Найдите организацию в Южной Корее по городу, направлению и языку обслуживания.</p></section>
    <section className="services-filters" aria-label="Фильтры услуг">
      <label>Город<select value={filters.city} onChange={e => update('city', e.target.value)}><option value="">Все города</option>{cities.map(city => <option key={city}>{city}</option>)}</select></label>
      <label>Категория<select value={filters.category} onChange={e => update('category', e.target.value)}><option value="">Все категории</option>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
      <label>Язык обслуживания<select value={filters.language} onChange={e => update('language', e.target.value)}><option value="">Любой язык</option>{languageOptions}</select></label>
      <label>Язык живого переводчика<select value={filters.interpreterLanguage} onChange={e => update('interpreterLanguage', e.target.value)}><option value="">Любой язык</option>{languageOptions}</select></label>
      <label className="services-check"><input type="checkbox" checked={filters.interpreter} onChange={e => update('interpreter', e.target.checked)} />Есть живой переводчик</label>
      <button type="button" onClick={() => setFilters(empty)}>Сбросить фильтры</button>
    </section>
    <p className="services-note">Язык обслуживания и язык переводчика — отдельные параметры. Выбор языка переводчика показывает только организации с живым переводчиком.</p>
    <div aria-live="polite" role="status">{status === 'loading' ? <p>Загружаем организации…</p> : status === 'error' ? <div className="services-empty"><h2>Не удалось загрузить справочник</h2><p>Пожалуйста, попробуйте ещё раз позже.</p><button onClick={() => { setStatus('loading'); setAttempt(a => a + 1); }}>Повторить</button></div> : <p>Найдено организаций: {visible.length}</p>}</div>
    {status === 'ready' && !visible.length && <div className="services-empty"><h2>{listings.length ? 'Нет совпадений' : 'Справочник пополняется'}</h2><p>{listings.length ? 'Попробуйте другой город или измените фильтры.' : 'Организации появятся здесь после добавления администратором.'}</p></div>}
    {status === 'ready' && <section className="services-grid" aria-label="Организации">{visible.map(s => { const website = safeServiceWebsite(s.website); return <article key={s.id} className="services-card"><p className="services-eyebrow">{s.city} · {s.category}</p><h2>{s.name}</h2><p>{s.description}</p><address>{s.address}</address><div className="services-tags">{s.service_languages.map(l => <span key={l}>{serviceLanguages[l]}</span>)}</div><p className="services-interpreter">{s.has_interpreter ? 'Живой переводчик: ' + s.interpreter_languages.map(l => serviceLanguages[l]).join(', ') : 'Живой переводчик не указан'}</p><div className="services-contacts">{s.phone && <a href={'tel:' + s.phone.replace(/[^+0-9]/g, '')}>{s.phone}</a>}{website && <a href={website} target="_blank" rel="noopener noreferrer">Сайт организации ↗</a>}{validSocialLinks(s.social_links).map((link,index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">{socialNetworks[link.network]} ↗</a>)}</div></article>; })}</section>}
    <aside className="services-business"><h2>Представляете организацию?</h2><p>Сейчас карточки добавляет администратор ESX. Передайте сведения об услугах, адресе и доступных языках.</p><Link href="/contact">Связаться с ESX ↗</Link></aside>
    </main><footer className="services-footer">ESX · Общение без границ · <Link href="/admin">Вход администратора</Link></footer></div>;
}
