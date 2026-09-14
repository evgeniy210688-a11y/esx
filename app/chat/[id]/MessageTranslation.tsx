"use client";

import { useEffect, useRef, useState } from 'react';
import { languages, type Language } from '@/app/design/content';

const labels: Record<Language, [string, string, string]> = {
  ru: ['Перевод', 'Переводим…', 'Перевод недоступен. Повторить'],
  en: ['Translation', 'Translating…', 'Translation unavailable. Retry'],
  ko: ['번역', '번역 중…', '번역할 수 없습니다. 다시 시도'],
  zh: ['翻译', '翻译中…', '翻译不可用。重试'],
  tr: ['Çeviri', 'Çevriliyor…', 'Çeviri kullanılamıyor. Tekrar dene'],
  vi: ['Bản dịch', 'Đang dịch…', 'Không thể dịch. Thử lại'],
  km: ['ការបកប្រែ', 'កំពុងបកប្រែ…', 'មិនអាចបកប្រែបាន។ ព្យាយាមម្តងទៀត'],
  kk: ['Аударма', 'Аударылуда…', 'Аударма қолжетімсіз. Қайталау'],
};

export default function MessageTranslation({ chatId, messageId, target, language }: {
  chatId: string; messageId: number | string; target: Language; language: Language;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [translation, setTranslation] = useState('');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;
    async function translate() {
      try {
        const result = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, messageId, target }), signal: controller.signal });
        const data = await result.json();
        if (!result.ok || typeof data.translation !== 'string') throw new Error('Unavailable');
        if (!stopped) setTranslation(data.translation);
      } catch { if (!stopped) setFailed(true); }
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); void translate(); }
    });
    if (ref.current) observer.observe(ref.current);
    return () => { stopped = true; observer.disconnect(); controller.abort(); };
  }, [chatId, messageId, target, attempt]);
  const t = labels[language];
  return <div ref={ref} className="message-translation" aria-live="polite">
    {translation ? <><small>{t[0]} · {languages.find(item => item.code === target)?.name}</small><div lang={target} dir="auto">{translation}</div></>
      : failed ? <button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>{t[2]}</button> : <small>{t[1]}</small>}
  </div>;
}
