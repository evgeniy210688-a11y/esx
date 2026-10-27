"use client";
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { languages, type Language } from './content';
const flags: Record<Language,string> = {ru:'ru',ko:'kr',en:'gb',zh:'cn',tr:'tr',vi:'vn',km:'kh',kk:'kz'};
export default function HeaderLanguage({language,choose,label}:{language:Language;choose:(value:Language)=>void;label:string}) {
 const root=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{const close=(e:PointerEvent)=>{if(e.target instanceof Node && root.current && !root.current.contains(e.target))root.current.open=false;};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 return <details ref={root} className="header-language" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();e.currentTarget.open=false;e.currentTarget.querySelector('summary')?.focus();}}}>
 <summary aria-label={label+': '+languages.find(l=>l.code===language)?.name}><Image src={'/flags/'+flags[language]+'.svg'} alt="" width={24} height={16} unoptimized/><span>{languages.find(l=>l.code===language)?.name}</span><span aria-hidden="true">▾</span></summary>
 <ul aria-label={label}>{languages.map(l=><li key={l.code}><button type="button" lang={l.code} aria-pressed={language===l.code} onClick={()=>{choose(l.code);if(root.current){root.current.open=false;root.current.querySelector('summary')?.focus();}}}><Image src={'/flags/'+flags[l.code]+'.svg'} alt="" width={24} height={16} unoptimized/>{l.name}</button></li>)}</ul>
 </details>;
}
