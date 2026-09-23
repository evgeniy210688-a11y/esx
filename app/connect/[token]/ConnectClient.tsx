"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import useAccount from '@/app/account/useAccount';
import { ensureChatSession } from '@/lib/guest-session';
import '@/app/account/account.css';

export default function ConnectClient({ token }: { token: string }) {
  const { ready } = useAccount();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const valid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(token);
  useEffect(() => {
    if (!ready || !valid) return;
    let active = true;
    async function connect() {
      await ensureChatSession();
      if (!active) return;
      const { data, error } = await supabase.rpc('esx_open_conversation', { invite_token: token });
      if (!active) return;
      if (error) setError(error.message.includes('own_invite') ? 'Это ваш QR-код. Покажите его собеседнику.' : error.message.includes('invite_not_found') ? 'Этот QR-код не найден.' : 'Не удалось открыть переписку. Попробуйте ещё раз.');
      else if (typeof data === 'string') window.location.replace(`/messages/${data}`);
      else setError('Не удалось открыть переписку. Попробуйте ещё раз.');
    }
    void connect().catch((cause: unknown) => {
      if (!active) return;
      const code = (cause as { code?: string } | null)?.code;
      setError(code === 'anonymous_provider_disabled'
        ? 'Гостевой вход пока недоступен. Вы можете войти в аккаунт и открыть этот QR-код.'
        : 'Не удалось открыть гостевой чат. Попробуйте ещё раз.');
    });
    return () => { active = false; };
  }, [ready, token, valid, attempt]);
  return <main className="account-page" lang="ru"><div className="account-shell"><nav className="account-nav"><Link href="/">← Главная</Link><Link href="/account">Мой аккаунт</Link></nav><section className="account-card"><h1>Личная переписка</h1>
    {!valid ? <p>Некорректная ссылка QR-кода.</p> : !ready ? <p role="status">Загрузка…</p> : error ? <><p role="alert">{error}</p><div className="account-actions"><button onClick={() => { setError(''); setAttempt(value => value + 1); }}>Повторить</button><Link className="account-button" href={`/account?next=${encodeURIComponent(`/connect/${token}`)}`}>Войти / зарегистрироваться</Link></div></> : <p role="status">Открываем вашу переписку… Регистрация не нужна.</p>}
  </section></div></main>;
}
