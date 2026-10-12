"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { companyPhones, companyPhotos, phoneLabels } from '@/lib/service-media';
import { serviceItems, splitServiceDescription } from '@/lib/service-description';
import { hoursLabels, weekdayName, validBusinessHours } from '@/lib/service-hours';
import AdminEntry from '@/app/admin/AdminEntry';
import { supabase } from '@/lib/supabase';
import { matchesService, safeServiceWebsite, serviceLanguages, type ServiceListing, type ServiceFilters } from '@/lib/service-directory';
import './services.css';
import { interfaceLanguages, serviceLabels, type InterfaceLanguage } from './serviceLabels';
import { socialNetworks, validSocialLinks } from '@/lib/service-socials';
const copyLabels: Record<InterfaceLanguage, [string, string]> = {
ru: ['Адрес скопирован', 'Не удалось скопировать адрес. Выделите его и скопируйте вручную.'],
en: ['Address copied', 'Could not copy. Select and copy the address manually.'],
ko: ['주소가 복사되었습니다', '주소를 선택하여 직접 복사해 주세요.'],
uz: ['Manzil nusxalandi', 'Manzilni qo‘lda nusxalang.'],
zh: ['地址已复制', '请手动选择并复制地址。'],
vi: ['Đã sao chép địa chỉ', 'Vui lòng sao chép địa chỉ thủ công.'],
tr: ['Adres kopyalandı', 'Lütfen adresi elle kopyalayın.'],
};
function SmoothDescription({ text, expanded }: { text: string; expanded: boolean }) {
  const content = useRef<HTMLParagraphElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const node = content.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setHeight(node.getBoundingClientRect().height));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div className="services-description-wrap" style={{ height: height === null ? undefined : expanded ? height : Math.min(height, 79.2) }}><p ref={content} className="services-description">{text}</p></div>;
}
function MapAddress({ address, language }: { address: string; language: InterfaceLanguage }) {
  const [status, setStatus] = useState<'copied' | 'error' | null>(null);
  async function copyAddress() {
    try { await navigator.clipboard.writeText(address); setStatus('copied'); }
    catch { setStatus('error'); }
  }
  const query = encodeURIComponent(address.trim());
  return <><address><a className="services-map-address" href={'https://map.kakao.com/link/search/' + query} target="_blank" rel="noopener noreferrer" onClick={() => { void copyAddress(); }}>{address} ↗</a></address><div className="services-map-links"><a href={'https://map.kakao.com/link/search/' + query} target="_blank" rel="noopener noreferrer" onClick={() => { void copyAddress(); }}>Kakao Map ↗</a><a href={'https://map.naver.com/p/search/' + query} target="_blank" rel="noopener noreferrer" onClick={() => { void copyAddress(); }}>Naver Map ↗</a></div><p className="services-copy-status" role="status">{status && copyLabels[language][status === 'copied' ? 0 : 1]}</p></>;
}
const sectionLabels: Record<InterfaceLanguage, [string, string, string]> = {
  ru: ['Описание', 'Услуги', 'Наш адрес:'], en: ['Description', 'Services', 'Our address:'],
  ko: ['소개', '서비스', '주소:'], uz: ['Tavsif', 'Xizmatlar', 'Bizning manzil:'],
  zh: ['介绍', '服务', '我们的地址：'], vi: ['Mô tả', 'Dịch vụ', 'Địa chỉ:'],
  tr: ['Açıklama', 'Hizmetler', 'Adresimiz:'],
};
function cardContent(description: string) {
  const content = splitServiceDescription(description);
  if (content.services) return content;
  // Display legacy descriptions with a trailing bullet list as separate sections.
  const lines = content.description.split(/\r?\n/);
  const start = lines.findIndex(line => /^\s*[-•●*]\s+\S/.test(line));
  if (start < 0 || !lines.slice(start).every(line => !line.trim() || /^\s*[-•●*]\s+\S/.test(line))) return content;
  return { description: lines.slice(0, start).join('\n'), services: lines.slice(start).join('\n') };
}
const detailLabels: Record<InterfaceLanguage, [string, string]> = {
  ru: ['Подробнее', 'Свернуть'], en: ['More details', 'Show less'],
  ko: ['자세히 보기', '접기'], uz: ['Batafsil', 'Yig‘ish'],
  zh: ['查看详情', '收起'], vi: ['Xem thêm', 'Thu gọn'], tr: ['Daha fazla', 'Daralt'],
};
const translationLabels: Record<InterfaceLanguage,[string,string]> = {ru:['Переводим карточки…','Перевод недоступен. Показан оригинал.'],en:['Translating listings…','Translation unavailable. Showing original.'],ko:['업체 정보 번역 중…','번역할 수 없어 원문을 표시합니다.'],uz:['Tarjima qilinmoqda…','Tarjima mavjud emas. Asl matn ko‘rsatilmoqda.'],zh:['正在翻译…','翻译不可用，显示原文。'],vi:['Đang dịch…','Không thể dịch. Hiển thị bản gốc.'],tr:['Çevriliyor…','Çeviri kullanılamıyor. Orijinal gösteriliyor.']};
type CardTranslation = {description:string;city:string;category:string};
const managerLabels: Record<InterfaceLanguage,string> = {ru:"Есть менеджер",en:"Manager available",ko:"매니저 있음",uz:"Menejer bor",zh:"有经理",vi:"Có quản lý",tr:"Yönetici mevcut"};
const flags = { ru: 'ru', uz: 'uz', zh: 'cn', vi: 'vn', en: 'gb', ko: 'kr', tr: 'tr' } as const;
const searchLabels: Record<InterfaceLanguage, string> = { ru: 'Поиск по названию компании', en: 'Search by company name', ko: '업체명 검색', uz: 'Kompaniya nomi bo‘yicha qidirish', zh: '按公司名称搜索', vi: 'Tìm theo tên công ty', tr: 'Şirket adına göre ara' };
const empty: ServiceFilters = { query: '', city: '', category: '', language: '', interpreter: false, interpreterLanguage: '' };
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

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [translations, setTranslations] = useState<Record<string,CardTranslation>>({});
  const [translationStatus, setTranslationStatus] = useState('');
  const [translationRetry, setTranslationRetry] = useState(0);
  const translationCache = useRef(new Map<string,CardTranslation>());
  useEffect(() => {
    const controller = new AbortController();
    const keyFor = (s: ServiceListing) => JSON.stringify([language,s.id,s.description,s.city,s.category]);
    async function translate() {
      setTranslations({});
      setTranslationStatus(listings.length ? 'loading' : '');
      let failed = false;
      for (const listing of listings) {
        if(controller.signal.aborted) return;
        try {
          const key=keyFor(listing);
          let value=translationCache.current.get(key);
          if(!value){
            const response=await fetch('/api/services/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:listing.id,target:language}),signal:controller.signal});
            if(!response.ok)throw Error('translation');
            value=await response.json() as CardTranslation;
            if(!value || typeof value.description!=='string' || typeof value.city!=='string' || typeof value.category!=='string')throw Error('format');
            translationCache.current.set(key,value);
          }
          if(!controller.signal.aborted)setTranslations(current=>({...current,[key]:value!}));
        } catch {if(controller.signal.aborted)return;failed=true;}
      }
      if(!controller.signal.aborted)setTranslationStatus(failed?'error':'');
    }
    void translate();return ()=>controller.abort();
  },[language,listings,translationRetry]);
  const translatedCard = (s: ServiceListing) => translations[JSON.stringify([language,s.id,s.description,s.city,s.category])];
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
            .select('id,name,description,city,category,address,phone,phones,photo,photos,business_hours,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages')
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
      <label className="services-company-search">{searchLabels[language]}<input type="search" value={filters.query ?? ''} onChange={e => update('query', e.target.value)} placeholder={searchLabels[language]} /></label>
      <label>{t[8]}<select value={filters.city} onChange={e => update('city', e.target.value)}><option value="">{t[9]}</option>{cities.map(city => <option key={city} value={city}>{listings.map(s => s.city === city ? translatedCard(s)?.city : undefined).find(Boolean) ?? city}</option>)}</select></label>
      <label>{t[10]}<select value={filters.category} onChange={e => update('category', e.target.value)}><option value="">{t[11]}</option>{categories.map(category => <option key={category} value={category}>{listings.map(s => s.category === category ? translatedCard(s)?.category : undefined).find(Boolean) ?? category}</option>)}</select></label>
      <label>{t[12]}<select value={filters.language} onChange={e => update('language', e.target.value)}><option value="">{t[13]}</option>{languageOptions}</select></label>
      <label>{t[14]}<select value={filters.interpreterLanguage} onChange={e => update('interpreterLanguage', e.target.value)}><option value="">{t[13]}</option>{languageOptions}</select></label>
      <label className="services-check"><input type="checkbox" checked={filters.interpreter} onChange={e => update('interpreter', e.target.checked)} />{t[15]}</label>
      <button type="button" onClick={() => setFilters(empty)}>{t[16]}</button>
    </section>
    <p className="services-note">{t[17]}</p>{translationStatus && <p role="status">{translationLabels[language][translationStatus === 'error' ? 1 : 0]} {translationStatus === 'error' && <button type="button" onClick={() => setTranslationRetry(n=>n+1)}>{t[21]}</button>}</p>}
    <div aria-live="polite" role="status">{status === 'loading' ? <p>{t[18]}</p> : status === 'error' ? <div className="services-empty"><h2>{t[19]}</h2><p>{t[20]}</p><button onClick={() => { setStatus('loading'); setAttempt(a => a + 1); }}>{t[21]}</button></div> : <p>{t[22]} {visible.length}</p>}</div>
    {status === 'ready' && !visible.length && <div className="services-empty"><h2>{listings.length ? t[23] : t[24]}</h2><p>{listings.length ? t[25] : t[26]}</p></div>}
    {status === 'ready' && <section className="services-grid" aria-label={t[27]}>{visible.map(s => { const website = safeServiceWebsite(s.website); const expanded = expandedCards.has(s.id); const photos = companyPhotos(s); const translated = translatedCard(s); const content = cardContent(translated?.description ?? s.description); const items = serviceItems(content.services); return <article key={s.id} className="services-card" data-expanded={expanded}><p className="services-eyebrow">{translated?.city ?? s.city} · {translated?.category ?? s.category}</p><h2>{s.name}</h2>{photos.length > 0 && <Image className="company-photo" src={photos[0]} alt={s.name} width={800} height={600} unoptimized />}<section className="services-card-section"><h3>{sectionLabels[language][0]}</h3><SmoothDescription text={content.description} expanded={expanded} /></section><div id={`service-details-${s.id}`} className="services-reveal" aria-hidden={!expanded} inert={!expanded}><div className="services-reveal-inner">{photos.length > 1 && <div className="services-photo-gallery">{photos.slice(1).map((photo, index) => <Image key={index} src={photo} alt={s.name + " — " + (index + 2)} width={800} height={600} unoptimized />)}</div>}{items.length > 0 && <section className="services-card-section"><h3>{sectionLabels[language][1]}</h3><ul className="services-item-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}<section className="services-card-section"><h3>{sectionLabels[language][2]}</h3><MapAddress address={s.address} language={language} /></section>{s.business_hours && validBusinessHours(s.business_hours) && <section className="services-card-section services-hours"><h3>{hoursLabels[language][0]}</h3><p>{s.business_hours.days.map(day=>weekdayName(day,language)).join(', ')}</p><p>{s.business_hours.opens} – {s.business_hours.closes}{s.business_hours.closes < s.business_hours.opens && ' ('+hoursLabels[language][4]+')'}</p><p>{s.business_hours.lunchStart ? hoursLabels[language][2]+': '+s.business_hours.lunchStart+' – '+s.business_hours.lunchEnd : hoursLabels[language][3]}</p></section>}<div className="services-card-section"><div className="services-tags">{s.service_languages.map(l => <span key={l}>{languageName(l)}</span>)}</div><p className="services-interpreter">{s.has_interpreter ? t[28] + " " + s.interpreter_languages.map(l => languageName(l)).join(', ') : t[29]}</p>{s.has_manager && <p className="services-interpreter"><span aria-hidden="true">✓ </span>{managerLabels[language]}</p>}</div><div className="services-contacts services-card-section">{companyPhones(s).map((phone,index) => <a key={index} href={'tel:' + phone.number.replace(/[^+0-9]/g, '')}>{phoneLabels[language][phone.type]}: {phone.number}</a>)}{website && <a href={website} target="_blank" rel="noopener noreferrer">{t[30]} ↗</a>}{validSocialLinks(s.social_links).map((link,index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">{link.network === "other" ? t[37] : socialNetworks[link.network]} ↗</a>)}</div></div></div><button type="button" className="services-details-toggle" aria-expanded={expanded} aria-controls={`service-details-${s.id}`} onClick={() => setExpandedCards(current => { const next = new Set(current); if (next.has(s.id)) next.delete(s.id); else next.add(s.id); return next; })}>{detailLabels[language][expanded ? 1 : 0]} <span aria-hidden="true">{expanded ? '▴' : '▾'}</span></button></article>; })}</section>}
    <aside className="services-business"><h2>{t[31]}</h2><p>{t[32]}</p><Link href="/contact">{t[33]} ↗</Link></aside>
    </main><footer className="services-footer">ESX · {t[34]} · <Link href="/admin">{t[35]}</Link></footer></div>;
}
