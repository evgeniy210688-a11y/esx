'use client';
import { businessHoursPeriods, newBusinessHours, roundTheClockHours, weekdayName, withBusinessHoursPeriods, type BusinessHours, type HoursPeriod } from '@/lib/service-hours';

export default function BusinessHoursEditor({ value, onChange }: { value: BusinessHours | null; onChange: (value: BusinessHours | null) => void }) {
 const periods = value ? businessHoursPeriods(value) : [];
 function update(index: number, patch: Partial<HoursPeriod>) {
  if (value) onChange(withBusinessHoursPeriods(value, periods.map((p, i) => i === index ? { ...p, ...patch } : p)));
 }
 return <fieldset className="admin-socials"><legend>Режим работы</legend>
  <label className="admin-check"><input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked ? newBusinessHours() : null)} />Указать режим работы</label>
  {value && <>
   <label className="admin-check"><input type="checkbox" checked={!!value.alwaysOpen} onChange={e => onChange(e.target.checked ? roundTheClockHours() : newBusinessHours())} />Круглосуточно (24/7, без выходных)</label>
   {!value.alwaysOpen && <>
    {periods.map((period, index) => <fieldset key={index} className="admin-socials"><legend>Группа дней {index + 1}</legend>
     <div className="admin-weekdays">{Array.from({ length: 7 }, (_, day) => <label key={day}><input type="checkbox" checked={period.days.includes(day)} disabled={periods.some((p, i) => i !== index && p.days.includes(day))} onChange={e => update(index, { days: e.target.checked ? [...period.days, day].sort() : period.days.filter(d => d !== day) })} />{weekdayName(day, 'ru')}</label>)}</div>
     <div className="admin-hours-row"><label>Открытие<input type="time" required value={period.opens} onChange={e => update(index, { opens: e.target.value })} /></label><label>Закрытие<input type="time" required={!period.untilLastClient} disabled={!!period.untilLastClient} value={period.closes} onChange={e => update(index, { closes: e.target.value })} /></label></div>
     <label className="admin-check"><input type="checkbox" checked={!!period.untilLastClient} onChange={e => update(index, { untilLastClient: e.target.checked })} />До последнего клиента</label>
     <label className="admin-check"><input type="checkbox" checked={!!(period.lunchStart || period.lunchEnd)} onChange={e => update(index, { lunchStart: e.target.checked ? '12:00' : '', lunchEnd: e.target.checked ? '13:00' : '' })} />Есть обеденный перерыв</label>
     {(period.lunchStart || period.lunchEnd) && <div className="admin-hours-row"><label>Начало обеда<input type="time" required value={period.lunchStart} onChange={e => update(index, { lunchStart: e.target.value })} /></label><label>Конец обеда<input type="time" required value={period.lunchEnd} onChange={e => update(index, { lunchEnd: e.target.value })} /></label></div>}
     {periods.length > 1 && <button type="button" onClick={() => onChange(withBusinessHoursPeriods(value, periods.filter((_, i) => i !== index)))}>Удалить группу {index + 1}</button>}
    </fieldset>)}
    <button type="button" disabled={periods.length >= 7 || new Set(periods.flatMap(p => p.days)).size === 7} onClick={() => {
     const day = Array.from({ length: 7 }, (_, i) => i).find(d => !periods.some(p => p.days.includes(d)));
     if (day !== undefined) onChange(withBusinessHoursPeriods(value, [...periods, { ...newBusinessHours(), days: [day] }]));
    }}>+ Добавить группу дней</button>
    <label className="admin-check"><input type="checkbox" checked={!!value.closedOnHolidays} onChange={e => onChange({ ...value, closedOnHolidays: e.target.checked })} />В праздничные дни — выходной</label>
    <p>Для разных часов добавьте группы дней. Каждый день можно выбрать только в одной группе. Неотмеченные дни — выходные. Чтобы перенести день, сначала снимите его в прежней группе. Закрытие раньше открытия означает следующий день. Время местное, корейское.</p>
   </>}
  </>}
 </fieldset>;
}