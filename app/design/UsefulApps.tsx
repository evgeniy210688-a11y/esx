import Image from 'next/image';
import { type Language } from './content';

const apps = [
  { name: 'KakaoTalk', icon: 'kakaotalk', url: 'https://www.kakaocorp.com/page/service/service/KakaoTalk?lang=en' },
  { name: 'KakaoMap', icon: 'kakaomap', url: 'https://play.google.com/store/apps/details?id=net.daum.android.map' },
  { name: 'KakaoPay', icon: 'kakaopay', url: 'https://kakaopay.com/' },
  { name: 'NAVER Map', icon: 'naver-map', url: 'https://www.navercorp.com/en/service/map' },
  { name: 'Kakao T', icon: 'kakao-t', url: 'https://www.kakaomobility.com/service-kakaot/taxi' },
  { name: 'KakaoMetro', icon: 'kakaometro', url: 'https://play.google.com/store/apps/details?hl=en-US&id=net.orizinal.subway' },
  { name: 'KakaoBus', icon: 'kakaobus', url: 'https://play.google.com/store/apps/details?id=com.astroframe.seoulbus' },
  { name: 'Coupang Eats', icon: 'coupang-eats', url: 'https://apps.apple.com/kr/app/id1445504255' },
];

const messages: Record<Language, string> = {
  ru: 'Для комфортной жизни в Южной Корее|Полезные приложения для общения, поездок и повседневных дел.|Открыть|Сообщения и звонки|Карты, места и маршруты|Оплата и переводы|Поиск мест и навигация|Вызов такси|Линии метро и пересадки|Остановки и прибытие автобусов',
  en: 'Make yourself at home in South Korea|Useful apps for conversations, travel and everyday tasks.|Open|Messages and calls|Maps, places and routes|Payments and transfers|Place search and navigation|Book a taxi|Subway lines and transfers|Bus stops and arrivals',
  ko: '한국 생활을 더 편리하게|소통, 이동, 일상에 도움이 되는 앱을 만나보세요.|열기|메시지와 통화|지도, 장소와 길찾기|결제와 송금|장소 검색과 길안내|택시 호출|지하철 노선과 환승|버스 정류장과 도착 정보',
  zh: '让韩国生活更便利|实用应用，帮助您沟通、出行和处理日常事务。|打开|消息与通话|地图、地点和路线|支付与转账|地点搜索与导航|叫出租车|地铁线路与换乘|公交站与到站信息',
  tr: 'Güney Kore’de daha rahat bir yaşam|İletişim, ulaşım ve günlük işler için yararlı uygulamalar.|Aç|Mesajlar ve aramalar|Haritalar, yerler ve rotalar|Ödemeler ve transferler|Yer arama ve navigasyon|Taksi çağırma|Metro hatları ve aktarmalar|Otobüs durakları ve varışlar',
  vi: 'Sống thoải mái hơn tại Hàn Quốc|Ứng dụng hữu ích cho liên lạc, di chuyển và sinh hoạt hằng ngày.|Mở|Tin nhắn và cuộc gọi|Bản đồ, địa điểm và tuyến đường|Thanh toán và chuyển tiền|Tìm địa điểm và chỉ đường|Gọi taxi|Tuyến tàu điện và chuyển tuyến|Trạm xe buýt và giờ đến',
  km: 'រស់នៅកូរ៉េខាងត្បូងកាន់តែងាយស្រួល|កម្មវិធីសម្រាប់ទំនាក់ទំនង ការធ្វើដំណើរ និងជីវិតប្រចាំថ្ងៃ។|បើក|សារ និងការហៅទូរសព្ទ|ផែនទី ទីតាំង និងផ្លូវ|ការទូទាត់ និងផ្ទេរប្រាក់|ស្វែងរកទីតាំង និងណែនាំផ្លូវ|ហៅតាក់ស៊ី|ខ្សែរថភ្លើងក្រោមដី និងការប្តូរខ្សែ|ចំណត និងពេលរថយន្តក្រុងមកដល់',
  kk: 'Оңтүстік Кореяда жайлы өмір сүру үшін|Қарым-қатынас, сапар және күнделікті істерге арналған қолданбалар.|Ашу|Хабарламалар мен қоңыраулар|Карталар, орындар және бағыттар|Төлемдер мен аударымдар|Орын іздеу және навигация|Такси шақыру|Метро желілері мен ауысулар|Автобус аялдамалары мен келу уақыты',
};

const eatsDescriptions: Record<Language, string> = {"ru":"Доставка еды из ресторанов","en":"Food delivery from restaurants","ko":"음식점 음식 배달","zh":"餐厅美食配送","tr":"Restoranlardan yemek teslimatı","vi":"Giao đồ ăn từ nhà hàng","km":"ដឹកជញ្ជូនអាហារពីភោជនីយដ្ឋាន","kk":"Мейрамханалардан тамақ жеткізу"};

export default function UsefulApps({ language }: { language: Language }) {
  const t = [...messages[language].split('|'), eatsDescriptions[language]];
  return <section className="useful-apps" aria-labelledby="useful-apps-title">
    <div className="useful-apps-heading"><div className="eyebrow blue-ink">SOUTH KOREA / APPS</div><h2 id="useful-apps-title">{t[0]}</h2><p>{t[1]}</p></div>
    <div className="useful-apps-grid">{apps.map((app, i) => <a className="useful-app" key={app.name} href={app.url} target="_blank" rel="noopener noreferrer">
      <Image className="useful-app-mark" src={`/app-icons/${app.icon}.jpg`} width={46} height={46} alt="" sizes="46px" />
      <h3>{app.name}</h3><p>{t[i + 3]}</p><span className="useful-app-link">{t[2]} <span aria-hidden="true">↗</span></span>
    </a>)}</div>
  </section>;
}
