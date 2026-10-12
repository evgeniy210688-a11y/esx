export type BusinessHours = { days: number[]; opens: string; closes: string; lunchStart: string; lunchEnd: string };
export function newBusinessHours(): BusinessHours { return {days:[0,1,2,3,4],opens:'09:00',closes:'18:00',lunchStart:'',lunchEnd:''}; }
const time=/^([01]\d|2[0-3]):[0-5]\d$/;
const minutes=(s:string)=>Number(s.slice(0,2))*60+Number(s.slice(3));
export function validBusinessHours(h: BusinessHours | null | undefined): boolean {
 if(h==null)return true;
 if(!Array.isArray(h.days)||!h.days.length||h.days.length>7||new Set(h.days).size!==h.days.length||!h.days.every(d=>Number.isInteger(d)&&d>=0&&d<7))return false;
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
