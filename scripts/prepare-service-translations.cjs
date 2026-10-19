const fs=require('fs');
const path=require('path');
require('@next/env').loadEnvConfig(process.cwd()); const env=process.env;
(async()=>{
const url=env.NEXT_PUBLIC_SUPABASE_URL+'/rest/v1/esx_service_listings?select=id,description,city,category&status=eq.published&order=id';
const res=await fetch(url,{headers:{apikey:env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}});if(!res.ok)throw Error('Listings HTTP '+res.status);
const listings=await res.json();console.log('Published listings: '+listings.length);
const dest='lib/service-translations.generated.json';
let catalog=fs.existsSync(dest)?JSON.parse(fs.readFileSync(dest,'utf8')):{};
const jobs=[];for(const s of listings)for(const target of ['ru','en','ko','uz','zh','vi','tr']){const key=JSON.stringify([target,s.id,s.description,s.city,s.category]);if(!catalog[key])jobs.push({key,id:s.id,target});}
let nextStart=0,done=0,failures=0;
async function worker(){while(jobs.length){const job=jobs.shift();let success=false;for(let attempt=0;attempt<4&&!success;attempt++){
const now=Date.now(),start=Math.max(now,nextStart);nextStart=start+1400;await new Promise(r=>setTimeout(r,start-now));
try{const response=await fetch((env.SERVICE_TRANSLATION_ORIGIN || 'https://www.88esx.com') + '/api/services/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:job.id,target:job.target}),signal:AbortSignal.timeout(40000)});
if(!response.ok)throw Error('HTTP '+response.status);const value=await response.json();if(!['description','city','category'].every(k=>typeof value[k]==='string'))throw Error('format');catalog[job.key]=value;fs.writeFileSync(dest,JSON.stringify(catalog));success=true;done++;if(done%20===0)console.log('Translations ready: '+done+'; remaining: '+jobs.length);
}catch(e){if(attempt===3){failures++;console.log('Failed '+job.id+' '+job.target+' '+e.message);}else await new Promise(r=>setTimeout(r,16000));}}
}}
await Promise.all(Array.from({length:8},worker));console.log('Complete: '+Object.keys(catalog).length+' translations, '+failures+' failures.');if(failures)process.exitCode=1;
})();

