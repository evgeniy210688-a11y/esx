"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { safeAccountNext } from '@/lib/account-path';
import useChatInterface from '@/app/chat/[id]/useChatInterface';
import useAccount from './useAccount';
import EmailSignIn from './EmailSignIn';
import ProfilePhoto from './ProfilePhoto';

type Conversation = { id: string; participant_a: string; participant_b: string };
export default function AccountPage() {
  const { user, ready } = useAccount();
  return <AccountContent key={user?.id ?? 'guest'} user={user} ready={ready} />;
}
function AccountContent({ user, ready }: ReturnType<typeof useAccount>) {
  const { language } = useChatInterface();
  const c = (ru: string, en: string) => language === 'ru' ? ru : en;
  const username = typeof user?.user_metadata?.username === 'string' ? user.user_metadata.username.slice(0, 24) : '';
  const [status, setStatus] = useState('');
  const [qr, setQr] = useState('');
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!user) return;
    let stopped = false;
    const next = safeAccountNext(new URLSearchParams(window.location.search).get('next'));
    if (next !== '/account') { window.location.replace(next); return; }
    async function load() {
      try {
        const [profile, conversations] = await Promise.all([
          supabase.from('esx_profiles').select('qr_token').eq('user_id', user!.id).single(),
          supabase.from('esx_conversations').select('id,participant_a,participant_b').order('created_at', { ascending: false }),
        ]);
        if (stopped) return;
        setLoadError(Boolean(profile.error || conversations.error));
        if (profile.data) setQr(window.location.origin + '/connect/' + profile.data.qr_token);
        if (conversations.data) setChats(conversations.data);
      } catch { if (!stopped) setLoadError(true); }
    }
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 10000);
    return () => { stopped = true; clearInterval(timer); };
  }, [user, reload]);
  return <main className="account-page" lang={language === 'ru' ? 'ru' : 'en'}><div className="account-shell">
    <nav className="account-nav"><Link href="/">{c('← ESX · Главная', '← ESX · Home')}</Link>{user && <button className="account-secondary" onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) setStatus(c('Не удалось выйти. Повторите.', 'Could not sign out. Please retry.')); }}>{c('Выйти', 'Sign out')}</button>}</nav>
    {!ready ? <p role="status">{c('Загрузка…', 'Loading…')}</p> : !user ? <EmailSignIn russian={language === 'ru'} /> : <>
      <header className="account-welcome"><h1>{c('Личный кабинет', 'My account')}</h1>{username && <p>{c('Логин', 'Username')}: <strong>{username}</strong></p>}<p className="account-muted">{user.email || user.phone}</p><ProfilePhoto userId={user.id} russian={language === 'ru'} /></header>
      <section className="account-card"><h2>{c('Мой постоянный QR-код', 'My permanent QR code')}</h2><p>{c('Этот QR-код закреплён за вашим аккаунтом и остаётся прежним при повторном входе. Покажите его собеседнику: после входа он откроет отдельную переписку с вами.', 'This QR code stays with your account when you sign in again. Share it with someone: after signing in, they can open a separate private conversation with you.')}</p>
        {!qr && !loadError && <p role="status">{c('Загружаем ваш QR-код…', 'Loading your QR code…')}</p>}
        {qr && <><div className="account-qr"><QRCodeSVG value={qr} size={240} level="M" title={c('Мой постоянный QR-код', 'My permanent QR code')} /></div><a className="account-link" href={qr}>{qr}</a><div className="account-actions"><button onClick={async () => { try { await navigator.clipboard.writeText(qr); setStatus(c('Ссылка скопирована.', 'Link copied.')); } catch { setStatus(c('Скопируйте ссылку под QR-кодом вручную.', 'Copy the link below the QR code manually.')); } }}>{c('Скопировать ссылку', 'Copy link')}</button></div></>}
      </section>
      <section className="account-card"><h2>{c('Мои переписки', 'My conversations')}</h2>{chats.length ? <ul className="account-chats">{chats.map(chat => <li key={chat.id}><Link href={'/messages/' + chat.id}>{c('Собеседник', 'Contact')} {(chat.participant_a === user.id ? chat.participant_b : chat.participant_a).slice(0, 8)} →</Link></li>)}</ul> : <p className="account-muted">{c('Пока нет переписок. Покажите QR-код или откройте QR-код другого пользователя.', 'No conversations yet. Share your QR code or scan another user’s code.')}</p>}</section>
      {loadError && <p role="alert">{c('Не удалось загрузить аккаунт.', 'Could not load your account.')} <button onClick={() => setReload(value => value + 1)}>{c('Повторить', 'Retry')}</button></p>}
    </>}
    <p className="account-status" role="status">{status}</p>
  </div></main>;
}
