'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { copy, languages, type Language } from '@/app/design/content';

const flags: Record<Language, string> = { ru: 'ru', en: 'gb', ko: 'kr', zh: 'cn', tr: 'tr', vi: 'vn', km: 'kh', kk: 'kz' };
const closeLabels: Record<Language, string> = { ru: 'Закрыть', en: 'Close', ko: '닫기', zh: '关闭', tr: 'Kapat', vi: 'Đóng', km: 'បិទ', kk: 'Жабу' };

export default function QrLanguagePicker({ language, onChange }: { language: Language; onChange: (value: Language) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const selected = languages.find(item => item.code === language)!;
  return <>
    <button type="button" aria-haspopup="dialog" aria-controls="qr-language-dialog" aria-label={copy[language][10]} onClick={() => dialog.current?.showModal()} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800">
      <Image src={'/flags/' + flags[language] + '.svg'} alt="" width={24} height={16} />{selected.name}<span aria-hidden="true">⌄</span>
    </button>
    <dialog ref={dialog} id="qr-language-dialog" aria-labelledby="qr-language-title" className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-sm overflow-y-auto rounded-3xl border border-blue-100 bg-white p-5 text-zinc-900 shadow-2xl backdrop:bg-slate-950/40" onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close(); } }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="qr-language-title" className="text-lg font-semibold">{copy[language][10]}</h2>
        <button type="button" aria-label={closeLabels[language]} onClick={() => dialog.current?.close()} className="h-10 w-10 shrink-0 rounded-full bg-slate-100 text-xl">×</button>
      </div>
      <div className="grid gap-2">
        {languages.map(item => <button key={item.code} type="button" lang={item.code} aria-pressed={language === item.code} onClick={() => { onChange(item.code); dialog.current?.close(); }} className={'flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left ' + (language === item.code ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-slate-200 hover:bg-slate-50')}>
          <Image src={'/flags/' + flags[item.code] + '.svg'} alt="" width={24} height={16} /><span className="flex-1">{item.name}</span>{language === item.code && <span aria-hidden="true">✓</span>}
        </button>)}
      </div>
    </dialog>
  </>;
}