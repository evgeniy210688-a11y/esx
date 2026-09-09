import { holidays, type Language } from './content';

// 2026 calendar: https://www.bok.or.kr/eng/main/contents.do?menuNo=400373
// Public holiday list: https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=372&vcontsId=140038
const extraNames: Record<Language, string> = {
  ru: 'Новый год|День труда|День местных выборов|День памяти|День Конституции|День освобождения|День основания государства|Рождество',
  en: 'New Year’s Day|Labor Day|Local Election Day|Memorial Day|Constitution Day|Liberation Day|National Foundation Day|Christmas',
  ko: '신정|노동절|전국동시지방선거일|현충일|제헌절|광복절|개천절|성탄절',
  zh: '元旦|劳动节|地方选举日|显忠日|制宪节|光复节|开天节|圣诞节',
  tr: 'Yılbaşı|Emek Günü|Yerel Seçim Günü|Anma Günü|Anayasa Günü|Kurtuluş Günü|Ulusal Kuruluş Günü|Noel',
  vi: 'Tết Dương lịch|Ngày Lao động|Ngày Bầu cử địa phương|Ngày Tưởng niệm|Ngày Hiến pháp|Ngày Giải phóng|Ngày Lập quốc|Giáng sinh',
  km: 'ចូលឆ្នាំសកល|ទិវាពលកម្ម|ថ្ងៃបោះឆ្នោតមូលដ្ឋាន|ទិវារំលឹកវិញ្ញាណក្ខន្ធ|ទិវារដ្ឋធម្មនុញ្ញ|ទិវារំដោះជាតិ|ទិវាបង្កើតជាតិ|បុណ្យណូអែល',
  kk: 'Жаңа жыл|Еңбек күні|Жергілікті сайлау күні|Еске алу күні|Конституция күні|Азаттық күні|Мемлекеттің құрылған күні|Рождество',
};

export const calendarLabels: Record<Language, { subtitle: string; note: string; substitute: string; official: string }> = {
  ru: { subtitle: '2026 · Все официальные праздники и особые выходные', note: 'Даты на 2026 год. Переносы выходных указаны отдельно в карточках.', substitute: 'Перенос выходного', official: 'Официальный выходной в Южной Корее.' },
  en: { subtitle: '2026 · All public holidays and special days off', note: 'Dates for 2026. Substitute days off are listed on the cards.', substitute: 'Substitute day off', official: 'Official day off in South Korea.' },
  ko: { subtitle: '2026 · 모든 공휴일 및 특별 휴일', note: '2026년 기준입니다. 대체공휴일은 각 카드에 표시됩니다.', substitute: '대체공휴일', official: '대한민국의 공휴일입니다.' },
  zh: { subtitle: '2026 · 全部公共假日及特别休息日', note: '日期为2026年。补休日在各卡片中列出。', substitute: '补休日', official: '韩国法定休息日。' },
  tr: { subtitle: '2026 · Tüm resmî tatiller ve özel izin günleri', note: '2026 tarihleri. Telafi tatilleri kartlarda belirtilmiştir.', substitute: 'Telafi tatili', official: 'Güney Kore’de resmî tatil.' },
  vi: { subtitle: '2026 · Tất cả ngày lễ chính thức và ngày nghỉ đặc biệt', note: 'Ngày trong năm 2026. Ngày nghỉ bù được ghi trên từng thẻ.', substitute: 'Ngày nghỉ bù', official: 'Ngày nghỉ chính thức tại Hàn Quốc.' },
  km: { subtitle: '2026 · ថ្ងៃឈប់សម្រាកផ្លូវការ និងថ្ងៃឈប់សម្រាកពិសេសទាំងអស់', note: 'កាលបរិច្ឆេទឆ្នាំ 2026។ ថ្ងៃឈប់សម្រាកជំនួសមាននៅលើកាត។', substitute: 'ថ្ងៃឈប់សម្រាកជំនួស', official: 'ថ្ងៃឈប់សម្រាកផ្លូវការនៅកូរ៉េខាងត្បូង។' },
  kk: { subtitle: '2026 · Барлық ресми мерекелер мен арнайы демалыс күндері', note: '2026 жылғы күндер. Ауыстырылған демалыстар карточкаларда көрсетілген.', substitute: 'Ауыстырылған демалыс', official: 'Оңтүстік Кореядағы ресми демалыс күні.' },
};

const schedule = [
  { extra: 0, date: '01-01' },
  { original: 0, date: '02-16', end: '02-18' },
  { original: 1, date: '03-01', substitute: '03-02' },
  { extra: 1, date: '05-01' },
  { original: 2, date: '05-05' },
  { original: 3, date: '05-24', substitute: '05-25' },
  { extra: 2, date: '06-03' },
  { extra: 3, date: '06-06' },
  { extra: 4, date: '07-17' },
  { extra: 5, date: '08-15', substitute: '08-17' },
  { original: 4, date: '09-24', end: '09-26' },
  { extra: 6, date: '10-03', substitute: '10-05' },
  { original: 5, date: '10-09' },
  { extra: 7, date: '12-25' },
];

const imageNames = ['new-year', 'seollal', 'independence', 'labor', 'children', 'buddha', 'election', 'memorial', 'constitution', 'liberation', 'chuseok', 'foundation', 'hangul', 'christmas'];

export function getHolidayCalendar(language: Language) {
  const format = (date: string) => new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`2026-${date}T12:00:00Z`));
  return schedule.map((item, index) => {
    const [name, description] = item.original !== undefined
      ? holidays[language][item.original].split('~')
      : [extraNames[language].split('|')[item.extra!], calendarLabels[language].official];
    return {
      id: item.date,
      image: `/holidays/${imageNames[index]}.webp`,
      name: name.split(' · ')[0],
      description,
      date: item.end ? `${format(item.date)} – ${format(item.end)}` : format(item.date),
      substitute: item.substitute ? `${calendarLabels[language].substitute}: ${format(item.substitute)}` : null,
    };
  });
}
