"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAccount from '@/app/account/useAccount';
import { accountLabels } from '@/app/account/accountLabels';
import type { Language } from '@/app/design/content';
import { supabase } from '@/lib/supabase';
import './conversation-sidebar.css';

type Entry = { id: string; name: string; phone?: string };
type Picker = { select: (fields: string[], options: { multiple: boolean }) => Promise<{ name?: string[]; tel?: string[] }[]> };
const uuid = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
function readRooms(key: string): Entry[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((item): item is Entry => Boolean(item && uuid.test(item.id) && typeof item.name === 'string' && (item.phone === undefined || typeof item.phone === 'string'))).slice(0, 100) : [];
  } catch { return []; }
}

export default function ConversationSidebar({ chatId, language, temporary = false }: { chatId: string; language: Language; temporary?: boolean }) {
  const { user, ready } = useAccount();
  const router = useRouter();
  const [rooms, setRooms] = useState<Entry[]>([]);
  const [chats, setChats] = useState<Entry[]>([]);
  const [error, setError] = useState(false);
  const [manual, setManual] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  const t = accountLabels[language];
  const ru = language === 'ru';
  const key = `esx-recent-rooms:${user?.id ?? 'guest'}`;
  const title = ru ? 'Собеседники' : 'Conversations';
  const newLabel = ru ? 'Новый чат' : 'New chat';

  useEffect(() => {
    if (!ready) return;
    let active = true;
    const recent = readRooms(key);
    if (temporary && uuid.test(chatId) && !recent.some(room => room.id === chatId)) {
      recent.unshift({ id: chatId, name: `${t.conversation} ${chatId.slice(0, 8)}` });
      try { localStorage.setItem(key, JSON.stringify(recent.slice(0, 100))); } catch { /* A chat still works without storage. */ }
    }
    const refresh = async () => {
      if (document.hidden) return;
      setRooms(readRooms(key));
      if (!user) { setChats([]); return; }
      try {
        const result = await supabase.from('esx_conversations').select('id,participant_a,participant_b').order('created_at', { ascending: false });
        if (result.error) throw result.error;
        const entries = await Promise.all((result.data ?? []).map(async chat => {
          const other = chat.participant_a === user.id ? chat.participant_b : chat.participant_a;
          const participants = await supabase.rpc('esx_chat_participants', { conversation_id: chat.id });
          if (participants.error) throw participants.error;
          const person = participants.data?.find((item: { user_id: string; username: string | null }) => item.user_id === other);
          return { id: chat.id, name: person?.username || `${t.contact} ${other.slice(0, 8)}` };
        }));
        if (active) { setChats(entries); setError(false); }
      } catch { if (active) setError(true); }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    const focus = () => void refresh();
    window.addEventListener('focus', focus);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [chatId, key, ready, user, temporary, t, retry]);

  function start(contactName = '', contactPhone = '') {
    const id = crypto.randomUUID();
    const entry = { id, name: contactName.trim() || `${t.conversation} ${id.slice(0, 8)}`, phone: contactPhone.replace(/[^+\d]/g, '') };
    try { localStorage.setItem(key, JSON.stringify([entry, ...readRooms(key)].slice(0, 100))); }
    catch { setNotice(ru ? 'История списка недоступна в этом браузере.' : 'This browser cannot save the conversation list.'); }
    router.push(`/chat/${id}`);
    setManual(false);
  }
  async function pick() {
    const contacts = (navigator as Navigator & { contacts?: Picker }).contacts;
    if (!contacts) { setManual(true); setNotice(ru ? 'Браузер не поддерживает телефонную книгу. Введите контакт или поделитесь ссылкой.' : 'Contact access is unavailable. Enter a contact or share a link.'); return; }
    setBusy(true); setNotice('');
    try {
      const [contact] = await contacts.select(['name', 'tel'], { multiple: false });
      if (contact) { setName(contact.name?.[0] ?? ''); setPhone(contact.tel?.[0] ?? ''); setManual(true); }
    } catch (cause) {
      if ((cause as { name?: string }).name !== 'AbortError') { setManual(true); setNotice(ru ? 'Не удалось открыть контакты. Можно ввести номер вручную.' : 'Could not open contacts. Enter a number manually.'); }
    } finally { setBusy(false); }
  }
  const current = rooms.find(room => room.id === chatId);
  const invite = typeof window !== 'undefined' && temporary ? `${window.location.origin}/chat/${chatId}` : '';
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: 'ESX', url: invite });
      else { await navigator.clipboard.writeText(invite); setNotice(t.linkCopied); }
    } catch (cause) { if ((cause as { name?: string }).name !== 'AbortError') setNotice(t.copyError); }
  }
  return <aside className="conversation-sidebar" aria-label={title}>
    <details className="conversation-panel" open><summary>{title}</summary><div className="conversation-panel-body">
      <button type="button" disabled={!ready} onClick={() => start()}>＋ {newLabel}</button>
      <button type="button" disabled={busy || !ready} onClick={() => void pick()}>{ru ? 'Добавить из контактов телефона' : 'Add from phone contacts'}</button>
      {manual && <form onSubmit={event => { event.preventDefault(); start(name, phone); }}>
        <label>{ru ? 'Имя' : 'Name'}<input value={name} maxLength={80} onChange={event => setName(event.target.value)} required /></label>
        <label>{ru ? 'Телефон' : 'Phone'}<input type="tel" value={phone} maxLength={32} onChange={event => setPhone(event.target.value)} /></label>
        <button type="submit">{newLabel}</button><button type="button" onClick={() => setManual(false)}>{ru ? 'Отмена' : 'Cancel'}</button>
      </form>}
      {temporary && <div className="conversation-invite"><button type="button" onClick={() => void share()}>{ru ? 'Пригласить по ссылке' : 'Share invitation'}</button>
        {current?.phone && <a href={`sms:${current.phone}?body=${encodeURIComponent(invite)}`}>{ru ? 'Пригласить по SMS' : 'Invite by SMS'}</a>}
        <small>{ru ? 'Отправьте ссылку собеседнику, чтобы он присоединился.' : 'Send the link so your contact can join.'}</small>
      </div>}
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{t.loadError} <button type="button" onClick={() => setRetry(value => value + 1)}>{t.retry}</button></p>}
      <ul>{chats.map(chat => <li key={chat.id}><Link href={`/messages/${chat.id}`} aria-current={!temporary && chat.id === chatId ? 'page' : undefined}>{chat.name}</Link></li>)}</ul>
      {!!rooms.length && <><h2>{ru ? 'Чаты на этом устройстве' : 'Chats on this device'}</h2><ul>{rooms.map(room => <li key={room.id}><Link href={`/chat/${room.id}`} aria-current={temporary && room.id === chatId ? 'page' : undefined}>{room.name}</Link></li>)}</ul></>}
      {!chats.length && !rooms.length && <p>{t.empty}</p>}
    </div></details>
  </aside>;
}
