const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const c={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/service-hours.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,c);
const {validBusinessHours:v,newBusinessHours:n}=c.exports;
test('optional hours and normal workday',()=>{assert.equal(v(null),true);assert.equal(v(n()),true);assert.equal(v({...n(),lunchStart:'12:00',lunchEnd:'13:00'}),true)});
test('reject empty days, invalid times and incomplete lunch',()=>{for(const h of [{...n(),days:[]},{...n(),days:[7]},{...n(),opens:'25:00'},{...n(),closes:'09:00'},{...n(),lunchStart:'12:00'},{...n(),lunchStart:'17:00',lunchEnd:'19:00'}])assert.equal(v(h),false)});
test('overnight work includes lunch after midnight',()=>{assert.equal(v({...n(),opens:'20:00',closes:'06:00',lunchStart:'01:00',lunchEnd:'02:00'}),true);assert.equal(v({...n(),opens:'20:00',closes:'06:00',lunchStart:'10:00',lunchEnd:'11:00'}),false)});
test('24/7 survives save and reload and requires all days without lunch',()=>{
 const h=c.exports.roundTheClockHours();assert.equal(v(JSON.parse(JSON.stringify(h))),true);
 assert.equal(v({...h,days:[0]}),false);assert.equal(v({...h,lunchStart:'12:00',lunchEnd:'13:00'}),false);
 assert.equal(v({...h,alwaysOpen:false}),false);
});
