"use client";
import { serviceProfilePath } from '@/lib/service-profile-path';
import SocialIcon from './tkhay-alina/SocialIcon';
import ContactIcon from './ContactIcon';
import CarouselArrow from './CarouselArrow';
import LegalLinks from '@/app/LegalLinks';
import { trademarkNotice } from '@/lib/trademark-notice';
import { useEffect, useRef, useState } from 'react';
import { preparedTranslations, translationKey, validTranslation, displayTranslation } from '@/lib/service-translations';
import { specialistDisplayRole } from '@/lib/specialist-role';
import { categoryTranslation, displayServiceCategory } from '@/lib/service-category-labels';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { companyPhones, companyPhotos, phoneLabels } from '@/lib/service-media';
import { serviceItems, splitServiceDescription, specialistRole, cardContent } from '@/lib/service-description';
import BusinessHoursDisplay from './BusinessHoursDisplay';
import { listingCategories, serviceCategory, isPersonalListing, normalizeServiceCity, serviceCities, matchesService, safeServiceWebsite, serviceLanguages, interpreterLanguageOptions, type ServiceListing, type ServiceFilters } from '@/lib/service-directory';
import './services.css';
import ServicesHeader from './ServicesHeader';
import DirectoryLoadingProgress from './DirectoryLoadingProgress';
import RegistrationLink from './RegistrationLink';
import './services-light.css';
import './services-soft.css';
import './services-filters.css';
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
  return <><address><a className="services-map-address" href={'https://map.kakao.com/link/search/' + query} target="_blank" rel="noopener noreferrer" onClick={() => { void copyAddress(); }}><ContactIcon kind="address" />{address} ↗</a></address><div className="services-map-links"><a href={'https://map.kakao.com/link/search/' + query} target="_blank" rel="noopener noreferrer" onClick={() => { void copyAddress(); }}>Kakao Map ↗</a><a href={'https://map.naver.com/p/search/' + query} target="_blank" rel="noopener noreferrer" onClick={() => { void copyAddress(); }}>Naver Map ↗</a></div><p className="services-copy-status" role="status">{status && copyLabels[language][status === 'copied' ? 0 : 1]}</p></>;
}
const sectionLabels: Record<InterfaceLanguage, [string, string, string]> = {
  ru: ['Описание', 'Услуги', 'Наш адрес:'], en: ['Description', 'Services', 'Our address:'],
  ko: ['소개', '서비스', '주소:'], uz: ['Tavsif', 'Xizmatlar', 'Bizning manzil:'],
  zh: ['介绍', '服务', '我们的地址：'], vi: ['Mô tả', 'Dịch vụ', 'Địa chỉ:'],
  tr: ['Açıklama', 'Hizmetler', 'Adresimiz:'],
};
const openPageLabels: Record<InterfaceLanguage, string> = { ru: 'Открыть страницу', en: 'Open page', ko: '페이지 열기', uz: 'Sahifani ochish', zh: '打开页面', vi: 'Mở trang', tr: 'Sayfayı aç' };
const branchLabels: Record<InterfaceLanguage, string> = { ru: 'Филиалы', en: 'Branches', ko: '지점', uz: 'Filiallar', zh: '分店', vi: 'Chi nhánh', tr: 'Şubeler' };
const detailLabels: Record<InterfaceLanguage, [string, string]> = {
  ru: ['Подробнее', 'Свернуть'], en: ['More details', 'Show less'],
  ko: ['자세히 보기', '접기'], uz: ['Batafsil', 'Yig‘ish'],
  zh: ['查看详情', '收起'], vi: ['Xem thêm', 'Thu gọn'], tr: ['Daha fazla', 'Daralt'],
};
const translationLabels: Record<InterfaceLanguage,[string,string]> = {ru:['Переводим карточки…','Перевод недоступен. Показан оригинал.'],en:['Translating listings…','Translation unavailable. Showing original.'],ko:['업체 정보 번역 중…','번역할 수 없어 원문을 표시합니다.'],uz:['Tarjima qilinmoqda…','Tarjima mavjud emas. Asl matn ko‘rsatilmoqda.'],zh:['正在翻译…','翻译不可用，显示原文。'],vi:['Đang dịch…','Không thể dịch. Hiển thị bản gốc.'],tr:['Çevriliyor…','Çeviri kullanılamıyor. Orijinal gösteriliyor.']};
type CardTranslation = {description:string;city:string;category:string};
const managerLabels: Record<InterfaceLanguage,string> = {ru:"Есть менеджер",en:"Manager available",ko:"매니저 있음",uz:"Menejer bor",zh:"有经理",vi:"Có quản lý",tr:"Yönetici mevcut"};
const directoryGroupLabels: Record<InterfaceLanguage, [string, string]> = { ru: ['Специалисты', 'Компании'], en: ['Specialists', 'Companies'], ko: ['전문가', '업체'], uz: ['Mutaxassislar', 'Kompaniyalar'], zh: ['专业人士', '公司'], vi: ['Chuyên gia', 'Công ty'], tr: ['Uzmanlar', 'Şirketler'] };
const flags = { ru: 'ru', uz: 'uz', zh: 'cn', vi: 'vn', en: 'gb', ko: 'kr', tr: 'tr', th: 'th', mn: 'mn', kk: 'kz' } as const;
const searchLabels: Record<InterfaceLanguage, string> = { ru: 'Что вам найти?', en: 'Search', ko: '검색', uz: 'Qidirish', zh: '搜索', vi: 'Tìm kiếm', tr: 'Ara' };
function isShoppingCategory(category: string): boolean {
  return /магазин|продукт|shop|grocer/i.test(category);
}
function categoryImage(category: string): string | null {
  if (/фото|видео|photo|video/i.test(category)) return '/services/category-photo-video.png';
  if (/цветоч|цветы|флорист|flower|florist/i.test(category)) return '/services/category-flowers.png';
  if (/банки|банков|денежн.*перевод|bank|money transfer|remittance/i.test(category)) return '/services/category-banking.png';
  if (/полиграф|реклам|графическ.*дизайн|printing|advertising|graphic design/i.test(category)) return '/services/category-print-design.png';
  if (/ведущ.*мероприят|тамада|event host|master of ceremonies|emcee/i.test(category)) return '/services/category-event-host.png';
  if (/банкет|banquet|wedding hall|event hall/i.test(category)) return '/services/category-banquet.png';
  if (/бильярд|billiard|snooker|pool hall/i.test(category)) return '/services/category-billiards.png';
  if (/автосервис|ремонт авто|ремонт машин|car repair|auto repair|mechanic/i.test(category)) return '/services/category-auto-repair.webp';
  if (/юридич|юрист|адвокат|нотари|legal|lawyer|attorney|notary/i.test(category)) return '/services/category-legal.webp';
  // Specific services must win over broad words such as school or shop.
  if (/автошкол|обучение вождению|driving school|driving lesson/i.test(category)) return '/services/category-driving.webp';
  if (/ювелир|jewel/i.test(category)) return '/services/category-jewelry.webp';
  if (/стомат|dent|медицин|клиник|medic|clinic|связ|интернет|internet|communicat|красот|уход|космет|beauty|cosmetic|salon|массаж|спа|massage|\bspa\b/i.test(category)) return null;
  if (/образован|обучен|education|school/i.test(category)) return '/services/category-education.webp';
  if (/мототехник|мотодилер|автодилер|автомобил|автосервис|car rental|car dealer|auto repair/i.test(category)) return '/services/category-auto-moto.png';
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
export default function ServicesDirectory({ routeLanguage }: { routeLanguage?: 'ru' | 'ko' | 'en' }) {
  const router = useRouter();
  const [preferredLanguage, setLanguage] = useState<InterfaceLanguage>('ru');
  const language = routeLanguage ?? preferredLanguage;
  const t = serviceLabels[language];
  useEffect(() => {
    if (routeLanguage) {
      try { localStorage.setItem('esx-services-language', routeLanguage); } catch {}
      return;
    }
    try { const saved = localStorage.getItem('esx-services-language'); if (interfaceLanguages.some(l => l.code === saved)) {
      // Restore this page's saved preference after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(saved as InterfaceLanguage);
    } } catch {}
  }, [routeLanguage]);
  function chooseLanguage(value: InterfaceLanguage) {
    setLanguage(value);
    try { localStorage.setItem('esx-services-language', value); } catch {}
    if (value === 'ru' || value === 'ko' || value === 'en') router.push(`/${value}/services`, { scroll: false });
    else if (routeLanguage) router.push('/services', { scroll: false });
  }
  const languageName = (code: string) => new Intl.DisplayNames([language], { type: 'language' }).of(code) ?? code;
  const languageOptions = Object.keys(serviceLanguages).map(code => ({value: code, label: languageName(code), flag: '/flags/' + flags[code as keyof typeof flags] + '.svg'}));
  const interpreterOptions = Object.keys(interpreterLanguageOptions).map(code => ({value: code, label: languageName(code), flag: '/flags/' + flags[code as keyof typeof flags] + '.svg'}));

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
  const translatedCard = (s: ServiceListing) => displayTranslation(language, preparedTranslations[translationKey(language, s)] ?? translations[translationKey(language, s)]);
  const [filters, setFilters] = useState(empty);
  const resetButtonLabels: Record<InterfaceLanguage,string> = {ru:'Сброс',en:'Reset',ko:'초기화',uz:'Tozalash',zh:'重置',vi:'Đặt lại',tr:'Sıfırla'};
  const filterButtonLabels: Record<InterfaceLanguage,string> = {ru:'Фильтр',en:'Filter',ko:'필터',uz:'Filtr',zh:'筛选',vi:'Bộ lọc',tr:'Filtre'};
  const activeFilterCount = [filters.city,filters.category,filters.language,filters.interpreterLanguage,filters.interpreter].filter(Boolean).length;
  const [companiesOpen, setCompaniesOpen] = useState(false);
  const [companyCategories, setCompanyCategories] = useState<string[]>([]);
  const [specialistCategories, setSpecialistCategories] = useState<string[]>([]);
  const specialistCategoryCarousel = useRef<HTMLDivElement>(null);
  const specialistCarousel = useRef<HTMLDivElement>(null);
  const [specialistCopies, setSpecialistCopies] = useState(3);
  const [specialistView, setSpecialistView] = useState<'carousel' | 'grid'>('carousel');
  const specialistViewLabels: Record<InterfaceLanguage, [string, string, string]> = {
    ru: ['Вид', 'Сетка', 'Карусель'], en: ['View', 'Grid', 'Carousel'], ko: ['보기', '그리드', '캐러셀'],
    uz: ['Ko‘rinish', 'Kataklar', 'Karusel'], zh: ['视图', '网格', '轮播'],
    vi: ['Hiển thị', 'Lưới', 'Băng chuyền'], tr: ['Görünüm', 'Izgara', 'Karusel'],
  };
  function scrollSpecialists(direction: number) {
    const track = specialistCarousel.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.services-card');
    track.scrollBy({ left: -direction * ((card?.getBoundingClientRect().width ?? 320) + 22), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  const categoryCarousel = useRef<HTMLDivElement>(null);
  const companyCategoryCarousel = useRef<HTMLDivElement>(null);
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
      if (!track.dataset.arrowHeld && !document.hidden && !region.matches(':hover') && !region.querySelector(':focus-visible') && pointer === null && now > resumeAt && cycleWidth > 0) {


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
  const [loadProgress, setLoadProgress] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      for (let retry = 0; retry < 2 && active; retry++) {
      try {
        const rows: ServiceListing[] = [];
        let total: number | null = null;
        if (active) setLoadProgress(0);
        let cursor = '';
        for (;;) {
          const response = await fetch('/api/services/directory' + (cursor ? '?after=' + cursor : ''), {
            signal: AbortSignal.any([controller.signal, AbortSignal.timeout(22000)]),
          });
          if (!response.ok) throw new Error('Directory request failed');
          const count = response.headers.get('X-Total-Count');
          if (count !== null && /^\d+$/.test(count)) total = Number(count);
          const page: ServiceListing[] = await response.json();
          if (!Array.isArray(page)) throw new Error('Invalid directory response');
          rows.push(...page);
          if (active) {
            setListings([...rows].sort((a,b) => a.name.localeCompare(b.name, 'ru') || a.id.localeCompare(b.id)));
            setLoadProgress(total && total > 0 ? Math.min(99, Math.floor(rows.length / total * 100)) : 0);
          }
          if (page.length < 25) break;
          cursor = page[page.length - 1].id;
        }
        if (active) { setLoadProgress(100); setStatus('ready'); }
        return;
      } catch (error) {
        if (!active) return;
        console.warn('Directory loading attempt failed', error);
        if (retry === 1) { setStatus('error'); return; }
        await new Promise<void>(resolve => {
          const finish = () => { window.clearTimeout(timer); controller.signal.removeEventListener('abort', finish); resolve(); };
          const timer = window.setTimeout(finish, 1000 * (retry + 1));
          controller.signal.addEventListener('abort', finish, { once: true });
        });
      }
      }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [attempt]);
  function update<K extends keyof ServiceFilters>(key: K, value: ServiceFilters[K]) { if (key === 'category') { setCompanyCategories([]); setSpecialistCategories([]); } setFilters(current => ({ ...current, [key]: value })); }
  const categoryLabel = (category: string) => categoryTranslation(category, language) ?? listings.map(s => s.category === category ? translatedCard(s)?.category : undefined).find(Boolean) ?? category;
  const categoryQuery = filters.category.trim().normalize('NFKC').toLocaleLowerCase();
  const showFilteredCompanies = Boolean(filters.query?.trim() || categoryQuery);
  const matchingListings = listings.filter(s => matchesService(s, { ...filters, category: '' }, translatedCard(s)) && (!categoryQuery || listingCategories(s).flatMap(category=>[category,categoryLabel(category)]).some(value => value.normalize('NFKC').toLocaleLowerCase().includes(categoryQuery))));
  const companyCategoryOptions = [...new Set(listings.filter(s => !isPersonalListing(s)).flatMap(listingCategories))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ru'));
  const specialistCategoryOptions = [...new Set(listings.filter(isPersonalListing).flatMap(listingCategories))].filter(Boolean).sort((a,b) => a.localeCompare(b, 'ru'));
  const visible = matchingListings.filter(s => isPersonalListing(s) ? !specialistCategories.length || listingCategories(s).some(category=>specialistCategories.includes(category)) : !companyCategories.length || listingCategories(s).some(category=>companyCategories.includes(category)));
  const specialistIds = visible.filter(isPersonalListing).map(s => s.id).join(',');
  useEffect(() => {
    const track = specialistCarousel.current;
    const region = track?.closest('.services-listing-group');
    if (specialistView !== 'carousel' || !track || !region) return;
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
      if (!track.dataset.arrowHeld && !document.hidden && !touching && !region.matches(':hover') && now >= pauseUntil && !region.querySelector(':focus-visible') && !track.querySelector('[data-expanded="true"]') && cycle > 0) {
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
  }, [specialistIds, status, specialistCopies, specialistView]);
  const cities = [...new Set(listings.flatMap(s => serviceCities(s)))].sort((a,b) => a.localeCompare(b, 'ru'));
  const categories = [...new Set(listings.flatMap(listingCategories))].sort((a,b) => a.localeCompare(b, 'ru'));
  const renderFilterFields = (close: () => void) => <>
      <ServiceFilterPicker label={t[8]} value={filters.city} onChange={value => update('city', value)} options={[{value: '', label: t[9]}, ...cities.map(city => ({value: city, label: city === 'Хвасонг, Паран' ? (language === 'ko' ? '화성, 발안' : city) : listings.map(s => s.city === city ? translatedCard(s)?.city : undefined).find(Boolean) ?? city}))]} />
      <ServiceFilterPicker label={t[10]} value={filters.category} onChange={value => update('category', value)} options={[{value: '', label: t[11]}, ...categories.map(category => ({value: category, label: categoryLabel(category)}))]} />
      <ServiceFilterPicker label={t[12]} value={filters.language} onChange={value => update('language', value)} options={[{value: '', label: t[13]}, ...languageOptions]} />
      <ServiceFilterPicker label={t[14]} value={filters.interpreterLanguage} onChange={value => update('interpreterLanguage', value)} options={[{value: '', label: t[13]}, ...interpreterOptions]} />
      <div className="services-filter-footer">
      <div className="services-filter-help">
      <label className="services-check"><input type="checkbox" checked={filters.interpreter} onChange={e => update('interpreter', e.target.checked)} /><span>{t[15]}</span></label>
      <p className="services-note">{t[17]}</p>
      </div>
      <div className="services-filter-actions">
      <button type="button" className="services-filter-reset" aria-label={t[16]} onClick={() => { setFilters(empty); setCompanyCategories([]); setSpecialistCategories([]); }}>{resetButtonLabels[language]}</button>
      <button type="button" className="services-filter-collapse" aria-expanded={true} onClick={close}>{detailLabels[language][1]} <span aria-hidden="true">▴</span></button>
      </div>
      </div>
  </>;
  return <div className="services-page services-directory" lang={language}>
    <ServicesHeader language={language} chooseLanguage={chooseLanguage} directoryHeading search={{ value: filters.query ?? '', onChange: value => update('query', value), label: searchLabels[language], filterLabel: filterButtonLabels[language], filterCount: activeFilterCount, renderFilters: renderFilterFields }} />
    <main className="services-main">
    <DirectoryLoadingProgress status={status} progress={loadProgress} />
    {categories.length > 0 && <section className="services-category-carousel" aria-label={t[10]}>
      <div className="services-category-heading"><h2>{t[10]}</h2><div className="services-category-arrows"><CarouselArrow track={categoryCarousel} direction={1} label={t[10] + ' ←'} onStep={() => categoryCarousel.current?.scrollBy({ left: 360, behavior: 'smooth' })}>←</CarouselArrow><CarouselArrow track={categoryCarousel} direction={-1} label={t[10] + ' →'} onStep={() => categoryCarousel.current?.scrollBy({ left: -360, behavior: 'smooth' })}>→</CarouselArrow></div></div>
      <div className="services-category-track" ref={categoryCarousel}>
        {Array.from({ length: categoryCopies }, (_, copy) => <div key={copy} className="services-category-group" aria-hidden={copy !== 1 ? true : undefined}>{[{ value: '', label: t[11], count: listings.length }, ...categories.map(category => ({ value: category, label: categoryLabel(category), count: listings.filter(s => listingCategories(s).includes(category)).length }))].map(category => <button type="button" key={category.value} tabIndex={copy === 1 ? 0 : -1} className="services-category-tile" aria-pressed={filters.category === category.value} onClick={() => update('category', filters.category === category.value ? '' : category.value)}><span className="services-category-art" aria-hidden="true" style={categoryImage(category.value) ? { backgroundImage: `url(${categoryImage(category.value)})`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundPosition: `${(categoryArt(category.value) % 4) * 100 / 3}% ${Math.floor(categoryArt(category.value) / 4) * 100}%` }} /><span className="services-category-name">{category.label}</span></button>)}</div>)}
      </div>
    </section>}
    {translationStatus && <p role="status">{translationLabels[language][translationStatus === 'error' ? 1 : 0]} {translationStatus === 'error' && <button type="button" onClick={() => setTranslationRetry(n=>n+1)}>{t[21]}</button>}</p>}
    <div aria-live="polite" role="status">{status === 'error' ? <div className="services-empty"><h2>{t[19]}</h2><p>{t[20]}</p><button onClick={() => { setStatus('loading'); setAttempt(a => a + 1); }}>{t[21]}</button></div> : null}</div>
    {status === 'ready' && !visible.length && <div className="services-empty"><h2>{listings.length ? t[23] : t[24]}</h2><p>{listings.length ? t[25] : t[26]}</p></div>}
    {status === 'ready' && [true, false].map(personalGroup => {
      const group = visible.filter(listing => isPersonalListing(listing) === personalGroup);
      if (!group.length && !(personalGroup ? specialistCategoryOptions : companyCategoryOptions).length) return null;
      const title = directoryGroupLabels[language][personalGroup ? 0 : 1];
      const headingId = personalGroup ? 'specialists-heading' : 'companies-heading';
      if (!personalGroup && !companiesOpen && !showFilteredCompanies) return <section key={headingId} className="services-listing-group" aria-labelledby={headingId}>
        <div className="services-category-heading"><h2 id={headingId}><button type="button" className="services-companies-toggle" aria-expanded={false} aria-controls="companies-content" onClick={() => setCompaniesOpen(true)}>{title}<span aria-hidden="true">▾</span></button></h2></div>
        <div id="companies-content" hidden />
      </section>;
      return <section key={headingId} className="services-listing-group" aria-labelledby={headingId}>
        <div className="services-category-heading"><h2 id={headingId}>{personalGroup || showFilteredCompanies ? title : <button type="button" className="services-companies-toggle" aria-expanded={true} aria-controls="companies-content" onClick={() => { setCompaniesOpen(false); setExpandedCardId(null); }}>{title}<span aria-hidden="true">▴</span></button>}</h2>{personalGroup && <button type="button" className="services-specialist-view" title={specialistViewLabels[language][specialistView === 'carousel' ? 1 : 2]} aria-controls="specialists-track" aria-label={title + ': ' + specialistViewLabels[language][specialistView === 'carousel' ? 1 : 2]} onClick={() => { setSpecialistView(current => current === 'carousel' ? 'grid' : 'carousel'); setExpandedCardId(null); }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{specialistView === 'carousel' ? <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></> : <><rect x="7" y="4" width="10" height="16" rx="2"/><path d="M3 7H1v10h2M21 7h2v10h-2"/></>}</svg></button>}{personalGroup && specialistView === 'carousel' && group.length > 1 && <div className="services-category-arrows"><CarouselArrow track={specialistCarousel} direction={1} label={title + ' ←'} controls="specialists-track" onStep={() => scrollSpecialists(-1)}>←</CarouselArrow><CarouselArrow track={specialistCarousel} direction={-1} label={title + ' →'} controls="specialists-track" onStep={() => scrollSpecialists(1)}>→</CarouselArrow></div>}{!personalGroup && <div className="services-category-arrows">
          <CarouselArrow track={companyCategoryCarousel} direction={1} label={t[10] + ' ←'} controls="company-category-filters" onStep={() => { const track = companyCategoryCarousel.current; track?.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' }); }}>←</CarouselArrow>
          <CarouselArrow track={companyCategoryCarousel} direction={-1} label={t[10] + ' →'} controls="company-category-filters" onStep={() => { const track = companyCategoryCarousel.current; track?.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' }); }}>→</CarouselArrow>
        </div>}</div>
        {personalGroup && <div className="services-company-category-carousel"><div id="specialist-category-filters" ref={specialistCategoryCarousel} className="services-company-categories" role="group" aria-labelledby={headingId}>
          <button type="button" aria-pressed={!specialistCategories.length} onClick={() => setSpecialistCategories([])}>{t[11]}</button>
          {specialistCategoryOptions.map(category => <button type="button" key={category} aria-pressed={specialistCategories.includes(category)} onClick={() => { setFilters(current => ({ ...current, category: '' })); setCompanyCategories([]); setSpecialistCategories(current => current.includes(category) ? [] : [category]); }}>{categoryLabel(category)}</button>)}
        </div></div>}
        {!personalGroup && <div className="services-company-category-carousel"><div id="company-category-filters" ref={companyCategoryCarousel} className="services-company-categories" role="group" aria-labelledby={headingId}>
          <button type="button" aria-pressed={!companyCategories.length} onClick={() => setCompanyCategories([])}>{t[11]}</button>
          {companyCategoryOptions.map(category => <button type="button" key={category} aria-pressed={companyCategories.includes(category)} onClick={() => { setFilters(current => ({ ...current, category: '' })); setSpecialistCategories([]); setCompanyCategories(current => current.includes(category) ? [] : [category]); }}>{categoryLabel(category)}</button>)}
        </div></div>}
        {!group.length && <p role="status">{t[23]}</p>}
        <div id={personalGroup ? 'specialists-track' : 'companies-content'} ref={personalGroup ? specialistCarousel : undefined} className={personalGroup ? (specialistView === 'carousel' ? 'services-specialist-track' : 'services-grid services-specialist-grid') : 'services-grid'} tabIndex={personalGroup ? 0 : undefined} role={personalGroup ? 'region' : undefined} aria-label={personalGroup ? title : undefined}>{(personalGroup && specialistView === 'carousel' && group.length > 1 ? Array.from({ length: specialistCopies }, () => group).flat() : group).map((s, cardIndex) => { const cardId = personalGroup ? `${s.id}-copy-${Math.floor(cardIndex / group.length)}` : s.id; const website = safeServiceWebsite(s.website); const expanded = expandedCardId === cardId; const photos = companyPhotos(s); const translated = translatedCard(s); const roleContent = specialistRole(s.description, translated?.description); const content = cardContent(isPersonalListing(s) ? roleContent.description : translated?.description ?? s.description); const items = serviceItems(content.services); const personal = isPersonalListing(s); const subtitle = [normalizeServiceCity(translated?.city ?? s.city), personal ? '' : displayServiceCategory(s, language, translated?.category)].filter(Boolean).join(' · '); return <article key={cardId} ref={expanded ? expandedCard : null} className="services-card" data-expanded={expanded}>{personal && <div className="services-card-language-flags">{[...new Set(s.service_languages ?? [])].filter(code => Object.hasOwn(serviceLanguages, code)).map(code => <Image key={code} src={"/flags/" + flags[code] + ".svg"} alt={languageName(code)} title={languageName(code)} width={18} height={12} unoptimized />)}</div>}<div className="services-card-header"><div className="services-card-photo">{photos.length > 0 ? <Image className="company-photo" src={photos[0]} alt={s.name} width={800} height={600} unoptimized /> : <span className="services-card-initial" aria-hidden="true">{s.name.trim().slice(0, 1)}</span>}</div><div className="services-card-heading"><p className="services-eyebrow" title={subtitle}>{subtitle}</p><h2 title={s.name}>{s.name}</h2>{personal && <p className="services-person-role">{specialistDisplayRole(s, language, translated)}</p>}{personal && s.represented_company && <p className="services-person-company">{s.represented_company}</p>}</div></div>{s.id === '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf' && <Link className="services-profile-link" href="/services/tkhay-alina" target="_blank" rel="noopener noreferrer">{openPageLabels[language]} <span aria-hidden="true">→</span></Link>}{(!personal || content.description.trim()) && <section className="services-card-section"><h3>{sectionLabels[language][0]}</h3><SmoothDescription text={content.description} expanded={expanded} />{!translated && translationStatus && <p role="status">{translationLabels[language][translationStatus === 'error' ? 1 : 0]}</p>}</section>}<div id={`service-details-${cardId}`} className="services-reveal" aria-hidden={!expanded} inert={!expanded}><div className="services-reveal-inner">{photos.length > 1 && <div className="services-photo-gallery">{photos.slice(1).map((photo, index) => <Image key={index} src={photo} alt={s.name + " — " + (index + 2)} width={800} height={600} unoptimized />)}</div>}{items.length > 0 && <section className="services-card-section"><h3>{sectionLabels[language][1]}</h3><ul className="services-item-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}{s.address.trim() && <section className="services-card-section"><h3>{sectionLabels[language][2]}</h3><MapAddress address={s.address} language={language} /></section>}{!!s.branches?.length && <section className="services-card-section"><h3>{branchLabels[language]}</h3>{s.branches.map(branch => <section key={branch.id} className="services-card-section"><h4>{branch.name}</h4><p>{normalizeServiceCity(branch.city)}</p><MapAddress address={branch.address} language={language} />{branch.phone && <a href={'tel:' + branch.phone.replace(/[^+0-9]/g, '')}><ContactIcon kind="phone" />{phoneLabels[language].other}: {branch.phone}</a>}</section>)}</section>}{s.business_hours && <BusinessHoursDisplay hours={s.business_hours} language={language} />}<div className="services-card-section"><div className="services-tags">{s.service_languages.map(l => <span key={l}>{languageName(l)}</span>)}</div>{(!personal || s.interpreter_languages.length > 0) && <p className="services-interpreter">{s.has_interpreter ? t[28] + " " + s.interpreter_languages.map(l => languageName(l)).join(', ') : t[29]}</p>}{!personal && s.has_manager && <p className="services-interpreter"><span aria-hidden="true">✓ </span>{managerLabels[language]}</p>}</div><div className="services-contacts services-card-section">{s.email && <a href={'mailto:' + s.email}><ContactIcon kind="email" />{s.email}</a>}{companyPhones(s).map((phone,index) => <a key={index} href={'tel:' + phone.number.replace(/[^+0-9]/g, '')}><ContactIcon kind="phone" />{phoneLabels[language][phone.type]}: {phone.number}</a>)}{website && <a href={website} target="_blank" rel="noopener noreferrer">{t[30]} ↗</a>}{validSocialLinks(s.social_links).map((link,index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer"><SocialIcon network={link.network} />{link.network === "other" ? t[37] : socialNetworks[link.network]} ↗</a>)}</div>{s.id !== '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf' && <Link className="services-profile-link" href={serviceProfilePath(s.id)} target="_blank" rel="noopener noreferrer">{openPageLabels[language]} <span aria-hidden="true">→</span></Link>}</div></div><button type="button" className="services-details-toggle" aria-expanded={expanded} aria-controls={`service-details-${s.id}`} onClick={() => setExpandedCardId(current => current === cardId ? null : cardId)}>{detailLabels[language][expanded ? 1 : 0]} <span aria-hidden="true">{expanded ? '▴' : '▾'}</span></button></article>; })}</div></section>; })}
    <aside className="services-business"><h2>{t[31]}</h2><p>{t[32]}</p><RegistrationLink language={language} /></aside>
    </main><footer className="services-footer"><p className="services-footer-slogan">{{ru:'Мы ищем — вы просто выбираете.',en:'We search — you simply choose.',ko:'저희가 찾고, 여러분은 선택만 하세요.',uz:'Biz izlaymiz — siz faqat tanlaysiz.',zh:'我们寻找，您只需选择。',vi:'Chúng tôi tìm kiếm — bạn chỉ cần lựa chọn.',tr:'Biz arıyoruz — siz sadece seçiyorsunuz.'}[language]}</p>ESX · {t[34]}<LegalLinks language={language} /><p className="trademark-notice">{trademarkNotice[language]}</p><p className="services-footer-description">{t[6]}</p></footer><ServicesBackToTop language={language} /></div>;
}
