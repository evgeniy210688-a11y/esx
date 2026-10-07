'use client';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import type { Language } from '@/app/design/content';
import { foxStickers, stickerMessage, stickerSource, type FoxSticker } from '@/lib/fox-stickers';
import './fox-stickers.css';
import { foxStickerLabels as labels, suggestFoxStickers } from '@/lib/fox-sticker-labels';


export function FoxStickerImage({ id, language }: { id: FoxSticker; language: Language }) {
  return <Image className="fox-sticker-image" src={stickerSource(id)} alt={labels[language][foxStickers.indexOf(id) + 2]} width={160} height={160} unoptimized />;
}
export default function FoxStickerPicker({ language, disabled, onSend, draft = '', onSendSuggestion, onSendText }: { language: Language; disabled?: boolean; onSend: (message: string) => Promise<boolean>; draft?: string; onSendSuggestion?: (message: string) => Promise<boolean>; onSendText?: () => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const t = labels[language];
  const suggestions = suggestFoxStickers(draft);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (e.target instanceof Node && !root.current?.contains(e.target)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  async function send(id: FoxSticker, suggested = false) {
    if (lock.current || disabled) return;
    lock.current = true; setBusy(true);
    try { if (await (suggested && onSendSuggestion ? onSendSuggestion : onSend)(stickerMessage(id))) { setOpen(false); toggle.current?.focus(); } }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="fox-sticker-picker" ref={root}>
    <button className="fox-sticker-toggle" ref={toggle} type="button" aria-label={t[0]} title={t[0]} aria-expanded={open} aria-controls={panelId} disabled={disabled || busy} onClick={() => setOpen(!open)}><Image src={stickerSource('hello')} alt="" width={36} height={36} unoptimized /></button>
    {!open && suggestions.length > 0 && <div className="fox-sticker-panel fox-sticker-suggestions" role="group" aria-label={t[0]}>
      <small>{t[1]}</small>
      <div className="fox-sticker-grid">{suggestions.map(id => <button type="button" key={id} disabled={disabled || busy} onClick={() => void send(id, true)} aria-label={`${t[0]}: ${t[foxStickers.indexOf(id) + 2]}`}><Image src={stickerSource(id)} alt="" width={80} height={80} unoptimized /><span>{t[foxStickers.indexOf(id) + 2]}</span></button>)}</div>
      {onSendText && <button className="fox-sticker-word" type="button" disabled={disabled || busy} onClick={async () => {
        if (lock.current || disabled) return;
        lock.current = true; setBusy(true);
        try { await onSendText(); } finally { lock.current = false; setBusy(false); }
      }}>“{draft.trim()}” →</button>}
    </div>}
    {open && <div id={panelId} className="fox-sticker-panel" role="group" aria-label={t[0]}><strong>{t[0]}</strong><small>{t[1]}</small><div className="fox-sticker-grid">{foxStickers.map((id, index) => <button type="button" key={id} disabled={disabled || busy} onClick={() => void send(id)} aria-label={t[index + 2]}><Image src={stickerSource(id)} alt="" width={80} height={80} unoptimized /><span>{t[index + 2]}</span></button>)}</div></div>}
  </div>;
}
