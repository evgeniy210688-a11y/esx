"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import useAccount from '@/app/account/useAccount';
import '@/app/account/account.css';

export default function ConnectClient({ token }: { token: string }) {
  const { user, ready } = useAccount();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const valid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(token);
  useEffect(() => {
    if (!user || !valid) return;
    let active = true;
    supabase.rpc('esx_open_conversation', { invite_token: token }).then(({ data, error }) => {
      if (!active) return;
      if (error) setError(error.message.includes('own_invite') ? 'Это ваш QR-код. Покажите его собеседнику.' : error.message.includes('invite_not_found') ? 'Этот QR-код не найден.' : 'Не удалось открыть переписку. Попробуйте ещё раз.');
      else if (typeof data === 'string') window.location.replace(`/messages/${data}`);
    });
    return () => { active = false; };
  }, [user, token, valid, attempt]);
  return <main className="account-page" lang="ru"><div className="account-shell"><nav className="account-nav"><Link href="/">← Главная</Link><Link href="/account">Мой аккаунт</Link></nav><section className="account-card"><h1>Личная переписка</h1>
    {!valid ? <p>Некорректная ссылка QR-кода.</p> : !ready ? <p role="status">Загрузка…</p> : !user ? <><p>Войдите или зарегистрируйтесь, чтобы открыть отдельную переписку с владельцем этого QR-кода.</p><Link className="account-button" href={`/account?next=${encodeURIComponent(`/connect/${token}`)}`}>Войти / зарегистрироваться</Link></> : error ? <><p role="alert">{error}</p><button onClick={() => { setError(''); setAttempt(value => value + 1); }}>Повторить</button></> : <p role="status">Открываем вашу переписку…</p>}
  </section></div></main>;
}
