import type { Language } from './content';
import Image from 'next/image';

const companyLogos: Record<string, string> = { Samsung: 'samsung-wordmark.png', Kia: 'kia.svg', Hyundai: 'hyundai.png', LG: 'lg.svg' };

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
const companies = [
  { name: 'Samsung', mark: 'SAMSUNG', color: '#b8cbff', url: 'https://www.samsung.com/' },
  { name: 'Kia', mark: 'KIA', color: '#fff', url: 'https://worldwide.kia.com/' },
  { name: 'Hyundai', mark: 'HYUNDAI', color: '#9ac9ff', url: 'https://www.hyundai.com/worldwide/en' },
  { name: 'LG', mark: 'LG', color: '#ff8bae', url: 'https://www.lg.com/global/' },
];

export default function KoreaEconomy({ language }: { language: Language }) {
  const t = labels[language];
  return <div className="korea-economy">{[banks, companies].map((items, index) => <section className="economy-group" key={index} aria-labelledby={`economy-title-${index}`}>
    <div className="economy-heading"><h2 id={`economy-title-${index}`}>{t[index * 2]}</h2><p>{t[index * 2 + 1]}</p></div>
    <div className="economy-grid">{items.map(item => <a className="economy-card" key={item.name} href={item.url} target="_blank" rel="noopener noreferrer">
      {index === 1 ? <span className="company-logo"><Image src={`/company-logos/${companyLogos[item.name]}`} alt={`${item.name}`} width={200} height={64} style={{ width: '100%', height: '64px', objectFit: 'contain' }} /></span> : <span className="economy-mark" style={{ color: item.color }} aria-hidden="true">{item.mark}</span>}
      <h3>{item.name}</h3><span className="economy-domain">{new URL(item.url).hostname.replace(/^www\./, '')}</span><span className="economy-link">{t[4]} <span aria-hidden="true">↗</span></span>
    </a>)}</div>
  </section>)}</div>;
}
