'use client';

import { useEffect, useRef } from 'react';
import type { Language } from './content';
import Image from 'next/image';

const companyLogos: Record<string, string> = { Samsung: 'samsung.svg', Kia: 'kia.svg', Hyundai: 'hyundai.svg', LG: 'lg.svg' };
const bankLogos: Record<string, string> = { 'NH NongHyup Bank': 'nh.svg', 'KB Kookmin Bank': 'kb.svg', 'Shinhan Bank': 'shinhan.svg', 'Woori Bank': 'woori.svg', 'Hana Bank': 'hana.svg' };

const labels: Record<Language, string[]> = {
  ru: ['Банки Южной Кореи', 'Официальные сайты местных банков — счета, карты и банковские услуги.', 'Лидеры экономики Южной Кореи', 'Samsung, Kia, Hyundai и LG — одни из лидеров экономики Южной Кореи. Их электроника, автомобили и технологии известны во всём мире.', 'Официальный сайт'],
  en: ['South Korean banks', 'Official local bank websites for accounts, cards and banking services.', 'Leaders of South Korea’s economy', 'Samsung, Kia, Hyundai and LG are among the leaders of South Korea’s economy. Their electronics, cars and technologies are known worldwide.', 'Official website'],
  ko: ['대한민국의 은행', '계좌, 카드 및 금융 서비스를 위한 국내 은행 공식 웹사이트입니다.', '대한민국 경제를 이끄는 기업', '삼성, 기아, 현대, LG는 대한민국 경제를 이끄는 대표 기업입니다. 전자제품, 자동차와 기술로 세계에 알려져 있습니다.', '공식 웹사이트'],
  zh: ['韩国银行', '查询账户、银行卡及银行服务的本地银行官方网站。', '韩国经济的领军企业', '三星、起亚、现代和LG是韩国经济的领军企业之一，其电子产品、汽车和技术享誉全球。', '官方网站'],
  tr: ['Güney Kore bankaları', 'Hesaplar, kartlar ve bankacılık hizmetleri için yerel bankaların resmî siteleri.', 'Güney Kore ekonomisinin liderleri', 'Samsung, Kia, Hyundai ve LG, Güney Kore ekonomisinin lider şirketleri arasındadır. Elektronik ürünleri, otomobilleri ve teknolojileri dünya çapında tanınır.', 'Resmî web sitesi'],
  vi: ['Ngân hàng Hàn Quốc', 'Trang chính thức của các ngân hàng địa phương về tài khoản, thẻ và dịch vụ ngân hàng.', 'Doanh nghiệp dẫn đầu kinh tế Hàn Quốc', 'Samsung, Kia, Hyundai và LG là những doanh nghiệp hàng đầu của kinh tế Hàn Quốc, nổi tiếng toàn cầu về điện tử, ô tô và công nghệ.', 'Trang web chính thức'],
  km: ['ធនាគារកូរ៉េខាងត្បូង', 'គេហទំព័រផ្លូវការរបស់ធនាគារក្នុងស្រុកសម្រាប់គណនី កាត និងសេវាធនាគារ។', 'ក្រុមហ៊ុនឈានមុខក្នុងសេដ្ឋកិច្ចកូរ៉េខាងត្បូង', 'Samsung, Kia, Hyundai និង LG ជាក្រុមហ៊ុនឈានមុខក្នុងសេដ្ឋកិច្ចកូរ៉េខាងត្បូង។ ផលិតផលអេឡិចត្រូនិក រថយន្ត និងបច្ចេកវិទ្យារបស់ពួកគេត្រូវបានស្គាល់ទូទាំងពិភពលោក។', 'គេហទំព័រផ្លូវការ'],
  kk: ['Оңтүстік Корея банктері', 'Шоттар, карталар және банк қызметтері туралы жергілікті банктердің ресми сайттары.', 'Оңтүстік Корея экономикасының көшбасшылары', 'Samsung, Kia, Hyundai және LG — Оңтүстік Корея экономикасының жетекші компаниялары. Олардың электроникасы, көліктері мен технологиялары бүкіл әлемге танымал.', 'Ресми сайт'],
};
const banks = [
  { name: 'NH NongHyup Bank', mark: 'NH', color: '#ffd33d', url: 'https://bank.nonghyup.com/' },
  { name: 'KB Kookmin Bank', mark: 'KB', color: '#ffcc00', url: 'https://www.kbstar.com/' },
  { name: 'Shinhan Bank', mark: 'SH', color: '#78a9ff', url: 'https://www.shinhan.com/' },
  { name: 'Woori Bank', mark: 'W', color: '#69d4ff', url: 'https://www.wooribank.com/' },
  { name: 'Hana Bank', mark: 'H', color: '#67dcc9', url: 'https://www.kebhana.com/' },
];
const companyDescriptions: Record<Language, string[]> = {
  ru: ['Смартфоны, телевизоры, бытовая техника и полупроводники — технологии для повседневной жизни и бизнеса.', 'Легковые автомобили, кроссоверы и электромобили с акцентом на дизайн и удобство.', 'Автомобили, электромобили и водородный транспорт — решения для современной мобильности.', 'Бытовая техника, телевизоры и дисплеи — технологии для дома и бизнеса.'],
  en: ['Smartphones, TVs, home appliances and semiconductors for everyday life and business.', 'Cars, SUVs and electric vehicles with a focus on design and comfort.', 'Cars, electric vehicles and hydrogen-powered transport for modern mobility.', 'Home appliances, TVs and displays for homes and businesses.'],
  ko: ['스마트폰, TV, 가전제품, 반도체로 일상과 비즈니스를 연결하는 기술 기업입니다.', '디자인과 편의성을 중시하는 승용차, SUV, 전기차를 만듭니다.', '자동차, 전기차, 수소차로 미래 모빌리티를 만들어 갑니다.', '가전제품, TV, 디스플레이로 가정과 비즈니스에 필요한 기술을 제공합니다.'],
  zh: ['提供智能手机、电视、家用电器和半导体，服务日常生活与商业。', '生产注重设计与舒适性的轿车、SUV和电动汽车。', '通过汽车、电动汽车和氢能汽车提供现代出行方案。', '为家庭和企业提供家用电器、电视和显示器。'],
  tr: ['Günlük yaşam ve iş dünyası için akıllı telefonlar, televizyonlar, ev aletleri ve yarı iletkenler.', 'Tasarım ve konfora odaklanan otomobiller, SUV’lar ve elektrikli araçlar.', 'Modern ulaşım için otomobiller, elektrikli ve hidrojenle çalışan araçlar.', 'Evler ve işletmeler için ev aletleri, televizyonlar ve ekranlar.'],
  vi: ['Điện thoại thông minh, TV, thiết bị gia dụng và chất bán dẫn cho cuộc sống và doanh nghiệp.', 'Ô tô, SUV và xe điện chú trọng thiết kế và sự tiện nghi.', 'Ô tô, xe điện và xe chạy bằng hydro phục vụ nhu cầu di chuyển hiện đại.', 'Thiết bị gia dụng, TV và màn hình cho gia đình và doanh nghiệp.'],
  km: ['ស្មាតហ្វូន ទូរទស្សន៍ គ្រឿងប្រើប្រាស់ក្នុងផ្ទះ និងសារធាតុពាក់កណ្តាលចម្លង សម្រាប់ជីវិតប្រចាំថ្ងៃ និងអាជីវកម្ម។', 'រថយន្ត រថយន្ត SUV និងរថយន្តអគ្គិសនី ដែលផ្តោតលើការរចនា និងផាសុកភាព។', 'រថយន្ត រថយន្តអគ្គិសនី និងរថយន្តអ៊ីដ្រូសែន សម្រាប់ការធ្វើដំណើរទំនើប។', 'គ្រឿងប្រើប្រាស់ក្នុងផ្ទះ ទូរទស្សន៍ និងអេក្រង់ សម្រាប់គេហដ្ឋាន និងអាជីវកម្ម។'],
  kk: ['Күнделікті өмір мен бизнеске арналған смартфондар, теледидарлар, тұрмыстық техника және жартылай өткізгіштер.', 'Дизайн мен жайлылыққа мән беретін жеңіл көліктер, кроссоверлер және электромобильдер.', 'Заманауи қозғалысқа арналған автомобильдер, электромобильдер және сутегі көліктері.', 'Үй мен бизнеске арналған тұрмыстық техника, теледидарлар және дисплейлер.'],
};
const companies = [
  { name: 'Samsung', mark: 'SAMSUNG', color: '#b8cbff', url: 'https://www.samsung.com/' },
  { name: 'Kia', mark: 'KIA', color: '#fff', url: 'https://worldwide.kia.com/' },
  { name: 'Hyundai', mark: 'HYUNDAI', color: '#9ac9ff', url: 'https://www.hyundai.com/worldwide/en' },
  { name: 'LG', mark: 'LG', color: '#ff8bae', url: 'https://www.lg.com/global/' },
];

export default function KoreaEconomy({ language }: { language: Language }) {
  const t = labels[language];
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panels = root.current?.querySelectorAll<HTMLElement>('.economy-group');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      panels?.forEach(panel => {
        const progress = motion.matches ? 1 : Math.max(0, Math.min(1, (window.innerHeight * .85 - panel.getBoundingClientRect().top) / (window.innerHeight * .7)));
        panel.style.setProperty('--daylight', `${progress}`);
        panel.style.setProperty('--panel-ink', `rgb(${Math.round(245 - progress * 225)} ${Math.round(247 - progress * 222)} ${Math.round(250 - progress * 220)})`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);
  return <div className="korea-economy" ref={root}>{[banks, companies].map((items, index) => <section className={`economy-group economy-panel-${index}`} key={index} aria-labelledby={`economy-title-${index}`}>
    <div className="economy-panel-inner">
    <div className="economy-heading"><h2 id={`economy-title-${index}`}>{t[index * 2]}</h2><p>{t[index * 2 + 1]}</p></div>
    <div className="economy-grid">{items.map((item, itemIndex) => <a className="economy-card" key={item.name} href={item.url} target="_blank" rel="noopener noreferrer">
      <span className="company-logo"><Image src={index === 1 ? `/company-logos/${companyLogos[item.name]}` : `/bank-logos/${bankLogos[item.name]}`} alt={item.name} width={200} height={64} style={{ width: '100%', height: '64px', objectFit: 'contain' }} /></span>
      <h3>{item.name}</h3>{index === 1 && <p className="economy-description">{companyDescriptions[language][itemIndex]}</p>}<span className="economy-domain">{new URL(item.url).hostname.replace(/^www\./, '')}</span><span className="economy-link">{t[4]} <span aria-hidden="true">↗</span></span>
    </a>)}</div></div>
  </section>)}</div>;
}
