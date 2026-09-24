"use client";
import { accountLabels, type AccountMessage } from './accountLabels';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AccountQr from './AccountQr';
import { supabase } from '@/lib/supabase';
import { safeAccountNext } from '@/lib/account-path';
import useChatInterface from '@/app/chat/[id]/useChatInterface';
import useAccount from './useAccount';
import EmailSignIn from './EmailSignIn';
import { registrationLabels } from './registrationLabels';
import ProfilePhoto from './ProfilePhoto';
import SiteHeader from '@/app/design/SiteHeader';
import { languages, type Language } from '@/app/design/content';

const languageLabels: Record<Language, string> = {
  ru: 'Язык интерфейса', en: 'Interface language', ko: '인터페이스 언어',
  zh: '界面语言', tr: 'Arayüz dili', vi: 'Ngôn ngữ giao diện',
  km: 'ភាសាចំណុចប្រទាក់', kk: 'Интерфейс тілі',
};

type Conversation = { id: string; participant_a: string; participant_b: string };
export default function AccountPage() {
  const { user, ready } = useAccount();
  return <AccountContent key={user?.id ?? 'guest'} user={user} ready={ready} />;
}
function AccountContent({ user, ready }: ReturnType<typeof useAccount>) {
  const router = useRouter();
  const [waitingForChat, setWaitingForChat] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const { language } = useChatInterface(selectedLanguage);
  const t = accountLabels[language];
  const username = typeof user?.user_metadata?.username === 'string' ? user.user_metadata.username.slice(0, 24) : '';
  const [status, setStatus] = useState<AccountMessage | ''>('');
  const [qr, setQr] = useState('');
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (waitingForChat && chats.length) router.push(`/messages/${chats[0].id}`);
  }, [waitingForChat, chats, router]);
  useEffect(() => {
    if (!user) return;
    let stopped = false;
    const next = safeAccountNext(new URLSearchParams(window.location.search).get('next'));
    if (!user.is_anonymous && next !== '/account') { window.location.replace(next); return; }
    async function load() {
      try {
        const [profile, conversations] = await Promise.all([
          user!.is_anonymous ? Promise.resolve({ data: null, error: null }) : supabase.from('esx_profiles').select('qr_token').eq('user_id', user!.id).single(),
          supabase.from('esx_conversations').select('id,participant_a,participant_b').order('created_at', { ascending: false }),
        ]);
        if (stopped) return;
        setLoadError(Boolean(profile.error || conversations.error));
        if (profile.data?.qr_token) setQr(window.location.origin + '/connect/' + profile.data.qr_token);
        if (conversations.data) setChats(conversations.data);
      } catch { if (!stopped) setLoadError(true); }
    }
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 10000);
    return () => { stopped = true; clearInterval(timer); };
  }, [user, reload]);
  return <div className="esx-site account-site" lang={language}><SiteHeader language={language} /><main className="account-page"><div className="account-shell">
    {user && <div className="account-nav"><button className="account-secondary" onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) setStatus('signOutError'); }}>{t.signOut}</button></div>}
    <label className="account-language">
      <span>{languageLabels[language]}</span>
      <select value={language} onChange={event => {
        const next = languages.find(item => item.code === event.target.value)?.code;
        if (!next) return;
        setSelectedLanguage(next);
        try { localStorage.setItem('esx-language', next); } catch {}
      }}>
        {languages.map(item => <option key={item.code} value={item.code} lang={item.code}>{item.name}</option>)}
      </select>
    </label>
    {!ready ? <p role="status">{registrationLabels[language].loading}</p> : !user || user.is_anonymous ? <><p className="account-muted">{t.registrationHelp}</p><EmailSignIn language={language} />{user && <section className="account-card"><h2>{t.guestConversations}</h2><p className="account-muted">{t.guestHelp}</p><ul className="account-chats">{chats.map(chat => <li key={chat.id}><Link href={'/messages/' + chat.id}>{t.conversation} {chat.id.slice(0, 8)} →</Link></li>)}</ul></section>}</> : <>
      <header className="account-welcome"><h1>{t.title}</h1>{username && <p>{t.username}: <strong>{username}</strong></p>}<p className="account-muted">{user.email || user.phone}</p><ProfilePhoto userId={user.id} language={language} /></header>
      <section className="account-card"><h2>{t.qrTitle}</h2><p>{t.qrHelp}</p>
        <p className="account-muted">{t.guestChatNote}</p>
        {!qr && !loadError && <p role="status">{t.qrLoading}</p>}
        {qr && <AccountQr url={qr} username={username} language={language} />}
        <div className="account-actions"><button disabled={waitingForChat} onClick={() => {
          if (chats.length) router.push(`/messages/${chats[0].id}`);
          else { setWaitingForChat(true); setReload(value => value + 1); }
        }}>{t.openChat}</button></div>
        {waitingForChat && <p role="status">{t.waitingForChat}</p>}
      </section>
      <section className="account-card"><h2>{t.conversations}</h2>{chats.length ? <ul className="account-chats">{chats.map(chat => <li key={chat.id}><Link href={'/messages/' + chat.id}>{t.contact} {(chat.participant_a === user.id ? chat.participant_b : chat.participant_a).slice(0, 8)} →</Link></li>)}</ul> : <p className="account-muted">{t.empty}</p>}</section>
    </>}
    {ready && user && loadError && <p role="alert">{t.loadError} <button onClick={() => setReload(value => value + 1)}>{t.retry}</button></p>}
    <p className="account-status" role="status">{status ? t[status] : ''}</p>
  </div></main></div>;
}
