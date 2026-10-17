'use client';
import { useId, useRef, useState } from 'react';
import Image from 'next/image';

export default function ServiceFilterPicker({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string; flag?: string }[]; onChange: (value: string) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value) ?? options[0];
  const close = () => { setOpen(false); root.current?.querySelector<HTMLButtonElement>('.services-city-trigger')?.focus(); };
  return <div className="services-city-picker" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (open && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    }
  }}>
    <span id={id + '-label'}>{label}</span>
    <button type="button" className="services-city-trigger" aria-labelledby={id + '-label ' + id + '-value'} aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <span id={id + '-value'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{selected?.flag && <Image src={selected.flag} alt="" width={24} height={16} style={{ flexShrink: 0 }} />}{selected?.label}</span><span aria-hidden="true">⌄</span>
    </button>
    {open && <><div className="services-city-dismiss" onPointerDown={() => setOpen(false)} aria-hidden="true" /><div className="services-city-menu" id={id} role="menu" aria-labelledby={id + '-label'}>
      {options.map(option => <button key={option.value} type="button" role="menuitemradio" aria-checked={value === option.value} onClick={() => { onChange(option.value); close(); }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{option.flag && <Image src={option.flag} alt="" width={24} height={16} style={{ flexShrink: 0 }} />}{option.label}</span>{value === option.value && <span aria-hidden="true">✓</span>}</button>)}
    </div></>}
  </div>;
}
