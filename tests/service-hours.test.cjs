const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const c={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/service-hours.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,c);
const {validBusinessHours:v,newBusinessHours:n}=c.exports;
test('optional hours and normal workday',()=>{assert.equal(v(null),true);assert.equal(v(n()),true);assert.equal(v({...n(),lunchStart:'12:00',lunchEnd:'13:00'}),true)});
test('reject empty days, invalid times and incomplete lunch',()=>{for(const h of [{...n(),days:[]},{...n(),days:[7]},{...n(),opens:'25:00'},{...n(),closes:'09:00'},{...n(),lunchStart:'12:00'},{...n(),lunchStart:'17:00',lunchEnd:'19:00'}])assert.equal(v(h),false)});
test('overnight work includes lunch after midnight',()=>{assert.equal(v({...n(),opens:'20:00',closes:'06:00',lunchStart:'01:00',lunchEnd:'02:00'}),true);assert.equal(v({...n(),opens:'20:00',closes:'06:00',lunchStart:'10:00',lunchEnd:'11:00'}),false)});
test('24/7 survives save and reload and requires all days without lunch',()=>{
 const h=c.exports.roundTheClockHours();assert.equal(v(JSON.parse(JSON.stringify(h))),true);
 assert.equal(v({...h,days:[0]}),false);assert.equal(v({...h,lunchStart:'12:00',lunchEnd:'13:00'}),false);
 assert.equal(v({...h,alwaysOpen:false}),false);
});

test('different weekday schedules survive JSON storage with holiday closure',()=>{
 const h=c.exports.withBusinessHoursPeriods({...n(),closedOnHolidays:true},[
  {...n(),days:[0,1,2,4],opens:'10:00',closes:'19:00'},
  {...n(),days:[3],opens:'14:00',closes:'21:00'},
  {...n(),days:[5],opens:'10:00',closes:'16:00'},
 ]);
 const saved=JSON.parse(JSON.stringify(h));
 assert.equal(v(saved),true);
 assert.equal(saved.closedOnHolidays,true);
 assert.deepEqual(saved.days,[0,1,2,3,4,5]);
 assert.equal(c.exports.businessHoursPeriods(saved)[1].opens,'14:00');
 assert.equal(c.exports.businessHoursPeriods(saved)[2].closes,'16:00');
});
test('groups reject repeated days, empty schedules and invalid lunch',()=>{
 for(const periods of [
  [], [{...n(),days:[]}], [{...n(),days:[0]},{...n(),days:[0]}],
  [{...n(),days:[3],opens:'14:00',closes:'21:00',lunchStart:'12:00',lunchEnd:'13:00'}],
  [null],
 ])assert.equal(v({...n(),periods}),false);
 assert.equal(v({...c.exports.roundTheClockHours(),closedOnHolidays:true}),false);
 assert.equal(v({...c.exports.roundTheClockHours(),periods:[n()]}),false);
});
test('legacy schedule is exposed as one group and retains overnight lunch',()=>{
 const h={...n(),opens:'20:00',closes:'06:00',lunchStart:'01:00',lunchEnd:'02:00'};
 const periods=c.exports.businessHoursPeriods(h);
 assert.equal(periods.length,1);
 assert.equal(periods[0].opens,'20:00');
 assert.equal(v(c.exports.withBusinessHoursPeriods(h,periods)),true);
 assert.equal(v({...n(),closedOnHolidays:true}),true);
});