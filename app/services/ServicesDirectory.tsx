"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { companyPhones, companyPhotos, phoneLabels } from '@/lib/service-media';
import { serviceItems, splitServiceDescription } from '@/lib/service-description';
import { alwaysOpenLabels, hoursLabels, weekdayName, validBusinessHours } from '@/lib/service-hours';
import AdminEntry from '@/app/admin/AdminEntry';
import { supabase } from '@/lib/supabase';
import { isPersonalListing, normalizeServiceCity, serviceCities, matchesService, safeServiceWebsite, serviceLanguages, type ServiceListing, type ServiceFilters } from '@/lib/service-directory';
import './services.css';
import './services-light.css';
import './services-soft.css';
import ServiceFilterPicker from './ServiceFilterPicker';
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
  return <div className="services-description-wrap" style={{ height: expanded && height !== null ? height : '4.95em' }}><p ref={content} className="services-description">{text}</p></div>;
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
const branchLabels: Record<InterfaceLanguage, string> = { ru: 'Филиалы', en: 'Branches', ko: '지점', uz: 'Filiallar', zh: '分店', vi: 'Chi nhánh', tr: 'Şubeler' };
const detailLabels: Record<InterfaceLanguage, [string, string]> = {
  ru: ['Подробнее', 'Свернуть'], en: ['More details', 'Show less'],
  ko: ['자세히 보기', '접기'], uz: ['Batafsil', 'Yig‘ish'],
  zh: ['查看详情', '收起'], vi: ['Xem thêm', 'Thu gọn'], tr: ['Daha fazla', 'Daralt'],
};
const translationLabels: Record<InterfaceLanguage,[string,string]> = {ru:['Переводим карточки…','Перевод недоступен. Показан оригинал.'],en:['Translating listings…','Translation unavailable. Showing original.'],ko:['업체 정보 번역 중…','번역할 수 없어 원문을 표시합니다.'],uz:['Tarjima qilinmoqda…','Tarjima mavjud emas. Asl matn ko‘rsatilmoqda.'],zh:['正在翻译…','翻译不可用，显示原文。'],vi:['Đang dịch…','Không thể dịch. Hiển thị bản gốc.'],tr:['Çevriliyor…','Çeviri kullanılamıyor. Orijinal gösteriliyor.']};
type CardTranslation = {description:string;city:string;category:string};
const personRoleLabels: Record<InterfaceLanguage, { manager: string; interpreter: string }> = { ru: { manager: 'Менеджер', interpreter: 'Переводчик' }, en: { manager: 'Manager', interpreter: 'Interpreter' }, ko: { manager: '매니저', interpreter: '통역사' }, uz: { manager: 'Menejer', interpreter: 'Tarjimon' }, zh: { manager: '经理', interpreter: '口译员' }, vi: { manager: 'Người quản lý', interpreter: 'Phiên dịch viên' }, tr: { manager: 'Yönetici', interpreter: 'Tercüman' } };
const managerLabels: Record<InterfaceLanguage,string> = {ru:"Есть менеджер",en:"Manager available",ko:"매니저 있음",uz:"Menejer bor",zh:"有经理",vi:"Có quản lý",tr:"Yönetici mevcut"};
const directoryGroupLabels: Record<InterfaceLanguage, [string, string]> = { ru: ['Специалисты', 'Компании'], en: ['Specialists', 'Companies'], ko: ['전문가', '업체'], uz: ['Mutaxassislar', 'Kompaniyalar'], zh: ['专业人士', '公司'], vi: ['Chuyên gia', 'Công ty'], tr: ['Uzmanlar', 'Şirketler'] };
const flags = { ru: 'ru', uz: 'uz', zh: 'cn', vi: 'vn', en: 'gb', ko: 'kr', tr: 'tr' } as const;
const searchLabels: Record<InterfaceLanguage, string> = { ru: 'Поиск по названию компании', en: 'Search by company name', ko: '업체명 검색', uz: 'Kompaniya nomi bo‘yicha qidirish', zh: '按公司名称搜索', vi: 'Tìm theo tên công ty', tr: 'Şirket adına göre ara' };
function categoryArt(category: string): number {
  if (!category) return 0;
  const value = category.toLocaleLowerCase();
  if (/виз|иммигра|visa|immig/.test(value)) return 1;
  if (/достав|груз|логист|deliver|logist/.test(value)) return 2;
  if (/массаж|спа|massage|spa/.test(value)) return 3;
  if (/стомат|dent/.test(value)) return 6;
  if (/медицин|клиник|medic|clinic/.test(value)) return 4;
  if (/связ|интернет|internet|communicat/.test(value)) return 5;
  return 7;
}
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
  const languageOptions = Object.keys(serviceLanguages).map(code => ({value: code, label: languageName(code)}));

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const expandedCard = useRef<HTMLElement>(null);
  useEffect(() => {
    if (expandedCardId === null) return;
    const closeOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !expandedCard.current?.contains(event.target)) {
        setExpandedCardId(null);
      }
    };
    document.addEventListener('click', closeOutside, true);
    return () => document.removeEventListener('click', closeOutside, true);
  }, [expandedCardId]);
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
  const specialistCarousel = useRef<HTMLDivElement>(null);
  function scrollSpecialists(direction: number) {
    const track = specialistCarousel.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.services-card');
    track.scrollBy({ left: direction * ((card?.getBoundingClientRect().width ?? 320) + 22), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  const categoryCarousel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const track = categoryCarousel.current;
    const region = track?.closest('.services-category-carousel');
    if (!track || !region) return;

    let pointer: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;


    let cycleWidth = 0;
    let resumeAt = performance.now() + 2500;
    let previous = 0;
    let autoPosition: number | null = null;
    let frame = 0;
    const pause = () => { resumeAt = performance.now() + 1000; };

    const leave = () => { pause(); };

    const blur = () => { pause(); };
    const down = (event: PointerEvent) => {
      pause();

      dragged = false;
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      pointer = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
    };
    const move = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      const distance = event.clientX - startX;
      if (!dragged && Math.abs(distance) < 5) return;
      dragged = true;
      track.setPointerCapture(event.pointerId);
      track.dataset.dragging = 'true';
      track.scrollLeft = startScroll - distance;
      event.preventDefault();
    };
    const end = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      pointer = null;
      delete track.dataset.dragging;
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      pause();
    };
    const click = (event: MouseEvent) => {
      if (dragged && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); dragged = false; }
    };
    const animate = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      const groups = track.querySelectorAll<HTMLElement>('.services-category-group');
      const measured = groups.length > 1 ? groups[1].offsetLeft - groups[0].offsetLeft : 0;
      if (measured > 0 && measured !== cycleWidth) {
        const relative = cycleWidth ? track.scrollLeft % cycleWidth : 0;
        cycleWidth = measured;
        track.scrollLeft = cycleWidth + relative;
        autoPosition = null;
      }
      if (cycleWidth > 0) {
        const offset = track.scrollLeft < cycleWidth ? cycleWidth : track.scrollLeft >= cycleWidth * 2 ? -cycleWidth : 0;
        if (offset) {
          track.scrollLeft += offset;
          startScroll += offset;
          if (autoPosition !== null) autoPosition += offset;
        }
      }
      if (!document.hidden && !region.matches(':hover') && !region.querySelector(':focus-visible') && pointer === null && now > resumeAt && cycleWidth > 0) {


        autoPosition = (autoPosition ?? track.scrollLeft) + elapsed * 0.035;
        track.scrollLeft = autoPosition;
      }
      else { autoPosition = null; }
      frame = requestAnimationFrame(animate);
    };

    region.addEventListener('mouseleave', leave);

    region.addEventListener('focusout', blur);
    region.addEventListener('pointerdown', pause);
    track.addEventListener('pointerdown', down);
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('lostpointercapture', end);
    track.addEventListener('click', click, true);
    track.addEventListener('wheel', pause, { passive: true });
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);

      region.removeEventListener('mouseleave', leave);

      region.removeEventListener('focusout', blur);
      region.removeEventListener('pointerdown', pause);
      track.removeEventListener('pointerdown', down);
      track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', end);
      track.removeEventListener('pointercancel', end);
      track.removeEventListener('lostpointercapture', end);
      track.removeEventListener('click', click, true);
      track.removeEventListener('wheel', pause);
    };
  }, [listings.length]);
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
          let { data, error } = await supabase.from('esx_service_listings')
            .select('listing_kind,id,name,description,city,category,address,branches,phone,phones,photo,photos,business_hours,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages')
            .eq('status', 'published').order('name').order('id').range(from, from + 499).abortSignal(controller.signal).returns<ServiceListing[]>();
          if (error?.code === '42703') {
            ({ data, error } = await supabase.from('esx_service_listings').select('id,name,description,city,category,address,branches,phone,phones,photo,photos,business_hours,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages').eq('status', 'published').order('name').order('id').range(from, from + 499).abortSignal(controller.signal).returns<ServiceListing[]>());
          }
          if (error || !data) throw error ?? new Error('No listings returned');
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
  const categoryLabel = (category: string) => listings.map(s => s.category === category ? translatedCard(s)?.category : undefined).find(Boolean) ?? category;
  const categoryQuery = filters.category.trim().normalize('NFKC').toLocaleLowerCase();
  const visible = listings.filter(s => matchesService(s, { ...filters, category: '' }) && (!categoryQuery || [s.category, categoryLabel(s.category)].some(value => value.normalize('NFKC').toLocaleLowerCase().includes(categoryQuery))));
  const specialistIds = visible.filter(isPersonalListing).map(s => s.id).join(',');
  useEffect(() => {
    const track = specialistCarousel.current;
    const region = track?.closest('.services-listing-group');
    if (!track || !region) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pauseUntil = performance.now() + 3500;
    let touching = false;
    const pause = () => { pauseUntil = performance.now() + 5000; };
    const down = () => { touching = true; pause(); };
    const up = () => { touching = false; pause(); };
    const timer = window.setInterval(() => {
      if (document.hidden || touching || performance.now() < pauseUntil || region.querySelector(':focus-visible') || track.querySelector('[data-expanded="true"]')) return;
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 1) return;
      const card = track.querySelector<HTMLElement>('.services-card');
      const step = (card?.getBoundingClientRect().width ?? 320) + 22;
      track.scrollTo({ left: track.scrollLeft >= max - 2 ? 0 : Math.min(max, track.scrollLeft + step), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      pauseUntil = performance.now() + 3500;
    }, 500);
    region.addEventListener('pointerenter', pause);
    region.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    region.addEventListener('wheel', pause, { passive: true });
    region.addEventListener('keydown', pause);
    region.addEventListener('mouseleave', pause);
    region.addEventListener('focusout', pause);
    return () => {
      clearInterval(timer);
      region.removeEventListener('pointerenter', pause);
      region.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      region.removeEventListener('wheel', pause);
      region.removeEventListener('keydown', pause);
      region.removeEventListener('mouseleave', pause);
      region.removeEventListener('focusout', pause);
    };
  }, [specialistIds, status]);
  const cities = [...new Set(listings.flatMap(s => serviceCities(s)))].sort((a,b) => a.localeCompare(b, 'ru'));
  const categories = [...new Set(listings.map(s => s.category))].sort((a,b) => a.localeCompare(b, 'ru'));
  return <div className="services-page services-directory" lang={language}>
    <header className="services-top"><Link className="services-brand" href="/" aria-label={"ESX — " + t[2]}><Image src="/esx-wordmark-color.png" alt="ESX" width={140} height={48} unoptimized /><span> / {t[1]}</span></Link><nav aria-label={t[36]}><Link href="/">{t[2]}</Link><Link href="/chat">{t[3]} ↗</Link></nav><div className="services-interface-language"><span id="services-language-label">{t[0]}</span><details className="services-language-picker" onKeyDown={e => { if (e.key === 'Escape') { e.currentTarget.open = false; e.currentTarget.querySelector('summary')?.focus(); } }}><summary aria-labelledby="services-language-label services-language-value"><Image src={'/flags/' + flags[language] + '.svg'} alt="" width={24} height={16} unoptimized /><span id="services-language-value">{interfaceLanguages.find(l => l.code === language)?.name}</span><span aria-hidden="true">▾</span></summary><ul aria-labelledby="services-language-label">{interfaceLanguages.map(l => <li key={l.code}><button type="button" lang={l.code} aria-pressed={language === l.code} onClick={e => { chooseLanguage(l.code); const picker = e.currentTarget.closest('details'); if (picker) { picker.open = false; picker.querySelector('summary')?.focus(); } }}><Image src={'/flags/' + flags[l.code] + '.svg'} alt="" width={24} height={16} unoptimized /><span>{l.name}</span>{language === l.code && <span aria-hidden="true">✓</span>}</button></li>)}</ul></details></div></header>
    <main className="services-main"><section className="services-intro"><p className="services-eyebrow">ESX • {t[4]}</p><h1>{t[5]}</h1><p>{t[6]}</p></section>
    <AdminEntry language={language} />
    {categories.length > 0 && <section className="services-category-carousel" aria-label={t[10]}>
      <div className="services-category-heading"><h2>{t[10]}</h2><div className="services-category-arrows"><button type="button" aria-label={t[10] + ' ←'} onClick={() => categoryCarousel.current?.scrollBy({ left: -360, behavior: 'smooth' })}>←</button><button type="button" aria-label={t[10] + ' →'} onClick={() => categoryCarousel.current?.scrollBy({ left: 360, behavior: 'smooth' })}>→</button></div></div>
      <div className="services-category-track" ref={categoryCarousel}>
        {[0, 1, 2].map(copy => <div key={copy} className="services-category-group" aria-hidden={copy !== 1 ? true : undefined}>{[{ value: '', label: t[11], count: listings.length }, ...categories.map(category => ({ value: category, label: categoryLabel(category), count: listings.filter(s => s.category === category).length }))].map(category => <button type="button" key={category.value} tabIndex={copy === 1 ? 0 : -1} className="services-category-tile" aria-pressed={filters.category === category.value} onClick={() => update('category', category.value)}><span className="services-category-art" aria-hidden="true" style={{ backgroundPosition: `${(categoryArt(category.value) % 4) * 100 / 3}% ${Math.floor(categoryArt(category.value) / 4) * 100}%` }} /><span className="services-category-name">{category.label}</span><span className="services-category-count">{category.count}</span></button>)}</div>)}
      </div>
    </section>}
    <section className="services-filters" aria-label={t[7]}>
      <label className="services-company-search">{searchLabels[language]}<input type="search" value={filters.query ?? ''} onChange={e => update('query', e.target.value)} placeholder={searchLabels[language]} /></label>
      <ServiceFilterPicker label={t[8]} value={filters.city} onChange={value => update('city', value)} options={[{value: '', label: t[9]}, ...cities.map(city => ({value: city, label: city === 'Хвасонг, Паран' ? (language === 'ko' ? '화성, 발안' : city) : listings.map(s => s.city === city ? translatedCard(s)?.city : undefined).find(Boolean) ?? city}))]} />
      <ServiceFilterPicker label={t[10]} value={filters.category} onChange={value => update('category', value)} options={[{value: '', label: t[11]}, ...categories.map(category => ({value: category, label: categoryLabel(category)}))]} />
      <ServiceFilterPicker label={t[12]} value={filters.language} onChange={value => update('language', value)} options={[{value: '', label: t[13]}, ...languageOptions]} />
      <ServiceFilterPicker label={t[14]} value={filters.interpreterLanguage} onChange={value => update('interpreterLanguage', value)} options={[{value: '', label: t[13]}, ...languageOptions]} />
      <label className="services-check"><input type="checkbox" checked={filters.interpreter} onChange={e => update('interpreter', e.target.checked)} />{t[15]}</label>
      <button type="button" onClick={() => setFilters(empty)}>{t[16]}</button>
    </section>
    <p className="services-note">{t[17]}</p>{translationStatus && <p role="status">{translationLabels[language][translationStatus === 'error' ? 1 : 0]} {translationStatus === 'error' && <button type="button" onClick={() => setTranslationRetry(n=>n+1)}>{t[21]}</button>}</p>}
    <div aria-live="polite" role="status">{status === 'loading' ? <p>{t[18]}</p> : status === 'error' ? <div className="services-empty"><h2>{t[19]}</h2><p>{t[20]}</p><button onClick={() => { setStatus('loading'); setAttempt(a => a + 1); }}>{t[21]}</button></div> : <p>{t[22]} {visible.length}</p>}</div>
    {status === 'ready' && !visible.length && <div className="services-empty"><h2>{listings.length ? t[23] : t[24]}</h2><p>{listings.length ? t[25] : t[26]}</p></div>}
    {status === 'ready' && [true, false].map(personalGroup => {
      const group = visible.filter(listing => isPersonalListing(listing) === personalGroup);
      if (!group.length) return null;
      const title = directoryGroupLabels[language][personalGroup ? 0 : 1];
      const headingId = personalGroup ? 'specialists-heading' : 'companies-heading';
      return <section key={headingId} className="services-listing-group" aria-labelledby={headingId}>
        <div className="services-category-heading"><h2 id={headingId}>{title} <span className="services-group-count">{group.length}</span></h2>{personalGroup && group.length > 1 && <div className="services-category-arrows"><button type="button" aria-label={title + ' ←'} aria-controls="specialists-track" onClick={() => scrollSpecialists(-1)}>←</button><button type="button" aria-label={title + ' →'} aria-controls="specialists-track" onClick={() => scrollSpecialists(1)}>→</button></div>}</div>
        <div id={personalGroup ? 'specialists-track' : undefined} ref={personalGroup ? specialistCarousel : undefined} className={personalGroup ? 'services-specialist-track' : 'services-grid'} tabIndex={personalGroup ? 0 : undefined} role={personalGroup ? 'region' : undefined} aria-label={personalGroup ? title : undefined}>{group.map(s => { const website = safeServiceWebsite(s.website); const expanded = expandedCardId === s.id; const photos = companyPhotos(s); const translated = translatedCard(s); const content = cardContent(translated?.description ?? s.description); const items = serviceItems(content.services); const personal = isPersonalListing(s); const subtitle = [normalizeServiceCity(translated?.city ?? s.city), personal ? '' : translated?.category ?? s.category].filter(Boolean).join(' · '); return <article key={s.id} ref={expanded ? expandedCard : null} className="services-card" data-expanded={expanded}><div className="services-card-header"><div className="services-card-photo">{photos.length > 0 ? <Image className="company-photo" src={photos[0]} alt={s.name} width={800} height={600} unoptimized /> : <span className="services-card-initial" aria-hidden="true">{s.name.trim().slice(0, 1)}</span>}</div><div className="services-card-heading"><p className="services-eyebrow" title={subtitle}>{subtitle}</p><h2 title={s.name}>{s.name}</h2>{personal && <p className="services-person-role">{translated?.category?.trim() || s.category.trim() || personRoleLabels[language][s.listing_kind as 'manager' | 'interpreter']}</p>}</div></div>{(!personal || content.description.trim()) && <section className="services-card-section"><h3>{sectionLabels[language][0]}</h3><SmoothDescription text={content.description} expanded={expanded} />{!translated && <p role="status">{translationLabels[language][translationStatus === 'error' ? 1 : 0]}</p>}</section>}<div id={`service-details-${s.id}`} className="services-reveal" aria-hidden={!expanded} inert={!expanded}><div className="services-reveal-inner">{photos.length > 1 && <div className="services-photo-gallery">{photos.slice(1).map((photo, index) => <Image key={index} src={photo} alt={s.name + " — " + (index + 2)} width={800} height={600} unoptimized />)}</div>}{items.length > 0 && <section className="services-card-section"><h3>{sectionLabels[language][1]}</h3><ul className="services-item-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}{s.address.trim() && <section className="services-card-section"><h3>{sectionLabels[language][2]}</h3><MapAddress address={s.address} language={language} /></section>}{!!s.branches?.length && <section className="services-card-section"><h3>{branchLabels[language]}</h3>{s.branches.map(branch => <section key={branch.id} className="services-card-section"><h4>{branch.name}</h4><p>{normalizeServiceCity(branch.city)}</p><MapAddress address={branch.address} language={language} />{branch.phone && <a href={'tel:' + branch.phone.replace(/[^+0-9]/g, '')}>{phoneLabels[language].other}: {branch.phone}</a>}</section>)}</section>}{s.business_hours && validBusinessHours(s.business_hours) && <section className="services-card-section services-hours"><h3>{hoursLabels[language][0]}</h3><>{s.business_hours.alwaysOpen ? <p>{alwaysOpenLabels[language]}</p> : <><p>{s.business_hours.days.map(day=>weekdayName(day,language)).join(', ')}</p><p>{s.business_hours.opens} – {s.business_hours.closes}{s.business_hours.closes < s.business_hours.opens && ' ('+hoursLabels[language][4]+')'}</p><p>{s.business_hours.lunchStart ? hoursLabels[language][2]+': '+s.business_hours.lunchStart+' – '+s.business_hours.lunchEnd : hoursLabels[language][3]}</p></>}</></section>}<div className="services-card-section"><div className="services-tags">{s.service_languages.map(l => <span key={l}>{languageName(l)}</span>)}</div>{(!personal || s.interpreter_languages.length > 0) && <p className="services-interpreter">{s.has_interpreter ? t[28] + " " + s.interpreter_languages.map(l => languageName(l)).join(', ') : t[29]}</p>}{!personal && s.has_manager && <p className="services-interpreter"><span aria-hidden="true">✓ </span>{managerLabels[language]}</p>}</div><div className="services-contacts services-card-section">{companyPhones(s).map((phone,index) => <a key={index} href={'tel:' + phone.number.replace(/[^+0-9]/g, '')}>{phoneLabels[language][phone.type]}: {phone.number}</a>)}{website && <a href={website} target="_blank" rel="noopener noreferrer">{t[30]} ↗</a>}{validSocialLinks(s.social_links).map((link,index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">{link.network === "other" ? t[37] : socialNetworks[link.network]} ↗</a>)}</div></div></div><button type="button" className="services-details-toggle" aria-expanded={expanded} aria-controls={`service-details-${s.id}`} onClick={() => setExpandedCardId(current => current === s.id ? null : s.id)}>{detailLabels[language][expanded ? 1 : 0]} <span aria-hidden="true">{expanded ? '▴' : '▾'}</span></button></article>; })}</div></section>; })}
    <aside className="services-business"><h2>{t[31]}</h2><p>{t[32]}</p><Link href="/contact">{t[33]} ↗</Link></aside>
    </main><footer className="services-footer">ESX · {t[34]} · <Link href="/admin">{t[35]}</Link></footer></div>;
}