"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { copy, type Language } from './content';

const scenes = ['cafe', 'hotel', 'bank', 'meeting', 'restaurant'];
const fullscreenLabels: Record<Language, string[]> = {
  ru: ['Полноэкранный режим', 'Выйти из полноэкранного режима'], en: ['Full screen', 'Exit full screen'], ko: ['전체 화면', '전체 화면 종료'], zh: ['全屏', '退出全屏'], tr: ['Tam ekran', 'Tam ekrandan çık'], vi: ['Toàn màn hình', 'Thoát toàn màn hình'], km: ['ពេញអេក្រង់', 'ចេញពីពេញអេក្រង់'], kk: ['Толық экран', 'Толық экраннан шығу'],
};
const messages: Record<Language, string[]> = {
  ru: ['ESX для бизнеса', 'Кофейня|Гостиница|Банк|Бизнес-встреча|Ресторан', 'Кофе сближает. ESX помогает общаться.|Гостеприимство начинается с понимания.|Важные вопросы. Понятный разговор.|Разные страны. Общие идеи.|Хороший вечер начинается с общения.', 'Один QR-код — и вы в личном чате. Общайтесь с гостями, клиентами и партнёрами через ESX.', 'Остановить смену баннеров', 'Продолжить смену баннеров'],
  en: ['ESX for business', 'Coffee shop|Hotel|Bank|Business meeting|Restaurant', 'Coffee connects. ESX keeps you talking.|Hospitality starts with understanding.|Important questions. Clear conversations.|Different countries. Shared ideas.|A good evening starts with a conversation.', 'One QR code opens a private chat. Connect with guests, customers and partners through ESX.', 'Pause banners', 'Play banners'],
  ko: ['비즈니스를 위한 ESX', '카페|호텔|은행|비즈니스 미팅|레스토랑', '커피로 가까워지고, ESX로 소통하세요.|이해에서 시작되는 환대.|중요한 질문, 편안한 대화.|나라는 달라도 아이디어는 함께.|좋은 저녁은 대화에서 시작됩니다.', 'QR 코드 하나로 개인 채팅을 시작하세요. ESX로 손님, 고객, 파트너와 소통하세요.', '배너 일시 정지', '배너 재생'],
  zh: ['商务 ESX', '咖啡店|酒店|银行|商务会议|餐厅', '咖啡拉近距离，ESX连接对话。|待客之道始于理解。|重要问题，清晰沟通。|不同国家，共同创意。|美好夜晚，从交流开始。', '一个二维码即可开启私密聊天。通过ESX与宾客、客户和合作伙伴交流。', '暂停轮播', '继续轮播'],
  tr: ['İş dünyası için ESX', 'Kafe|Otel|Banka|İş toplantısı|Restoran', 'Kahve yakınlaştırır. ESX iletişim kurar.|Misafirperverlik anlayışla başlar.|Önemli sorular. Açık konuşmalar.|Farklı ülkeler. Ortak fikirler.|Güzel bir akşam sohbetle başlar.', 'Tek bir QR kodla özel sohbet başlatın. ESX ile misafirleriniz, müşterileriniz ve ortaklarınızla iletişim kurun.', 'Bannerları duraklat', 'Bannerları oynat'],
  vi: ['ESX cho doanh nghiệp', 'Quán cà phê|Khách sạn|Ngân hàng|Cuộc họp kinh doanh|Nhà hàng', 'Cà phê gắn kết. ESX kết nối trò chuyện.|Hiếu khách bắt đầu từ sự thấu hiểu.|Câu hỏi quan trọng. Trao đổi rõ ràng.|Khác quốc gia. Chung ý tưởng.|Buổi tối đẹp bắt đầu bằng trò chuyện.', 'Một mã QR mở cuộc trò chuyện riêng. Kết nối khách hàng và đối tác qua ESX.', 'Tạm dừng biểu ngữ', 'Tiếp tục biểu ngữ'],
  km: ['ESX សម្រាប់អាជីវកម្ម', 'ហាងកាហ្វេ|សណ្ឋាគារ|ធនាគារ|កិច្ចប្រជុំអាជីវកម្ម|ភោជនីយដ្ឋាន', 'កាហ្វេនាំមនុស្សជិតស្និទ្ធ។ ESX ជួយទំនាក់ទំនង។|បដិសណ្ឋារកិច្ចចាប់ផ្តើមពីការយល់គ្នា។|សំណួរសំខាន់។ ការសន្ទនាច្បាស់លាស់។|ប្រទេសផ្សេងគ្នា។ គំនិតរួមគ្នា។|រាត្រីល្អចាប់ផ្តើមពីការសន្ទនា។', 'កូដ QR មួយបើកការជជែកឯកជន។ ទាក់ទងភ្ញៀវ អតិថិជន និងដៃគូតាម ESX។', 'ផ្អាកបដា', 'បន្តបដា'],
  kk: ['Бизнеске арналған ESX', 'Кофехана|Қонақүй|Банк|Іскерлік кездесу|Мейрамхана', 'Кофе жақындастырады. ESX тілдестіреді.|Қонақжайлық түсіністіктен басталады.|Маңызды сұрақтар. Түсінікті әңгіме.|Әртүрлі елдер. Ортақ идеялар.|Жақсы кеш әңгімеден басталады.', 'Бір QR код жеке чат ашады. ESX арқылы қонақтармен, клиенттермен және серіктестермен сөйлесіңіз.', 'Баннерлерді тоқтату', 'Баннерлерді жалғастыру'],
};

export default function BusinessHero({ language, onStart }: { language: Language; onStart: () => void }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const sync = () => setExpanded(document.fullscreenElement === heroRef.current);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false); };
    document.addEventListener('fullscreenchange', sync);
    window.addEventListener('keydown', escape);
    return () => { document.removeEventListener('fullscreenchange', sync); window.removeEventListener('keydown', escape); };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [expanded]);
  async function toggleFullscreen() {
    if (expanded) {
      if (document.fullscreenElement) await document.exitFullscreen();
      setExpanded(false);
    } else {
      try { await heroRef.current?.requestFullscreen(); } catch { /* Use viewport mode when native fullscreen is unavailable. */ }
      setExpanded(true);
    }
  }
  const m = messages[language];
  const labels = m[1].split('|');
  const titles = m[2].split('|');
  useEffect(() => {
    if (paused || focused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(current => (current + 1) % scenes.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused, focused, active]);

  return <section ref={heroRef} id="home" className={`hero business-hero ${expanded ? 'is-expanded' : ''}`} aria-label={m[0]} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    {scenes.map((scene, index) => <div className={`business-slide ${index === active ? 'is-active' : ''}`} key={scene} aria-hidden={index !== active}>
      <Image src={`/banners/${scene}-generated.webp`} alt="" fill preload={index === 0} loading={index === 0 ? undefined : 'eager'} sizes={expanded ? '100vw' : '(max-width: 1328px) 100vw, 1264px'} className="hero-image" />
      <div className="hero-shade" />
      <div className="business-caption"><div className="eyebrow"><span className="live-dot" />{m[0]} · {labels[index]}</div><h1>{titles[index]}</h1><p>{m[3]}</p></div>
    </div>)}
    <button className="business-fullscreen" type="button" onClick={toggleFullscreen} aria-label={fullscreenLabels[language][expanded ? 1 : 0]} title={fullscreenLabels[language][expanded ? 1 : 0]}><span aria-hidden="true">{expanded ? '✕' : '⛶'}</span><span>{fullscreenLabels[language][expanded ? 1 : 0]}</span></button>
    <div className="business-actions"><button className="button light" onClick={async () => { if (expanded) await toggleFullscreen(); onStart(); }}>{copy[language][8]} ↗</button><a href="/contact" className="hero-link" onClick={async () => { if (expanded) await toggleFullscreen(); }}>{copy[language][4]} ↗</a></div>
    <div className="business-controls"><div className="business-tabs">{labels.map((label, index) => <button key={scenes[index]} type="button" aria-pressed={active === index} onClick={() => setActive(index)}><span>{String(index + 1).padStart(2, '0')}</span>{label}</button>)}</div><button type="button" className="business-pause" aria-label={paused ? m[5] : m[4]} onClick={() => setPaused(value => !value)}>{paused ? '▶' : 'Ⅱ'}</button></div>
  </section>;
}
