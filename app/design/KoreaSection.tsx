import Image from 'next/image';
import { copy, placeNames, type Language } from './content';
import { calendarLabels, getHolidayCalendar } from './holiday-calendar';

const placeImages = ['gyeongbokgung', 'changdeokgung', 'n-seoul-tower', 'cheonggyecheon', 'national-museum', 'seoul-forest', 'hangang', 'hongdae', 'songdo', 'hwaseong', 'bulguksa', 'gamcheon', 'haeundae', 'haedong-yonggungsa', 'hallasan', 'seongsan'];

export default function KoreaSection({ language }: { language: Language }) {
  const t = copy[language];
  return <section id="korea" className="korea-section">
    <div className="section-heading"><div><div className="eyebrow blue-ink">{t[1]}</div><h1 style={{ fontSize: 'clamp(30px, 3.3vw, 43px)', lineHeight: 1.1 }}>{t[18]}</h1></div><p>{t[19]}</p></div>
    <div id="holidays" className="subheading"><h2>{t[20]}</h2><span>{calendarLabels[language].subtitle}</span></div>
    <div className="holiday-grid">{getHolidayCalendar(language).map((holiday, i) => <article key={holiday.id} className={`holiday holiday-${i % 6}`}>
      <div className="holiday-art"><Image src={holiday.image} alt={holiday.name} fill sizes="(max-width: 540px) 100vw, (max-width: 1100px) 50vw, 25vw" className="holiday-image" /></div>
      <span className="holiday-number">{String(i + 1).padStart(2, '0')}</span><h4>{holiday.name}</h4><p className="holiday-date">{holiday.date}</p><p>{holiday.description}</p>{holiday.substitute && <p className="holiday-substitute">{holiday.substitute}</p>}
    </article>)}</div>
    <div className="source-row"><span>{calendarLabels[language].note}</span><a href="https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=372&vcontsId=140038" target="_blank" rel="noreferrer">{t[41]} · VISITKOREA ↗</a></div>
    <div id="places" className="subheading places-heading"><div><div className="eyebrow blue-ink">✳ {t[1]}</div><h2>{t[22]}</h2></div><span>{t[23]}</span></div>
    <div className="places-grid">{placeNames[language].split('|').map((name, i) => <a className={`place place-${i % 4}`} key={placeImages[i]} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeNames.en.split('|')[i] + ', South Korea')}`} target="_blank" rel="noreferrer" aria-label={`${name} — ${t[42]}`}>
      <div className="place-art"><span className="place-count">{String(i + 1).padStart(2, '0')}</span><Image src={`/places/${placeImages[i]}.webp`} alt={name} fill sizes="(max-width: 760px) 50vw, (max-width: 1328px) 25vw, 303px" className="place-image" /><span className="map-arrow">↗</span></div><div className="place-info"><h4>{name}</h4><span>{t[42]} ↗</span></div>
    </a>)}</div>
    <div className="source-row"><a href="https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=218&vcontsId=145437" target="_blank" rel="noreferrer">{t[41]} · VISITKOREA ↗</a></div>
  </section>;
}
