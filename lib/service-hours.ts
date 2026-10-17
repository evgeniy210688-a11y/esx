export type HoursPeriod = { days: number[]; opens: string; closes: string; lunchStart: string; lunchEnd: string };
export type BusinessHours = HoursPeriod & { alwaysOpen?: boolean; periods?: HoursPeriod[]; closedOnHolidays?: boolean };
export function businessHoursPeriods(h: BusinessHours): HoursPeriod[] {
 return h.periods ?? [{ days: h.days, opens: h.opens, closes: h.closes, lunchStart: h.lunchStart, lunchEnd: h.lunchEnd }];
}
export function withBusinessHoursPeriods(h: BusinessHours, periods: HoursPeriod[]): BusinessHours {
 const first = periods[0] ?? newBusinessHours();
 return { ...h, ...first, alwaysOpen: false, days: [...new Set(periods.flatMap(p => p.days))].sort(), periods };
}
export function newBusinessHours(): BusinessHours { return {days:[0,1,2,3,4],opens:'09:00',closes:'18:00',lunchStart:'',lunchEnd:''}; }
export function roundTheClockHours(): BusinessHours { return { alwaysOpen: true, days: [0,1,2,3,4,5,6], opens: '00:00', closes: '00:00', lunchStart: '', lunchEnd: '' }; }
export const alwaysOpenLabels: Record<string,string> = { ru: 'Круглосуточно, без выходных', en: 'Open 24/7', ko: '연중무휴 24시간 영업', uz: 'Har kuni, 24 soat', zh: '全天24小时营业，全年无休', vi: 'Mở cửa 24/7', tr: '7/24 açık' };
const time=/^([01]\d|2[0-3]):[0-5]\d$/;
const minutes=(s:string)=>Number(s.slice(0,2))*60+Number(s.slice(3));
export function validBusinessHours(h: BusinessHours | null | undefined): boolean {
 if(h==null)return true;
 if(h.closedOnHolidays !== undefined && typeof h.closedOnHolidays !== 'boolean')return false;
 if(h.periods !== undefined) {
  if(h.alwaysOpen || !Array.isArray(h.periods) || h.periods.length < 1 || h.periods.length > 7)return false;
  if(!h.periods.every(p => p && validPeriod(p)))return false;
  const days=h.periods.flatMap(p=>p.days);
  return new Set(days).size===days.length;
 }
 if(h.alwaysOpen && h.closedOnHolidays)return false;
 return validPeriod(h, h.alwaysOpen);
}
function validPeriod(h: HoursPeriod, alwaysOpen = false): boolean {
 if(!Array.isArray(h.days)||!h.days.length||h.days.length>7||new Set(h.days).size!==h.days.length||!h.days.every(d=>Number.isInteger(d)&&d>=0&&d<7))return false;
 if(alwaysOpen === true)return h.days.length===7 && h.opens==='00:00' && h.closes==='00:00' && h.lunchStart==='' && h.lunchEnd==='';
 if(!time.test(h.opens)||!time.test(h.closes)||h.opens===h.closes)return false;
 if(h.lunchStart===''&&h.lunchEnd==='')return true;
 if(!time.test(h.lunchStart)||!time.test(h.lunchEnd))return false;
 const duration=(minutes(h.closes)-minutes(h.opens)+1440)%1440;
 const start=(minutes(h.lunchStart)-minutes(h.opens)+1440)%1440;
 const end=(minutes(h.lunchEnd)-minutes(h.opens)+1440)%1440;
 return start<end&&end<=duration&&(end-start)<duration;
}
export const hoursLabels: Record<string,[string,string,string,string,string]>={
 ru:['Режим работы','Рабочие дни','Обед','Без обеда','следующий день'],en:['Opening hours','Working days','Lunch break','No lunch break','next day'],
 ko:['영업시간','영업일','점심시간','점심시간 없음','다음 날'],uz:['Ish vaqti','Ish kunlari','Tushlik','Tushlik tanaffusisiz','keyingi kun'],
 zh:['营业时间','营业日','午休','无午休','次日'],vi:['Giờ làm việc','Ngày làm việc','Nghỉ trưa','Không nghỉ trưa','ngày hôm sau'],tr:['Çalışma saatleri','Çalışma günleri','Öğle arası','Öğle arası yok','ertesi gün']};
export function weekdayName(day:number,language:string){return new Intl.DateTimeFormat(language,{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2024,0,1+day)));}

export const closedHoursLabels: Record<string, [string, string]> = {
 ru: ['Выходные', 'В праздничные дни — выходной'],
 en: ['Closed', 'Closed on public holidays'],
 ko: ['휴무', '공휴일 휴무'],
 uz: ['Dam olish kunlari', 'Bayram kunlari yopiq'],
 zh: ['休息日', '公共假日休息'],
 vi: ['Ngày nghỉ', 'Nghỉ vào ngày lễ'],
 tr: ['Kapalı', 'Resmî tatillerde kapalı'],
};