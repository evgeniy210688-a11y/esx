import { alwaysOpenLabels, businessHoursPeriods, closedHoursLabels, hoursLabels, validBusinessHours, weekdayName, type BusinessHours } from '@/lib/service-hours';

export default function BusinessHoursDisplay({ hours, language }: { hours: BusinessHours; language: string }) {
 if (!validBusinessHours(hours)) return null;
 const labels = hoursLabels[language] ?? hoursLabels.en;
 const closed = closedHoursLabels[language] ?? closedHoursLabels.en;
 const periods = businessHoursPeriods(hours);
 const daysOff = Array.from({ length: 7 }, (_, day) => day).filter(day => !periods.some(p => p.days.includes(day)));
 return <section className="services-card-section services-hours"><h3>{labels[0]}</h3>
  {hours.alwaysOpen ? <p>{alwaysOpenLabels[language] ?? alwaysOpenLabels.en}</p> : <>
   {periods.map((period, index) => <div key={index}>
    <p>{period.days.map(day => weekdayName(day, language)).join(', ')}: {period.opens} – {period.closes}{period.closes < period.opens && ' (' + labels[4] + ')'}</p>
    <p>{period.lunchStart ? labels[2] + ': ' + period.lunchStart + ' – ' + period.lunchEnd : labels[3]}</p>
   </div>)}
   {daysOff.length > 0 && <p>{closed[0]}: {daysOff.map(day => weekdayName(day, language)).join(', ')}</p>}
   {hours.closedOnHolidays && <p>{closed[1]}</p>}
  </>}
 </section>;
}