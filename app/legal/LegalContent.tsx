"use client";
import BackButton from '@/app/components/BackButton';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import copy from './legalCopy.json';
import './legal.css';
export type LegalLanguage=keyof typeof copy;
const languages: {code:LegalLanguage;name:string;flag:string}[]=[{code:'ru',name:'Русский',flag:'ru'},{code:'en',name:'English',flag:'gb'},{code:'ko',name:'한국어',flag:'kr'},{code:'uz',name:'O‘zbekcha',flag:'uz'},{code:'zh',name:'中文',flag:'cn'},{code:'vi',name:'Tiếng Việt',flag:'vn'},{code:'tr',name:'Türkçe',flag:'tr'},{code:'kk',name:'Қазақша',flag:'kz'},{code:'km',name:'ខ្មែរ',flag:'kh'}];
const labels:Record<LegalLanguage,string>={ru:'Язык',en:'Language',ko:'언어',uz:'Til',zh:'语言',vi:'Ngôn ngữ',tr:'Dil',kk:'Тіл',km:'ភាសា'};
export default function LegalContent({initialLanguage,explicitLanguage}:{initialLanguage:LegalLanguage;explicitLanguage:boolean}) {
 const [language,setLanguage]=useState(initialLanguage);
 useEffect(()=>{if(explicitLanguage)return;try{const saved=localStorage.getItem('esx-legal-language')||localStorage.getItem('esx-language')||localStorage.getItem('esx-services-language');if(saved&&Object.hasOwn(copy,saved))setLanguage(saved as LegalLanguage);}catch{}},[explicitLanguage]);
 const t=copy[language];
 function choose(value:LegalLanguage){setLanguage(value);try{localStorage.setItem('esx-legal-language',value);}catch{}const url=new URL(window.location.href);url.searchParams.set('lang',value);window.history.replaceState(null,'',url);}
 return <main lang={language} className="legal-page">
 <header className="legal-header"><Link href="/" aria-label="ESX"><Image src="/esx-wordmark-color.png" alt="ESX" width={110} height={38} unoptimized/></Link>
 <label className="legal-language"><span>{labels[language]}</span><span className="legal-language-control"><Image src={'/flags/'+languages.find(l=>l.code===language)!.flag+'.svg'} alt="" width={24} height={16} unoptimized/><select value={language} onChange={e=>choose(e.target.value as LegalLanguage)}>{languages.map(l=><option key={l.code} value={l.code} lang={l.code}>{l.name}</option>)}</select></span></label></header>
 <nav className="legal-nav">{['/','/services','/contact'].map((href,i)=><Link key={href} href={href}>{t.nav[i]}</Link>)}</nav>
 <BackButton language={language} /><h1>{t.title}</h1><p>{t.intro}</p>
 {t.sections.map(section=><section key={section.id} id={section.id}><h2>{section.title}</h2>{section.list?<ul>{section.paragraphs.map((p,i)=><li key={i}>{p}</li>)}</ul>:section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</section>)}
 <p><Link href="/contact">{t.contact}</Link></p></main>;
}
