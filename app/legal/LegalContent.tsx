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
 <section id="google-analytics"><h2>Google Analytics</h2><p>{language === 'ru' ? 'Мы используем Google Analytics для статистики посещений и переходов между страницами. Google может использовать cookies и обрабатывать сведения об устройстве и посещениях. Мы удаляем параметры URL и идентификаторы личных чатов из отправляемых адресов. Рекламная персонализация отключена.' : language === 'ko' ? '방문 및 페이지 이동 통계를 위해 Google Analytics를 사용합니다. Google은 쿠키를 사용하고 기기 및 방문 정보를 처리할 수 있습니다. 전송되는 주소에서 URL 매개변수와 비공개 채팅 ID를 제거합니다. 광고 개인 최적화는 사용하지 않습니다.' : 'We use Google Analytics to measure visits and page navigation. Google may use cookies and process device and visit information. URL parameters and private chat identifiers are removed from reported addresses. Ad personalization is disabled.'}</p><p><a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">{language === 'ru' ? 'Как Google использует данные' : 'How Google uses data'}</a></p></section>
 <p><Link href="/contact">{t.contact}</Link></p></main>;
}
