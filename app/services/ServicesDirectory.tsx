"use client";
import { useEffect, useRef, useState } from 'react';
import { preparedTranslations, translationKey, validTranslation } from '@/lib/service-translations';
import { categoryTranslation } from '@/lib/service-category-labels';
import Link from 'next/link';
import Image from 'next/image';
import { companyPhones, companyPhotos, phoneLabels } from '@/lib/service-media';
import { serviceItems, splitServiceDescription } from '@/lib/service-description';
import BusinessHoursDisplay from './BusinessHoursDisplay';
import AdminEntry from '@/app/admin/AdminEntry';
import { supabase } from '@/lib/supabase';
import { serviceCategory, isPersonalListing, normalizeServiceCity, serviceCities, matchesService, safeServiceWebsite, serviceLanguages, type ServiceListing, type ServiceFilters } from '@/lib/service-directory';
import './services.css';
import ServicesHeader from './ServicesHeader';
import RegistrationLink from './RegistrationLink';
import './services-light.css';
import './services-soft.css';
import ServiceFilterPicker from './ServiceFilterPicker';
import ServicesBackToTop from './ServicesBackToTop';
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
const openPageLabels: Record<InterfaceLanguage, string> = { ru: 'Открыть страницу', en: 'Open page', ko: '페이지 열기', uz: 'Sahifani ochish', zh: '打开页面', vi: 'Mở trang', tr: 'Sayfayı aç' };
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
const searchLabels: Record<InterfaceLanguage, string> = { ru: 'Поиск компании, услуги или специалиста', en: 'Search companies, services or specialists', ko: '업체, 서비스 또는 전문가 검색', uz: 'Kompaniya, xizmat yoki mutaxassisni qidirish', zh: '搜索公司、服务或专业人士', vi: 'Tìm công ty, dịch vụ hoặc chuyên gia', tr: 'Şirket, hizmet veya uzman ara' };
function isShoppingCategory(category: string): boolean {
  return /магазин|продукт|shop|grocer/i.test(category);
}
function categoryImage(category: string): string | null {
  if (/автосервис|ремонт авто|ремонт машин|car repair|auto repair|mechanic/i.test(category)) return '/services/category-auto-repair.webp';
  if (/юридич|юрист|адвокат|нотари|legal|lawyer|attorney|notary/i.test(category)) return '/services/category-legal.webp';
  // Specific services must win over broad words such as school or shop.
  if (/автошкол|обучение вождению|driving school|driving lesson/i.test(category)) return '/services/category-driving.webp';
  if (/ювелир|jewel/i.test(category)) return '/services/category-jewelry.webp';
  if (/стомат|dent|медицин|клиник|medic|clinic|связ|интернет|internet|communicat|красот|уход|космет|beauty|cosmetic|salon|массаж|спа|massage|\bspa\b/i.test(category)) return null;
  if (/образован|обучен|education|school/i.test(category)) return '/services/category-education.webp';
  if (/автодилер|автомобил|автосервис|car rental|car dealer|auto repair/i.test(category)) return '/services/category-cars.webp';
  if (/недвижим|риелтор|риэлтор|real estate|realtor/i.test(category)) return '/services/category-homes.webp';
  if (/спорт|фитнес|\bsports?\b|fitness/i.test(category)) return '/services/category-fitness.webp';
  if (/переводчик|устный перевод|письменный перевод|translator|interpreter|translation/i.test(category)) return '/services/category-interpreters.webp';
  if (/страхов|insurance/i.test(category)) return '/services/category-insurance.webp';
  if (/ресторан|кафе|кофейн|restaurant|cafe|café|coffee/i.test(category)) return '/services/category-restaurants.webp';
  if (/продукт|grocer|food store|supermarket/i.test(category)) return '/services/category-groceries.webp';
  return null;
}
function categoryArt(category: string): number {
  if (!category) return 0;
  const value = category.toLocaleLowerCase();
  if (/виз|иммигра|visa|immig/.test(value)) return 1;
  if (/достав|груз|логист|переезд|deliver|logist|\bmoving\b/.test(value)) return 2;
  if (/массаж|спа|massage|\bspa\b/.test(value)) return 3;
  if (/стомат|dent/.test(value)) return 6;
  if (/медицин|клиник|medic|clinic/.test(value)) return 4;
  if (/связ|интернет|internet|communicat/.test(value)) return 5;
  if (/красот|уход|космет|beauty|cosmetic|salon/.test(value)) return 7;
  return 0;
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
  const languageOptions = Object.keys(serviceLanguages).map(code => ({value: code, label: languageName(code), flag: '/flags/' + flags[code as keyof typeof flags] + '.svg'}));

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
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('esx-service-translations-v1') || '{}');
      if (stored && typeof stored === 'object') setTranslations(Object.fromEntries(Object.entries(stored).filter(([, value]) => validTranslation(value))) as Record<string, CardTranslation>);
    } catch { /* Storage is optional. */ }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const pending = listings.filter(listing => {
      const key = translationKey(language, listing);
      return !preparedTranslations[key] && !translations[key];
    });
    setTranslationStatus(pending.length ? 'loading' : '');
    let failed = false;
    const completed: Record<string, CardTranslation> = {};
    async function worker() {
      while (pending.length && !controller.signal.aborted) {
        const listing = pending.shift()!;
        try {
          const response = await fetch('/api/services/translate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: listing.id, target: language }), signal: controller.signal,
          });
          if (!response.ok) throw Error('translation');
          const value: unknown = await response.json();
          if (!validTranslation(value)) throw Error('format');
          if (controller.signal.aborted) return;
          const key = translationKey(language, listing);
          completed[key] = value;
          setTranslations(current => ({ ...current, [key]: value }));
        } catch { if (controller.signal.aborted) return; failed = true; }
      }
    }
    void Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker)).then(() => {
      if (controller.signal.aborted) return;
      setTranslationStatus(failed ? 'error' : '');
      try {
        const stored = JSON.parse(localStorage.getItem('esx-service-translations-v1') || '{}');
        localStorage.setItem('esx-service-translations-v1', JSON.stringify(Object.fromEntries(Object.entries({ ...stored, ...completed }).slice(-500))));
      } catch { /* Full or disabled storage must not block language switching. */ }
    });
    return () => controller.abort();
    // Only restart for a language/source change or explicit retry, not each result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, listings, translationRetry]);
  const translatedCard = (s: ServiceListing) => preparedTranslations[translationKey(language, s)] ?? translations[translationKey(language, s)];
  const [filters, setFilters] = useState(empty);
  const specialistCarousel = useRef<HTMLDivElement>(null);
  const [specialistCopies, setSpecialistCopies] = useState(3);
  function scrollSpecialists(direction: number) {
    const track = specialistCarousel.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.services-card');
    track.scrollBy({ left: direction * ((card?.getBoundingClientRect().width ?? 320) + 22), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  const categoryCarousel = useRef<HTMLDivElement>(null);
  const [categoryCopies, setCategoryCopies] = useState(3);
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
    const wrapPosition = (value: number) => cycleWidth > 0
      ? cycleWidth + ((value - cycleWidth) % cycleWidth + cycleWidth) % cycleWidth
      : value;
    const normalizeScroll = () => {
      if (cycleWidth <= 0) return;
      const offset = wrapPosition(track.scrollLeft) - track.scrollLeft;
      if (Math.abs(offset) < 0.5) return;
      track.scrollLeft += offset;
      startScroll += offset;
      if (autoPosition !== null) autoPosition += offset;
    };
    const measure = () => {
      const groups = track.querySelectorAll<HTMLElement>('.services-category-group');
      const measured = groups.length > 1 ? groups[1].offsetLeft - groups[0].offsetLeft : 0;
      if (measured <= 0) return;
      // Keep a full viewport of repeated tiles beyond either wrap boundary.
      setCategoryCopies(Math.max(3, Math.ceil(track.clientWidth / measured) + 2));
      if (measured !== cycleWidth) {
        const relative = cycleWidth ? track.scrollLeft % cycleWidth : 0;
        cycleWidth = measured;
        track.scrollLeft = cycleWidth + relative;
        autoPosition = null;
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    const firstGroup = track.querySelector('.services-category-group');
    if (firstGroup) observer.observe(firstGroup);
    measure();
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
      const desired = startScroll - distance;
      const wrapped = wrapPosition(desired);
      startScroll += wrapped - desired;
      track.scrollLeft = wrapped;
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
      normalizeScroll();
      if (!document.hidden && !region.matches(':hover') && !region.querySelector(':focus-visible') && pointer === null && now > resumeAt && cycleWidth > 0) {


        autoPosition = wrapPosition((autoPosition ?? track.scrollLeft) + elapsed * 0.035);
        track.scrollLeft = autoPosition;
      }
      else { autoPosition = null; }
      frame = requestAnimationFrame(animate);
    };

    region.addEventListener('mouseleave', leave);

    region.addEventListener('focusout', blur);
    region.addEventListener('pointerdown', pause);
    track.addEventListener('scroll', normalizeScroll, { passive: true });
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
      observer.disconnect();
      track.removeEventListener('scroll', normalizeScroll);

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
  }, [listings.length, categoryCopies]);
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
            .select('listing_kind,id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages')
            .eq('status', 'published').order('name').order('id').range(from, from + 499).abortSignal(controller.signal).returns<ServiceListing[]>();
          if (error?.code === '42703') {
            ({ data, error } = await supabase.from('esx_service_listings').select('id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages').eq('status', 'published').order('name').order('id').range(from, from + 499).abortSignal(controller.signal).returns<ServiceListing[]>());
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
  const categoryLabel = (category: string) => categoryTranslation(category, language) ?? listings.map(s => s.category === category ? translatedCard(s)?.category : undefined).find(Boolean) ?? category;
  const categoryQuery = filters.category.trim().normalize('NFKC').toLocaleLowerCase();
  const visible = listings.filter(s => matchesService(s, { ...filters, category: '' }, translatedCard(s)) && (!categoryQuery || [serviceCategory(s), categoryLabel(serviceCategory(s))].some(value => value.normalize('NFKC').toLocaleLowerCase().includes(categoryQuery))));
  const specialistIds = visible.filter(isPersonalListing).map(s => s.id).join(',');
  useEffect(() => {
    const track = specialistCarousel.current;
    const region = track?.closest('.services-listing-group');
    if (!track || !region) return;
    let pauseUntil = 0;
    let touching = false;
    let pointer: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;
    let previous = 0;
    let position: number | null = null;
    const count = specialistIds ? specialistIds.split(',').length : 0;
    let cycle = 0;
    const measure = () => {
      const cards = track.querySelectorAll<HTMLElement>(':scope > .services-card');
      const measured = count > 1 && cards[count] ? cards[count].offsetLeft - cards[0].offsetLeft : 0;
      if (measured > 0) {
        setSpecialistCopies(Math.max(3, Math.ceil(track.clientWidth / measured) + 2));
        if (measured !== cycle) {
          const relative = cycle ? track.scrollLeft % cycle : 0;
          track.scrollLeft = measured + relative;
          position = null;
        }
      }
      cycle = measured;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    measure();
    let frame = 0;
    const pause = () => { pauseUntil = performance.now() + 2000; position = null; };
    const down = (event: PointerEvent) => {
      touching = true;
      pause();
      dragged = false;
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      if ((event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')) return;
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
    const up = (event: PointerEvent) => {
      if (pointer !== null && pointer !== event.pointerId) return;
      touching = false;
      pointer = null;
      delete track.dataset.dragging;
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      pause();
    };
    const click = (event: MouseEvent) => {
      if (dragged && event.detail !== 0) {
        event.preventDefault();
        event.stopPropagation();
        dragged = false;
      }
    };
    const preventNativeDrag = (event: DragEvent) => event.preventDefault();
    const animate = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      if (!previous) pauseUntil = now + 1000;
      previous = now;
      if (cycle > 0 && !track.querySelector('[data-expanded="true"]') && !region.querySelector(':focus-visible')) {
        const offset = track.scrollLeft < cycle ? cycle : track.scrollLeft >= cycle * 2 ? -cycle : 0;
        if (offset) {
          track.scrollLeft += offset;
          startScroll += offset;
          if (position !== null) position += offset;
        }
      }
      if (!document.hidden && !touching && !region.matches(':hover') && now >= pauseUntil && !region.querySelector(':focus-visible') && !track.querySelector('[data-expanded="true"]') && cycle > 0) {
        position = (position ?? track.scrollLeft) + elapsed * 0.035;
        track.scrollLeft = position;
      } else { position = null; }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    track.addEventListener('pointerdown', down);
    track.addEventListener('pointermove', move);
    track.addEventListener('lostpointercapture', up);
    track.addEventListener('click', click, true);
    track.addEventListener('dragstart', preventNativeDrag);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    region.addEventListener('pointerenter', pause);
    region.addEventListener('wheel', pause, { passive: true });
    region.addEventListener('keydown', pause);
    region.addEventListener('mouseleave', pause);
    region.addEventListener('focusout', pause);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener('pointerdown', down);
      track.removeEventListener('pointermove', move);
      track.removeEventListener('lostpointercapture', up);
      track.removeEventListener('click', click, true);
      track.removeEventListener('dragstart', preventNativeDrag);
      delete track.dataset.dragging;
      if (pointer !== null && track.hasPointerCapture(pointer)) track.releasePointerCapture(pointer);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      region.removeEventListener('pointerenter', pause);
      region.removeEventListener('wheel', pause);
      region.removeEventListener('keydown', pause);
      region.removeEventListener('mouseleave', pause);
      region.removeEventListener('focusout', pause);
    };
  }, [specialistIds, status, specialistCopies]);
  const cities = [...new Set(listings.flatMap(s => serviceCities(s)))].sort((a,b) => a.localeCompare(b, 'ru'));
  const categories = [...new Set(listings.map(s => serviceCategory(s)))].sort((a,b) => a.localeCompare(b, 'ru'));
  return <div className="services-page services-directory" lang={language}>
    <ServicesHeader language={language} chooseLanguage={chooseLanguage} />
    <main className="services-main"><section className="services-intro"><p className="services-eyebrow">ESX • {t[4]}</p><h1>{t[5]}</h1><p>{t[6]}</p></section>
    <AdminEntry language={language} />
    {categories.length > 0 && <section className="services-category-carousel" aria-label={t[10]}>
      <div className="services-category-heading"><h2>{t[10]}</h2><div className="services-category-arrows"><button type="button" aria-label={t[10] + ' ←'} onClick={() => categoryCarousel.current?.scrollBy({ left: -360, behavior: 'smooth' })}>←</button><button type="button" aria-label={t[10] + ' →'} onClick={() => categoryCarousel.current?.scrollBy({ left: 360, behavior: 'smooth' })}>→</button></div></div>
      <div className="services-category-track" ref={categoryCarousel}>
        {Array.from({ length: categoryCopies }, (_, copy) => <div key={copy} className="services-category-group" aria-hidden={copy !== 1 ? true : undefined}>{[{ value: '', label: t[11], count: listings.length }, ...categories.map(category => ({ value: category, label: categoryLabel(category), count: listings.filter(s => serviceCategory(s) === category).length }))].map(category => <button type="button" key={category.value} tabIndex={copy === 1 ? 0 : -1} className="services-category-tile" aria-pressed={filters.category === category.value} onClick={() => update('category', category.value)}><span className="services-category-art" aria-hidden="true" style={categoryImage(category.value) ? { backgroundImage: `url(${categoryImage(category.value)})`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundPosition: `${(categoryArt(category.value) % 4) * 100 / 3}% ${Math.floor(categoryArt(category.value) / 4) * 100}%` }} /><span className="services-category-name">{category.label}</span><span className="services-category-count">{category.count}</span></button>)}</div>)}
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
        <div id={personalGroup ? 'specialists-track' : undefined} ref={personalGroup ? specialistCarousel : undefined} className={personalGroup ? 'services-specialist-track' : 'services-grid'} tabIndex={personalGroup ? 0 : undefined} role={personalGroup ? 'region' : undefined} aria-label={personalGroup ? title : undefined}>{(personalGroup && group.length > 1 ? Array.from({ length: specialistCopies }, () => group).flat() : group).map((s, cardIndex) => { const cardId = personalGroup ? `${s.id}-copy-${Math.floor(cardIndex / group.length)}` : s.id; const website = safeServiceWebsite(s.website); const expanded = expandedCardId === cardId; const photos = companyPhotos(s); const translated = translatedCard(s); const content = cardContent(translated?.description ?? s.description); const items = serviceItems(content.services); const personal = isPersonalListing(s); const subtitle = [normalizeServiceCity(translated?.city ?? s.city), personal ? '' : translated?.category ?? s.category].filter(Boolean).join(' · '); return <article key={cardId} ref={expanded ? expandedCard : null} className="services-card" data-expanded={expanded}>{personal && <div className="services-card-language-flags">{[...new Set(s.service_languages ?? [])].filter(code => Object.hasOwn(serviceLanguages, code)).map(code => <Image key={code} src={"/flags/" + flags[code] + ".svg"} alt={languageName(code)} title={languageName(code)} width={18} height={12} unoptimized />)}</div>}<div className="services-card-header"><div className="services-card-photo">{photos.length > 0 ? <Image className="company-photo" src={photos[0]} alt={s.name} width={800} height={600} unoptimized /> : <span className="services-card-initial" aria-hidden="true">{s.name.trim().slice(0, 1)}</span>}</div><div className="services-card-heading"><p className="services-eyebrow" title={subtitle}>{subtitle}</p><h2 title={s.name}>{s.name}</h2>{personal && <p className="services-person-role">{translated?.category?.trim() || s.category.trim() || personRoleLabels[language][s.listing_kind as 'manager' | 'interpreter']}</p>}{personal && s.represented_company && <p className="services-person-company">{s.represented_company}</p>}</div></div>{s.id === '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf' && <Link className="services-profile-link" href="/services/tkhay-alina" target="_blank" rel="noopener noreferrer">{openPageLabels[language]} <span aria-hidden="true">→</span></Link>}{(!personal || content.description.trim()) && <section className="services-card-section"><h3>{sectionLabels[language][0]}</h3><SmoothDescription text={content.description} expanded={expanded} />{!translated && translationStatus && <p role="status">{translationLabels[language][translationStatus === 'error' ? 1 : 0]}</p>}</section>}<div id={`service-details-${cardId}`} className="services-reveal" aria-hidden={!expanded} inert={!expanded}><div className="services-reveal-inner">{photos.length > 1 && <div className="services-photo-gallery">{photos.slice(1).map((photo, index) => <Image key={index} src={photo} alt={s.name + " — " + (index + 2)} width={800} height={600} unoptimized />)}</div>}{items.length > 0 && <section className="services-card-section"><h3>{sectionLabels[language][1]}</h3><ul className="services-item-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}{s.address.trim() && <section className="services-card-section"><h3>{sectionLabels[language][2]}</h3><MapAddress address={s.address} language={language} /></section>}{!!s.branches?.length && <section className="services-card-section"><h3>{branchLabels[language]}</h3>{s.branches.map(branch => <section key={branch.id} className="services-card-section"><h4>{branch.name}</h4><p>{normalizeServiceCity(branch.city)}</p><MapAddress address={branch.address} language={language} />{branch.phone && <a href={'tel:' + branch.phone.replace(/[^+0-9]/g, '')}>{phoneLabels[language].other}: {branch.phone}</a>}</section>)}</section>}{s.business_hours && <BusinessHoursDisplay hours={s.business_hours} language={language} />}<div className="services-card-section"><div className="services-tags">{s.service_languages.map(l => <span key={l}>{languageName(l)}</span>)}</div>{(!personal || s.interpreter_languages.length > 0) && <p className="services-interpreter">{s.has_interpreter ? t[28] + " " + s.interpreter_languages.map(l => languageName(l)).join(', ') : t[29]}</p>}{!personal && s.has_manager && <p className="services-interpreter"><span aria-hidden="true">✓ </span>{managerLabels[language]}</p>}</div><div className="services-contacts services-card-section">{companyPhones(s).map((phone,index) => <a key={index} href={'tel:' + phone.number.replace(/[^+0-9]/g, '')}>{phoneLabels[language][phone.type]}: {phone.number}</a>)}{website && <a href={website} target="_blank" rel="noopener noreferrer">{t[30]} ↗</a>}{validSocialLinks(s.social_links).map((link,index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">{link.network === "other" ? t[37] : socialNetworks[link.network]} ↗</a>)}</div></div></div><button type="button" className="services-details-toggle" aria-expanded={expanded} aria-controls={`service-details-${s.id}`} onClick={() => setExpandedCardId(current => current === cardId ? null : cardId)}>{detailLabels[language][expanded ? 1 : 0]} <span aria-hidden="true">{expanded ? '▴' : '▾'}</span></button></article>; })}</div></section>; })}
    <aside className="services-business"><h2>{t[31]}</h2><p>{t[32]}</p><RegistrationLink language={language} /></aside>
    </main><footer className="services-footer">ESX · {t[34]} · <button type="button" className="services-admin-entry" onClick={() => window.location.assign("/admin")}>{t[35]}</button></footer><ServicesBackToTop language={language} /></div>;
}
