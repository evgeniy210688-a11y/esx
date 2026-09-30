"use client";
import Image from 'next/image';
import { useId, useRef } from 'react';
import { languages, type Language } from '@/app/design/content';
import './language-picker.css';
const flags: Record<Language, string> = { ru: 'ru', en: 'gb', ko: 'kr', zh: 'cn', tr: 'tr', vi: 'vn', km: 'kh', kk: 'kz' };
export default function LanguagePicker({ value, label, onChange }: { value: Language; label: string; onChange: (value: Language) => void }) {
  const id = useId();
  const root = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  const selected = languages.find(item => item.code === value)!;
  return <div className="private-language"><span id={id}>{label}</span><details ref={root} onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); if (root.current) root.current.open = false; summary.current?.focus(); } }}>
    <summary ref={summary} aria-labelledby={`${id} ${id}-selected`}><Image src={`/flags/${flags[value]}.svg`} alt="" width={24} height={16} /><span id={`${id}-selected`} lang={value}>{selected.name}</span><span aria-hidden="true">⌄</span></summary>
    <ul aria-labelledby={id}>{languages.map(item => <li key={item.code}><button type="button" aria-pressed={value === item.code} onClick={() => { onChange(item.code); if (root.current) root.current.open = false; summary.current?.focus(); }}><Image src={`/flags/${flags[item.code]}.svg`} alt="" width={24} height={16} /><span lang={item.code}>{item.name}</span>{value === item.code && <span aria-hidden="true">✓</span>}</button></li>)}</ul>
  </details></div>;
}
