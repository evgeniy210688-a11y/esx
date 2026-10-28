import LegalContent, { type LegalLanguage } from './LegalContent';
import copy from './legalCopy.json';
export const metadata = { title: 'ESX — Rules & data / Правила и данные' };
export default async function LegalPage({searchParams}:{searchParams:Promise<{lang?:string}>}) {
 const {lang}=await searchParams;
 const valid=typeof lang==='string'&&Object.hasOwn(copy,lang);
 return <LegalContent initialLanguage={valid?lang as LegalLanguage:'ru'} explicitLanguage={valid}/>;
}
