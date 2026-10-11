"use client";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import useAccount from '@/app/account/useAccount';
import { supabase } from '@/lib/supabase';
import { serviceLanguages, type ServiceListing, type ServiceLanguage } from '@/lib/service-directory';
import '../services/services.css';
import './admin.css';
import { socialNetworks, validSocialLinks, type SocialLink } from '@/lib/service-socials';
import { serviceCityGroups, serviceCategories } from '@/lib/service-options';
type Listing = ServiceListing & { status: 'draft' | 'pending' | 'published' | 'archived' };
const blank: Listing = { id: '', name: '', description: '', city: '', category: '', address: '', phone: '', website: '', social_links: [], service_languages: [], has_interpreter: false, interpreter_languages: [], status: 'draft' };
const statuses = { draft: 'Черновик', pending: 'На проверке', published: 'Опубликовано', archived: 'В архиве' };
export default function AdminServices() {
  const { user, ready } = useAccount();
  return <div className="services-page admin-page" lang="ru"><header className="services-top"><Link href="/">ESX / Администратор</Link><nav aria-label="Навигация"><Link href="/services">Услуги</Link><Link href="/account">Мой аккаунт</Link></nav></header><main className="services-main">
    {!ready ? <p role="status">Проверяем вход…</p> : !user || user.is_anonymous ? <AdminLogin /> : <AdminPanel key={user.id} userId={user.id} email={user.email ?? ''} />}
  </main></div>;
}
function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  async function login(event: FormEvent) {
    event.preventDefault(); if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setError('Не удалось войти. Проверьте email, пароль и подтверждение почты.');
    } catch { setError('Нет соединения. Попробуйте ещё раз.'); }
    finally { setPassword(''); lock.current = false; setBusy(false); }
  }
  return <section className="services-card admin-login"><p className="services-eyebrow">УПРАВЛЕНИЕ УСЛУГАМИ</p><h1>Вход администратора</h1><p>Войдите в аккаунт ESX, которому назначены права администратора.</p><form onSubmit={login} className="admin-form"><label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} /></label><label>Пароль<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /></label><button disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button><p role="alert">{error}</p></form></section>;
}
function AdminPanel({ userId, email }: { userId: string; email: string }) {
  const [access, setAccess] = useState<'loading' | 'allowed' | 'denied' | 'error'>('loading');
  const [rows, setRows] = useState<Listing[]>([]);
  const [draft, setDraft] = useState<Listing>(blank);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const lock = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: admin, error } = await supabase.from('esx_service_admins').select('user_id').eq('user_id', userId).maybeSingle();
        if (error) throw error;
        if (!admin) { if (active) setAccess('denied'); return; }
        const all: Listing[] = [];
        for (let from = 0; ; from += 500) {
          const result = await supabase.from('esx_service_listings').select('id,name,description,city,category,address,phone,website,social_links,service_languages,has_interpreter,interpreter_languages,status').order('name').order('id').range(from, from + 499);
          if (result.error) throw result.error;
          all.push(...result.data as Listing[]);
          if (result.data.length < 500) break;
        }
        if (active) { setRows(all); setAccess('allowed'); }
      } catch { if (active) setAccess('error'); }
    }
    void load(); return () => { active = false; };
  }, [userId, attempt]);
  async function signOut() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try { const { error } = await supabase.auth.signOut({ scope: 'local' }); if (error) throw error; }
    catch { setMessage('Не удалось выйти. Попробуйте ещё раз.'); }
    finally { lock.current = false; setBusy(false); }
  }
  function change<K extends keyof Listing>(key: K, value: Listing[K]) { setDraft(d => ({ ...d, [key]: value })); }
  function toggle(key: 'service_languages' | 'interpreter_languages', code: ServiceLanguage) {
    setDraft(d => ({ ...d, [key]: d[key].includes(code) ? d[key].filter(l => l !== code) : [...d[key], code] }));
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (lock.current) return;
    if (!draft.service_languages.length || (draft.has_interpreter && !draft.interpreter_languages.length)) { setMessage('Выберите язык обслуживания и, при наличии переводчика, его язык.'); return; }
    if (![draft.name, draft.city, draft.category, draft.address].every(value => value.trim())) { setMessage('Заполните название, город, категорию и адрес.'); return; }
    const socials = (draft.social_links ?? []).map(link => ({ ...link, url: link.url.trim() }));
    if (validSocialLinks(socials).length !== socials.length) { setMessage('Для каждой соцсети укажите полную ссылку, начинающуюся с https:// или http://.'); return; }
    lock.current = true; setBusy(true); setMessage('');
    const values = { name: draft.name.trim(), description: draft.description.trim(), city: draft.city.trim(), category: draft.category.trim(), address: draft.address.trim(), phone: draft.phone?.trim() || null, website: draft.website?.trim() || null, social_links: socials, service_languages: draft.service_languages, has_interpreter: draft.has_interpreter, interpreter_languages: draft.has_interpreter ? draft.interpreter_languages : [], status: draft.status };
    try {
      const query = draft.id ? supabase.from('esx_service_listings').update(values).eq('id', draft.id) : supabase.from('esx_service_listings').insert(values);
      const { data, error } = await query.select('id,name,description,city,category,address,phone,website,social_links,service_languages,has_interpreter,interpreter_languages,status').single();
      if (error) throw error;
      const saved = data as Listing;
      setDraft(saved); setRows(current => [...current.filter(r => r.id !== saved.id), saved].sort((a,b) => a.name.localeCompare(b.name, 'ru')));
      setMessage(saved.status === 'published' ? 'Карточка сохранена и опубликована в справочнике.' : 'Карточка сохранена. Посетители её не видят.');
    } catch { setMessage('Сохранить не удалось. Проверьте поля и права доступа. Введённые данные сохранены в форме.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <><div className="admin-toolbar"><p>{email}</p><button disabled={busy} onClick={signOut}>Выйти из аккаунта ESX</button></div>
    {access === 'loading' && <p role="status">Проверяем права…</p>}
    {access === 'denied' && <section className="services-empty"><h1>Нет доступа администратора</h1><p>Этому аккаунту не назначены права управления услугами. Войдите в аккаунт администратора.</p></section>}
    {access === 'error' && <section className="services-empty"><h1>Не удалось проверить доступ</h1><button onClick={() => { setAccess('loading'); setAttempt(n => n + 1); }}>Повторить</button></section>}
    {access === 'allowed' && <><h1>Управление услугами</h1><p>Добавляйте организации, редактируйте карточки и выбирайте, что показывать в справочнике.</p><div className="admin-columns"><section aria-label="Список организаций" className="services-card"><button disabled={busy} onClick={() => { if (draft.name && !window.confirm('Открыть новую карточку? Несохранённые изменения будут потеряны.')) return; setDraft({ ...blank }); setMessage(''); form.current?.scrollIntoView({ behavior: 'smooth' }); }}>+ Добавить организацию</button>{!rows.length && <p>Организаций пока нет.</p>}<ul className="admin-list">{rows.map(row => <li key={row.id}><button disabled={busy} aria-pressed={draft.id === row.id} onClick={() => { if (draft.name && !window.confirm('Открыть другую карточку? Несохранённые изменения будут потеряны.')) return; setDraft(row); setMessage(''); form.current?.scrollIntoView({ behavior: 'smooth' }); }}><strong>{row.name}</strong><span>{row.city} · {statuses[row.status]}</span></button></li>)}</ul></section>
    <form ref={form} onSubmit={save} className="services-card admin-form"><h2>{draft.id ? 'Редактирование карточки' : 'Новая организация'}</h2><fieldset disabled={busy} className="admin-fields">
      <label>Название<input required maxLength={200} value={draft.name} onChange={e => change('name', e.target.value)} /></label>
      <label>Описание<textarea maxLength={5000} rows={4} value={draft.description} onChange={e => change('description', e.target.value)} /></label>
      <label>Город<select required value={draft.city} onChange={e => change('city', e.target.value)}><option value="">Выберите город</option>{draft.city && !serviceCityGroups.some(group => group.cities.some(city => city.value === draft.city)) && <option value={draft.city}>{draft.city} (сохранённое значение)</option>}{serviceCityGroups.map(group => <optgroup key={group.region} label={group.region}>{group.cities.map(city => <option key={city.value} value={city.value}>{city.label}</option>)}</optgroup>)}</select></label>
      <label>Категория<select required value={draft.category} onChange={e => change('category', e.target.value)}><option value="">Выберите категорию</option>{draft.category && !serviceCategories.some(category => category === draft.category) && <option value={draft.category}>{draft.category} (сохранённое значение)</option>}{serviceCategories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
      <label>Адрес<input required maxLength={500} value={draft.address} onChange={e => change('address', e.target.value)} /></label>
      <label>Телефон<input type="tel" maxLength={30} value={draft.phone ?? ''} onChange={e => change('phone', e.target.value)} placeholder="+82 10-1234-5678" /></label>
      <label>Сайт<input type="url" pattern="https?://.*" value={draft.website ?? ''} onChange={e => change('website', e.target.value)} placeholder="https://example.com" /></label>
      <fieldset className="admin-socials"><legend>Социальные сети и мессенджеры</legend><p>Выберите сеть и вставьте полную ссылку на страницу или чат. Можно добавить до 12 ссылок.</p>{(draft.social_links ?? []).map((link,index) => <div key={index} className="admin-social-row"><label>Соцсеть {index + 1}<select value={link.network} onChange={e => change('social_links', (draft.social_links ?? []).map((item,i) => i === index ? { ...item, network: e.target.value as SocialLink['network'] } : item))}>{Object.entries(socialNetworks).map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label><label>Ссылка {index + 1}<input type="url" required pattern="https?://.*" maxLength={2000} placeholder="https://…" value={link.url} onChange={e => change('social_links', (draft.social_links ?? []).map((item,i) => i === index ? { ...item, url: e.target.value } : item))} /></label><button type="button" aria-label={'Убрать соцсеть ' + (index + 1)} onClick={() => change('social_links', (draft.social_links ?? []).filter((_,i) => i !== index))}>Убрать</button></div>)}<button type="button" disabled={(draft.social_links?.length ?? 0) >= 12} onClick={() => change('social_links', [...(draft.social_links ?? []), { network: 'telegram', url: '' }])}>+ Добавить соцсеть</button></fieldset>
      <fieldset className="admin-language"><legend>Языки обслуживания</legend>{Object.entries(serviceLanguages).map(([code,label]) => <label key={code}><input type="checkbox" checked={draft.service_languages.includes(code as ServiceLanguage)} onChange={() => toggle('service_languages', code as ServiceLanguage)} />{label}</label>)}</fieldset>
      <label className="admin-check"><input type="checkbox" checked={draft.has_interpreter} onChange={e => setDraft(d => ({ ...d, has_interpreter: e.target.checked, interpreter_languages: e.target.checked ? d.interpreter_languages : [] }))} />Есть живой переводчик</label>
      {draft.has_interpreter && <fieldset className="admin-language"><legend>Языки переводчика</legend>{Object.entries(serviceLanguages).map(([code,label]) => <label key={code}><input type="checkbox" checked={draft.interpreter_languages.includes(code as ServiceLanguage)} onChange={() => toggle('interpreter_languages', code as ServiceLanguage)} />{label}</label>)}</fieldset>}
      <label>Публикация<select value={draft.status} onChange={e => change('status', e.target.value as Listing['status'])}>{Object.entries(statuses).map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label><p>Только статус «Опубликовано» показывает карточку посетителям. «В архиве» убирает её из справочника.</p><button disabled={busy}>{busy ? 'Сохраняем…' : 'Сохранить карточку'}</button>
    </fieldset></form></div></>}
    <p className="admin-message" role="status" aria-live="polite">{message}</p></>;
}
