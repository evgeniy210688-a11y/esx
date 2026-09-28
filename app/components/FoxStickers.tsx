'use client';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import type { Language } from '@/app/design/content';
import { foxStickers, stickerMessage, stickerSource, type FoxSticker } from '@/lib/fox-stickers';
import './fox-stickers.css';

const labels: Record<Language, string[]> = {
  ru: ['Смайлики с лисёнком', 'Нажмите, чтобы отправить', 'Привет', 'Сердечко', 'Сплю', 'Скучаю', 'Устал'],
  en: ['Fox stickers', 'Tap to send', 'Hello', 'Love', 'Sleeping', 'Miss you', 'Tired'],
  ko: ['여우 스티커', '눌러서 보내기', '안녕', '사랑', '자는 중', '보고 싶어', '피곤해'],
  zh: ['狐狸贴纸', '点击发送', '你好', '爱心', '睡觉', '想你了', '累了'],
  tr: ['Tilki çıkartmaları', 'Göndermek için dokun', 'Merhaba', 'Sevgi', 'Uyuyorum', 'Özledim', 'Yorgunum'],
  vi: ['Nhãn dán cáo', 'Nhấn để gửi', 'Xin chào', 'Yêu thương', 'Đang ngủ', 'Nhớ bạn', 'Mệt'],
  km: ['ស្ទីគ័រកញ្ជ្រោង', 'ចុចដើម្បីផ្ញើ', 'សួស្តី', 'ស្រឡាញ់', 'កំពុងគេង', 'នឹកអ្នក', 'ហត់'],
  kk: ['Түлкі стикерлері', 'Жіберу үшін басыңыз', 'Сәлем', 'Махаббат', 'Ұйықтап жатырмын', 'Сағындым', 'Шаршадым'],
};
export function FoxStickerImage({ id, language }: { id: FoxSticker; language: Language }) {
  return <Image className="fox-sticker-image" src={stickerSource(id)} alt={labels[language][foxStickers.indexOf(id) + 2]} width={160} height={160} unoptimized />;
}
export default function FoxStickerPicker({ language, disabled, onSend }: { language: Language; disabled?: boolean; onSend: (message: string) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const t = labels[language];
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (e.target instanceof Node && !root.current?.contains(e.target)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  async function send(id: FoxSticker) {
    if (lock.current || disabled) return;
    lock.current = true; setBusy(true);
    try { if (await onSend(stickerMessage(id))) { setOpen(false); toggle.current?.focus(); } }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="fox-sticker-picker" ref={root}>
    <button className="fox-sticker-toggle" ref={toggle} type="button" aria-label={t[0]} title={t[0]} aria-expanded={open} aria-controls={panelId} disabled={disabled || busy} onClick={() => setOpen(!open)}><Image src={stickerSource('hello')} alt="" width={36} height={36} unoptimized /></button>
    {open && <div id={panelId} className="fox-sticker-panel" role="group" aria-label={t[0]}><strong>{t[0]}</strong><small>{t[1]}</small><div className="fox-sticker-grid">{foxStickers.map((id, index) => <button type="button" key={id} disabled={disabled || busy} onClick={() => void send(id)} aria-label={t[index + 2]}><Image src={stickerSource(id)} alt="" width={80} height={80} unoptimized /><span>{t[index + 2]}</span></button>)}</div></div>}
  </div>;
}
