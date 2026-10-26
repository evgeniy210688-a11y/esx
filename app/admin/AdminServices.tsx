"use client";
import ServiceAccess from './ServiceAccess';
import SearchableSelect from '@/app/services/SearchableSelect';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { companyPhones, validCompanyPhones, prepareCompanyPhoto, companyPhotos, type CompanyPhone } from '@/lib/service-media';
import { joinServiceDescription, splitServiceDescription } from '@/lib/service-description';
import { validBusinessHours } from '@/lib/service-hours';
import BusinessHoursEditor from './BusinessHoursEditor';
import useAccount from '@/app/account/useAccount';
import { supabase } from '@/lib/supabase';
import BranchEditor from './BranchEditor';
import ServicesBackToTop from '../services/ServicesBackToTop';
import { matchesService, serviceCategory, isPersonalListing, validListingIdentity, listingKindLabels, type ListingKind, normalizeServiceCity, validServiceBranches, serviceLanguages, type ServiceListing, type ServiceLanguage } from '@/lib/service-directory';
import '../services/services.css';
import './admin.css';
import { socialNetworks, validSocialLinks, type SocialLink } from '@/lib/service-socials';
import { serviceCityGroups, serviceCategories } from '@/lib/service-options';
type Listing = ServiceListing & { role?: string; services?: string; status: 'draft' | 'pending' | 'published' | 'archived' };
const blank: Listing = { listing_kind: 'company', branches: [], id: '', name: '', description: '', city: '', category: '', address: '', phone: '', phones: [], photo: null, website: '', social_links: [], service_languages: [], has_interpreter: false, interpreter_languages: [], status: 'draft' };
const statuses = { draft: 'Черновик', pending: 'На проверке', published: 'Опубликовано', archived: 'В архиве' };
function editableDescription(description: string) {
  const content = splitServiceDescription(description);
  const match = content.description.match(/^Должность: ([^\n]+)\n\n/);
  return {...content, role: match?.[1] ?? '', description: match ? content.description.slice(match[0].length) : content.description};
}
export default function AdminServices() {
  const { user, ready } = useAccount();
  return <div className="services-page admin-page" lang="ru"><header className="services-top"><Link className="services-brand" href="/" aria-label="ESX — Главная"><Image src="/esx-logo.png" alt="ESX" width={80} height={80} sizes="(max-width: 540px) 64px, 80px" preload /><span> / Администратор</span></Link><nav aria-label="Навигация"><Link href="/services">Услуги</Link><Link href="/account">Мой аккаунт</Link></nav></header><main className="services-main">
    {!ready ? <p role="status">Проверяем вход…</p> : !user || user.is_anonymous ? <AdminLogin /> : <AdminPanel key={user.id} userId={user.id} email={user.email ?? ''} />}
  </main><ServicesBackToTop language="ru" /></div>;
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
  const [newCategory, setNewCategory] = useState(false);
  useEffect(() => { setNewCategory(false); }, [draft.id]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const categoryOf = (row: Listing) => serviceCategory(row).trim() || 'Без категории';
  const categories = [...new Set(rows.map(categoryOf))].sort((a, b) => a.localeCompare(b, 'ru'));
  const filteredRows = rows.filter(row => (!statusFilter || row.status === statusFilter) && (!category || categoryOf(row) === category) && matchesService(row, {
    query, city: '', category: '', language: '', interpreter: false, interpreterLanguage: '',
  }));
  const groups = categories.map(name => ({ name, rows: filteredRows.filter(row => categoryOf(row) === name) })).filter(group => group.rows.length);

  const personal = isPersonalListing(draft);
  const [supportsPeople, setSupportsPeople] = useState(true);
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
          let result = await supabase.from('esx_service_listings').select('categories,listing_kind,id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages,status').order('name').order('id').range(from, from + 499).returns<Listing[]>();
          if (result.error?.code === '42703') {
            result = await supabase.from('esx_service_listings').select('listing_kind,id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages,status').order('name').order('id').range(from, from + 499).returns<Listing[]>();
          }
          if (result.error?.code === '42703') {
            if (active) setSupportsPeople(false);
            result = await supabase.from('esx_service_listings').select('id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages,status').order('name').order('id').range(from, from + 499).returns<Listing[]>();
          }
          if (result.error || !result.data) throw result.error ?? new Error('No listings returned');
          all.push(...result.data as Listing[]);
          if (result.data.length < 500) break;
        }
        if (active) { setRows(all); setAccess('allowed'); }
      } catch { if (active) setAccess('error'); }
    }
    void load(); return () => { active = false; };
  }, [userId, attempt]);
  useEffect(() => {
    if (access !== 'allowed' || new URLSearchParams(window.location.search).get('newBranch') !== '1') return;
    try {
      const saved = sessionStorage.getItem('esx-new-branch');
      if (!saved) return;
      const payload = JSON.parse(saved);
      if (payload.userId !== userId || !payload.draft || typeof payload.draft.name !== 'string') return;
      setDraft({ ...payload.draft, id: '', branches: [], status: 'draft' });
      sessionStorage.removeItem('esx-new-branch');
      window.history.replaceState(null, '', '/admin');
      setMessage('Новая карточка филиала. Все данные перенесены — измените город и адрес, затем сохраните.');
    } catch { setMessage('Не удалось загрузить данные филиала. Откройте его повторно из исходной карточки.'); }
  }, [access, userId]);
  async function signOut() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try { const { error } = await supabase.auth.signOut({ scope: 'local' }); if (error) throw error; }
    catch { setMessage('Не удалось выйти. Попробуйте ещё раз.'); }
    finally { lock.current = false; setBusy(false); }
  }
  function change<K extends keyof Listing>(key: K, value: Listing[K]) { setDraft(d => ({ ...d, [key]: value })); }
  async function uploadPhoto(files: File[]) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try { const existing = companyPhotos(draft); if (files.length + existing.length > 3) { setMessage('Можно добавить не более 3 фото всего.'); return; } const added: string[] = []; for (const file of files) added.push(await prepareCompanyPhoto(file)); const photos = [...existing, ...added]; setDraft(d => ({ ...d, photos, photo: photos[0] ?? null })); setMessage('Фото подготовлены. Нажмите «Сохранить карточку».'); }
    catch { setMessage('Не удалось обработать фото. Выберите JPG, PNG или WebP до 10 МБ.'); }
    finally { lock.current = false; setBusy(false); }
  }
  function addBranchCard() {
    if (lock.current || personal) return;
    const branchTab = window.open('about:blank', '_blank');
    if (!branchTab) { setMessage('Разрешите открытие новой вкладки, чтобы добавить филиал.'); return; }
    try {
      const branch = { ...structuredClone(draft), id: '', branches: [], status: 'draft' };
      branchTab.sessionStorage.setItem('esx-new-branch', JSON.stringify({ userId, draft: branch }));
      branchTab.opener = null;
      branchTab.location.replace('/admin?newBranch=1');
      setMessage('Филиал открыт в новой вкладке. Измените там адрес и сохраните карточку.');
    } catch {
      branchTab.close();
      setMessage('Не удалось перенести данные в новую вкладку. Проверьте доступность хранилища браузера и попробуйте снова.');
    }
  }
  function changePhones(phones: CompanyPhone[]) { setDraft(d => ({ ...d, phones, phone: phones[0]?.number || null })); }
  function toggle(key: 'service_languages' | 'interpreter_languages', code: ServiceLanguage) {
    setDraft(d => ({ ...d, [key]: d[key].includes(code) ? d[key].filter(l => l !== code) : [...d[key], code] }));
  }
  async function deleteListing() {
    if (lock.current || !draft.id) return;
    const id = draft.id;
    const name = rows.find(row => row.id === id)?.name || draft.name;
    if (!window.confirm(`Удалить карточку «${name}» навсегда? Она исчезнет с сайта. Это действие нельзя отменить.`)) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const { data, error } = await supabase.from('esx_service_listings').delete().eq('id', id).select('id').single();
      if (error || !data) throw error ?? new Error('Not deleted');
      setRows(current => current.filter(row => row.id !== id));
      setDraft({ ...blank });
      setMessage(`Карточка «${name}» удалена.`);
    } catch { setMessage('Не удалось удалить карточку. Проверьте соединение и права доступа.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (lock.current) return;
    if (!personal && (!draft.service_languages.length || (draft.has_interpreter && !draft.interpreter_languages.length))) { setMessage('Выберите язык обслуживания и, при наличии переводчика, его язык.'); return; }
    if (personal && !(newCategory ? draft.role : draft.category)?.trim()) { setMessage('Выберите категорию специалиста из списка.'); return; }
    if (!validListingIdentity(draft)) { setMessage(personal ? 'Укажите имя и фамилию.' : 'Заполните название, город, категорию и адрес.'); return; }
    if (!validBusinessHours(draft.business_hours)) { setMessage('Проверьте режим работы: в каждой группе выберите неповторяющиеся дни, укажите часы работы и полный обеденный перерыв внутри рабочего времени.'); return; }
    const branches = (draft.branches ?? []).map(branch => ({ ...branch, name: branch.name.trim(), city: normalizeServiceCity(branch.city), address: branch.address.trim(), phone: branch.phone.trim() }));
    if (!personal && !validServiceBranches(branches)) { setMessage('Для каждого филиала заполните название, город и адрес. Проверьте номер телефона.'); return; }
    const phones = companyPhones(draft).map(p => ({ ...p, number: p.number.trim() }));
    if (personal && !phones.length) { setMessage('Добавьте номер телефона.'); return; }
    if (personal && !supportsPeople) { setMessage('Для сохранения личных карточек требуется обновление базы данных.'); return; }
    if (!validCompanyPhones(phones)) { setMessage('Проверьте номера телефонов: от 3 до 30 символов, цифры, +, пробелы, скобки и дефис.'); return; }
    const socials = (draft.social_links ?? []).map(link => ({ ...link, url: link.url.trim() }));
    if (validSocialLinks(socials).length !== socials.length) { setMessage('Для каждой соцсети укажите полную ссылку, начинающуюся с https:// или http://.'); return; }
    lock.current = true; setBusy(true); setMessage('');
    const description = joinServiceDescription((personal && draft.role?.trim() ? 'Должность: ' + draft.role.trim() + '\n\n' : '') + draft.description, draft.services ?? '');
    if (description.length > 5000) { lock.current = false; setBusy(false); setMessage('Описание и услуги вместе должны содержать не более 5000 символов.'); return; }
    const values = { ...(supportsPeople ? { listing_kind: draft.listing_kind ?? 'company' } : {}), branches: personal ? [] : branches, has_manager: personal ? draft.listing_kind === 'manager' : !!draft.has_manager, business_hours: draft.business_hours ?? null, name: draft.name.trim(), represented_company: personal ? draft.represented_company?.trim() || null : null, description, city: normalizeServiceCity(draft.city), category: (personal && newCategory ? draft.role?.trim() : draft.category.trim()) || (personal ? listingKindLabels[draft.listing_kind!] : ''), address: draft.address.trim(), phone: phones[0]?.number || null, phones, photo: companyPhotos(draft)[0] ?? null, photos: companyPhotos(draft), website: draft.website?.trim() || null, social_links: socials, service_languages: draft.service_languages, has_interpreter: personal ? draft.listing_kind === 'interpreter' : draft.has_interpreter, interpreter_languages: (personal ? draft.listing_kind === 'interpreter' : draft.has_interpreter) ? draft.interpreter_languages : [], status: draft.status };
    try {
      const query = draft.id ? supabase.from('esx_service_listings').update(values).eq('id', draft.id) : supabase.from('esx_service_listings').insert(values);
      const { data, error } = await query.select('id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages,status').single();
      if (error) throw error;
      const saved = { ...data, listing_kind: draft.listing_kind ?? 'company' } as Listing;
      setDraft({ ...saved, ...editableDescription(saved.description) }); setRows(current => [...current.filter(r => r.id !== saved.id), saved].sort((a,b) => a.name.localeCompare(b.name, 'ru')));
      setMessage(saved.status === 'published' ? 'Карточка сохранена и опубликована в справочнике.' : 'Карточка сохранена. Посетители её не видят.');
    } catch { setMessage('Сохранить не удалось. Проверьте поля и права доступа. Введённые данные сохранены в форме.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <><div className="admin-toolbar"><p>{email}</p><button disabled={busy} onClick={signOut}>Выйти из аккаунта ESX</button></div>
    {access === 'loading' && <p role="status">Проверяем права…</p>}
    {access === 'denied' && <section className="services-empty"><h1>Нет доступа администратора</h1><p>Этому аккаунту не назначены права управления услугами. Войдите в аккаунт администратора.</p></section>}
    {access === 'error' && <section className="services-empty"><h1>Не удалось проверить доступ</h1><button onClick={() => { setAccess('loading'); setAttempt(n => n + 1); }}>Повторить</button></section>}
    {access === 'allowed' && <><h1>Панель управления</h1><div className="admin-summary">{Object.entries(statuses).map(([status, label]) => <button type="button" key={status} aria-pressed={statusFilter === status} aria-controls="admin-listings" onClick={() => { setStatusFilter(status); setQuery(''); setCategory(''); document.getElementById('admin-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><strong>{rows.filter(row => row.status === status).length}</strong><span>{label}</span></button>)}</div><h2>Компании и специалисты</h2><p>Добавляйте компании, специалистов и переводчиков, редактируйте карточки и выбирайте, что показывать в справочнике.</p><div className="admin-columns"><section id="admin-listings" aria-label="Компании и специалисты" className="services-card"><button disabled={busy} onClick={() => { if (draft.name && !window.confirm('Открыть новую карточку? Несохранённые изменения будут потеряны.')) return; setDraft({ ...blank }); setMessage(''); form.current?.scrollIntoView({ behavior: 'smooth' }); }}>+ Добавить карточку</button>
      {!personal && <div style={{ marginTop: 12 }}><button type="button" disabled={busy || !draft.name.trim()} onClick={addBranchCard}>+ Добавить филиал</button></div>}
      <div className="admin-list-filters">
        <label htmlFor="admin-list-status">Статус заявки</label>
        <SearchableSelect id="admin-list-status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Все статусы</option>
          {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label} ({rows.filter(row => row.status === value).length})</option>)}
        </SearchableSelect>
        <label htmlFor="admin-list-search">Поиск карточек</label>
        <input id="admin-list-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Название, город, услуга…" />
        <label htmlFor="admin-list-category">Категория</label>
        <SearchableSelect id="admin-list-category" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          {[...new Set([...categories, ...(category ? [category] : [])])].map(name => <option key={name} value={name}>{name}</option>)}
        </SearchableSelect>
        {(query || category || statusFilter) && <button type="button" onClick={() => { setQuery(''); setCategory(''); setStatusFilter(''); }}>Сбросить фильтры</button>}
      </div>
      <p role="status" aria-live="polite">Найдено: {filteredRows.length} из {rows.length}</p>
      {!rows.length ? <p>Карточек пока нет.</p> : !filteredRows.length && <p>Ничего не найдено. Измените запрос или категорию.</p>}
      {groups.map(group => <section className="admin-category" key={group.name} aria-label={group.name}>
        <h3>{group.name} <span>{group.rows.length}</span></h3>
        <ul className="admin-list">{group.rows.map(row => <li key={row.id}><button disabled={busy} aria-pressed={draft.id === row.id} onClick={() => { if (draft.name && !window.confirm('Открыть другую карточку? Несохранённые изменения будут потеряны.')) return; setDraft({ ...row, ...editableDescription(row.description) }); setMessage(''); form.current?.scrollIntoView({ behavior: 'smooth' }); }}><strong>{row.name}</strong><span>{[row.city, statuses[row.status]].filter(Boolean).join(' · ')}</span></button></li>)}</ul>
      </section>)}
    </section>
    <form id="company-form" ref={form} onSubmit={save} className="services-card admin-form"><h2>{draft.id ? 'Редактирование карточки' : 'Новая карточка'}</h2>{!personal && <nav aria-label="Разделы настроек компании"><a href="#company-branches">Адреса филиалов</a></nav>}<fieldset disabled={busy} className="admin-fields">
      {draft.categories && draft.categories.length > 1 && <p>Категории заявки: {draft.categories.join(', ')}</p>}
          <label>Тип карточки<SearchableSelect value={draft.listing_kind ?? 'company'} onChange={e => change('listing_kind', e.target.value as ListingKind)}>{Object.entries(listingKindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</SearchableSelect></label>
      {personal && <p>Укажите имя и фамилию, добавьте контактный телефон. Заполните описание, услуги и ссылки на соцсети. Город и адрес можно не указывать.</p>}
      {personal && !supportsPeople && <p role="alert">Сохранение личных карточек станет доступно после обновления базы данных.</p>}
      <label>{personal ? 'Имя и фамилия' : 'Название компании'}<input required maxLength={200} value={draft.name} onChange={e => change('name', e.target.value)} /></label>
      <label>Описание<textarea maxLength={5000} rows={4} value={draft.description} onChange={e => change('description', e.target.value)} /></label>
      <label>Услуги<textarea maxLength={5000} rows={6} aria-describedby="services-list-hint" value={draft.services ?? ''} onChange={e => change('services', e.target.value)} placeholder={"Письменные переводы\nУстные переводы\nУслуги юриста"} /></label><p id="services-list-hint">Каждая услуга — с новой строки. Круглые маркеры добавляются автоматически.</p>
      <BusinessHoursEditor value={draft.business_hours ?? null} onChange={value => change('business_hours', value)} />
      <label>{personal ? 'Город (необязательно)' : 'Город'}<input required={!personal} list="service-city-options" autoComplete="off" value={draft.city} onChange={e => change('city', e.target.value)} placeholder="Начните вводить город" /><datalist id="service-city-options">{serviceCityGroups.flatMap(group => group.cities.map(city => <option key={city.value} value={city.value}>{city.label} · {group.region}</option>))}</datalist></label>
      {personal && <label>Компания, которую представляет (необязательно)<input maxLength={200} value={draft.represented_company ?? ''} onChange={e => change('represented_company', e.target.value)} /></label>}
      {personal ? <><label>Категория специалиста<SearchableSelect required value={newCategory || (draft.category && !serviceCategories.some(category => category === serviceCategory(draft))) ? '__new__' : serviceCategory(draft)} onChange={e => { const category = e.target.value; setNewCategory(category === '__new__'); setDraft(d => ({ ...d, category: category === '__new__' ? '' : category, listing_kind: category === 'Переводчики' ? 'interpreter' : 'manager' })); }}><option value="" disabled>Выберите категорию</option>{serviceCategories.filter(category => category !== 'Другие услуги').map(category => <option key={category} value={category}>{category}</option>)}<option value="__new__">Новая услуга</option></SearchableSelect></label><label>Должность<input required={newCategory} maxLength={100} value={draft.role ?? ''} onChange={e => change('role', e.target.value)} placeholder="Введите должность" />{newCategory && <span>По должности будет создана новая категория.</span>}</label></> : <label>Категория<input required maxLength={100} list="service-category-options" autoComplete="off" value={draft.category} onChange={e => change('category', e.target.value)} placeholder="Начните вводить услугу или категорию" /><datalist id="service-category-options">{serviceCategories.map(category => <option key={category} value={category} />)}</datalist></label>}
      <label>{personal ? 'Адрес (необязательно)' : 'Адрес'}<input name="company-address" required={!personal} maxLength={500} value={draft.address} onChange={e => change('address', e.target.value)} placeholder="Хвасон, Мансе-гу, Чанан-мён" /><small>Город, район и населённый пункт через запятую. Можно добавить улицу и номер дома.</small></label>
      {!personal && <BranchEditor key={draft.id || "new"} branches={draft.branches ?? []} onChange={branches => change('branches', branches)} />}
      <fieldset className="admin-socials"><legend>{personal ? 'Телефон' : 'Телефоны компании'}</legend>{companyPhones(draft).map((phone,index) => <div className="admin-social-row" key={index}><label>Тип телефона {index + 1}<SearchableSelect value={phone.type} onChange={e => changePhones(companyPhones(draft).map((p,i) => i === index ? { ...p, type: e.target.value as CompanyPhone['type'] } : p))}><option value="office">Офисный</option><option value="mobile">Мобильный</option><option value="other">Другой / не указан</option></SearchableSelect></label><label>Номер телефона {index + 1}<input type="tel" required maxLength={30} value={phone.number} onChange={e => changePhones(companyPhones(draft).map((p,i) => i === index ? { ...p, number: e.target.value } : p))} placeholder="+82 10-1234-5678" /></label><button type="button" onClick={() => changePhones(companyPhones(draft).filter((_,i) => i !== index))}>Убрать телефон {index + 1}</button></div>)}<button type="button" disabled={companyPhones(draft).length >= 5} onClick={() => changePhones([...companyPhones(draft), { type: personal ? 'mobile' : 'office', number: '' }])}>+ Добавить телефон</button><p>До 5 номеров. Для каждого выберите тип.</p></fieldset>
      <fieldset className="admin-socials"><legend>{personal ? 'Фото' : 'Фото компании'} ({companyPhotos(draft).length}/3)</legend><p>До 3 фото: JPG, PNG или WebP, до 10 МБ каждое. Первое фото — обложка карточки.</p><div className="admin-photo-grid">{companyPhotos(draft).map((photo, index) => <div key={index}><Image className="company-photo" src={photo} alt={(personal ? "Фото специалиста " : "Фото компании ") + (index + 1)} width={800} height={600} unoptimized /><button type="button" onClick={() => { const photos = companyPhotos(draft).filter((_, i) => i !== index); setDraft(d => ({ ...d, photos, photo: photos[0] ?? null })); }}>Убрать фото {index + 1}</button></div>)}</div><label>Добавить фото<input type="file" multiple disabled={companyPhotos(draft).length >= 3} accept="image/jpeg,image/png,image/webp" onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ''; if (files.length) void uploadPhoto(files); }} /></label></fieldset>
      <label>Сайт<input type="url" pattern="https?://.*" value={draft.website ?? ''} onChange={e => change('website', e.target.value)} placeholder="https://example.com" /></label>
      <fieldset className="admin-socials"><legend>Социальные сети и мессенджеры</legend><p>Выберите сеть и вставьте полную ссылку на страницу или чат. Можно добавить до 12 ссылок.</p>{(draft.social_links ?? []).map((link,index) => <div key={index} className="admin-social-row"><label>Соцсеть {index + 1}<select value={link.network} onChange={e => change('social_links', (draft.social_links ?? []).map((item,i) => i === index ? { ...item, network: e.target.value as SocialLink['network'] } : item))}>{Object.entries(socialNetworks).map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label><label>Ссылка {index + 1}<input type="url" required pattern="https?://.*" maxLength={2000} placeholder="https://…" value={link.url} onChange={e => change('social_links', (draft.social_links ?? []).map((item,i) => i === index ? { ...item, url: e.target.value } : item))} /></label><button type="button" aria-label={'Убрать соцсеть ' + (index + 1)} onClick={() => change('social_links', (draft.social_links ?? []).filter((_,i) => i !== index))}>Убрать</button></div>)}<button type="button" disabled={(draft.social_links?.length ?? 0) >= 12} onClick={() => change('social_links', [...(draft.social_links ?? []), { network: 'telegram', url: '' }])}>+ Добавить соцсеть</button></fieldset>
      <fieldset className="admin-language"><legend>Языки обслуживания{personal ? ' (необязательно)' : ''}</legend>{Object.entries(serviceLanguages).map(([code,label]) => <label key={code}><input type="checkbox" checked={draft.service_languages.includes(code as ServiceLanguage)} onChange={() => toggle('service_languages', code as ServiceLanguage)} />{label}</label>)}</fieldset>
      {!personal && <><fieldset className="admin-socials"><legend>Менеджер</legend><label className="admin-check"><input type="checkbox" checked={!!draft.has_manager} onChange={e => change('has_manager', e.target.checked)} />Есть менеджер</label></fieldset><label className="admin-check"><input type="checkbox" checked={draft.has_interpreter} onChange={e => setDraft(d => ({ ...d, has_interpreter: e.target.checked, interpreter_languages: e.target.checked ? d.interpreter_languages : [] }))} />Есть переводчик</label></>}
      {(personal ? draft.listing_kind === 'interpreter' : draft.has_interpreter) && <fieldset className="admin-language"><legend>Языки переводчика{personal ? ' (необязательно)' : ''}</legend>{Object.entries(serviceLanguages).map(([code,label]) => <label key={code}><input type="checkbox" checked={draft.interpreter_languages.includes(code as ServiceLanguage)} onChange={() => toggle('interpreter_languages', code as ServiceLanguage)} />{label}</label>)}</fieldset>}
      <label>Публикация<select value={draft.status} onChange={e => change('status', e.target.value as Listing['status'])}>{Object.entries(statuses).map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label><p>Только статус «Опубликовано» показывает карточку посетителям. «В архиве» убирает её из справочника.</p><button disabled={busy}>{busy ? 'Сохраняем…' : 'Сохранить карточку'}</button>
    </fieldset>{draft.id && <button type="button" className="admin-delete" disabled={busy} onClick={deleteListing}>{personal ? 'Удалить специалиста' : 'Удалить компанию'}</button>}</form><ServiceAccess key={draft.id || "new"} listingId={draft.id} name={draft.name} /></div></>}
    <p className="admin-message" role="status" aria-live="polite">{message}</p></>;
}
