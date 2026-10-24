'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { interfaceLanguages, type InterfaceLanguage } from '../serviceLabels';
import { uzbekLatin } from '@/lib/uzbek-latin';
import { profileLabel } from './profileCopy';
const Context = createContext<{language:InterfaceLanguage;chooseLanguage:(value:InterfaceLanguage) => void;t:(text:string) => string}>({language:'ru',chooseLanguage:() => {},t:text => text});
export const useProfileLanguage = () => useContext(Context);
const cache = new Map<string,Record<string,string>>();
export default function ProfileLanguage({sourceKey,children}:{sourceKey:string;children:ReactNode}) {
  const [language,setLanguage] = useState<InterfaceLanguage>('ru');
  const [result,setResult] = useState<{key:string;map:Record<string,string>}>({key:'',map:{}});
  const [failure,setFailure] = useState('');
  const [retry,setRetry] = useState(0);
  const key = language + sourceKey;
  const loading = language !== 'ru' && result.key !== key && failure !== key;
  useEffect(() => {
    try { const saved = localStorage.getItem('esx-services-language'); if (interfaceLanguages.some(item => item.code === saved)) queueMicrotask(() => setLanguage(saved as InterfaceLanguage)); } catch { /* Storage is optional. */ }
  }, []);
  useEffect(() => {
    if (language === 'ru') return;
    const controller = new AbortController();
    async function load() {
      try {
        let map = cache.get(key);
        if (!map) {
          map = Object.create(null) as Record<string,string>;
          let total = 1; let revision = '';
          for (let batch=0;batch<total;batch++) {
            const response = await fetch('/api/services/profile-translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target:language,batch}),signal:controller.signal});
            if (!response.ok) throw new Error('translation');
            const data = await response.json();
            if (!Array.isArray(data.source) || !Array.isArray(data.texts) || data.source.length !== data.texts.length || !Number.isInteger(data.total) || data.total < 1 || data.total > 201 || typeof data.revision !== 'string') throw new Error('format');
            if (batch > 0 && revision !== data.revision) throw new Error('changed');
            revision = data.revision; total = data.total;
            data.source.forEach((source: string,index:number) => { if (typeof source !== 'string' || typeof data.texts[index] !== 'string') throw new Error('format'); map![source] = language === 'uz' ? uzbekLatin(data.texts[index]) : data.texts[index]; });
          }
          if (cache.size >= 14) cache.delete(cache.keys().next().value!);
          cache.set(key,map);
        }
        if (!controller.signal.aborted) { setResult({key,map}); setFailure(''); }
      } catch { if (!controller.signal.aborted) setFailure(key); }
    }
    void load(); return () => controller.abort();
  }, [key,language,retry]);
  function chooseLanguage(value: InterfaceLanguage) { setLanguage(value); try { localStorage.setItem('esx-services-language',value); } catch { /* Storage is optional. */ } }
  const t = (text:string) => { const label = profileLabel(language,text); return label !== text ? label : language !== 'ru' && result.key === key ? result.map[text] ?? text : text; };
  return <Context.Provider value={{language,chooseLanguage,t}}><div lang={language}>
    {children}
    {language !== 'ru' && (loading || failure === key) && <div className="profile-translation-status" role="status">{t(loading ? 'Переводим страницу…' : 'Перевод недоступен. Показан исходный текст.')}{!loading && <button type="button" onClick={() => { setFailure(''); setRetry(value => value+1); }}>{t('Повторить')}</button>}</div>}
  </div></Context.Provider>;
}
