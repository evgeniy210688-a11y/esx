"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { backgroundColors, type ChatBackground } from './useChatBackground';
import { type Language } from '@/app/design/content';

import './ChatMenu.css';

const labels: Record<Language, string> = { ru: 'Настройки', ko: '설정', en: 'Settings', zh: '设置', tr: 'Ayarlar', vi: 'Cài đặt', km: 'ការកំណត់', kk: 'Параметрлер' };
const colorLabels: Record<Language, [string, string, string, string, string]> = {
  ru: ['Цвет фона', 'Голубой', 'Светло-розовый', 'Серый', 'Чёрный'],
  ko: ['배경색', '하늘색', '연분홍색', '회색', '검은색'],
  en: ['Background color', 'Light blue', 'Light pink', 'Gray', 'Black'],
  zh: ['背景颜色', '浅蓝色', '浅粉色', '灰色', '黑色'],
  tr: ['Arka plan rengi', 'Açık mavi', 'Açık pembe', 'Gri', 'Siyah'],
  vi: ['Màu nền', 'Xanh nhạt', 'Hồng nhạt', 'Xám', 'Đen'],
  km: ['ពណ៌ផ្ទៃខាងក្រោយ', 'ខៀវស្រាល', 'ផ្កាឈូកស្រាល', 'ប្រផេះ', 'ខ្មៅ'],
  kk: ['Фон түсі', 'Көгілдір', 'Ашық қызғылт', 'Сұр', 'Қара'],
};

export default function ChatMenu({ language, background, onBackgroundChange }: { language: Language; background: ChatBackground | null; onBackgroundChange: (value: ChatBackground) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); button.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return <div ref={root} className="chat-header-menu">
    <button ref={button} className="chat-header-menu-toggle" type="button" aria-label={labels[language]} title={labels[language]} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94L14.7 6.3z" /></svg>
    </button>
    {open && <div id={id} role="region" aria-label={labels[language]} className="chat-header-menu-panel">
      <fieldset className="chat-background-options">
        <legend>{colorLabels[language][0]}</legend>
        {backgroundColors.map((color, index) => <label key={color}>
          <input type="radio" name={`${id}-background`} value={color} checked={background === color} onChange={() => onBackgroundChange(color)} />
          <span className={`chat-background-swatch chat-background-${color}`} aria-hidden="true" />
          <span>{colorLabels[language][index + 1]}</span>
        </label>)}
      </fieldset>

    </div>}
  </div>;
}
