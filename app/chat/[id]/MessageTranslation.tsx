"use client";

import { useEffect, useRef, useState } from 'react';
import { type Language } from '@/app/design/content';
import { supabase } from '@/lib/supabase';

const labels: Record<Language, [string, string, string]> = {
  ru: ['Перевод', 'Пишет…', 'Перевод недоступен. Повторить'],
  en: ['Translation', 'Typing…', 'Translation unavailable. Retry'],
  ko: ['번역', '입력 중…', '번역할 수 없습니다. 다시 시도'],
  zh: ['翻译', '正在输入…', '翻译不可用。重试'],
  tr: ['Çeviri', 'Yazıyor…', 'Çeviri kullanılamıyor. Tekrar dene'],
  vi: ['Bản dịch', 'Đang nhập…', 'Không thể dịch. Thử lại'],
  km: ['ការបកប្រែ', 'កំពុងវាយ…', 'មិនអាចបកប្រែបាន។ ព្យាយាមម្តងទៀត'],
  kk: ['Аударма', 'Жазып жатыр…', 'Аударма қолжетімсіз. Қайталау'],
};

export default function MessageTranslation({ chatId, messageId, target, language, privateChat = false }: {
  chatId: string; messageId: number | string; target: Language; language: Language; privateChat?: boolean;
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
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (privateChat) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('Sign in required');
          headers.Authorization = `Bearer ${session.access_token}`;
        }
        const result = await fetch('/api/translate', { method: 'POST', headers,
          body: JSON.stringify({ chatId, messageId, target, ...(privateChat ? { privateChat: true } : {}) }), signal: controller.signal });
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
  }, [chatId, messageId, target, attempt, privateChat]);
  const t = labels[language];
  return <div ref={ref} className="message-translation" aria-live="polite">
    {translation ? <div lang={target} dir="auto">{translation}</div>
      : failed ? <button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>{t[2]}</button> : <small>{t[1]}</small>}
  </div>;
}
