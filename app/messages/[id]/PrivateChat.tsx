"use client";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import FoxStickerPicker, { FoxStickerImage } from '@/app/components/FoxStickers';
import { getFoxSticker } from '@/lib/fox-stickers';
import { supabase } from '@/lib/supabase';
import { languages, type Language } from '@/app/design/content';
import MessageTranslation from '@/app/chat/[id]/MessageTranslation';
import useAccount from '@/app/account/useAccount';
import SiteHeader from '@/app/design/SiteHeader';
import '@/app/account/account.css';
import './private-chat.css';

type Message = { id: string; sender_id: string; message: string; created_at: string };
export default function PrivateChat({ chatId }: { chatId: string }) {
  const { user, ready } = useAccount();
  return <PrivateChatContent key={`${chatId}:${user?.id ?? 'guest'}`} chatId={chatId} user={user} ready={ready} />;
}
function PrivateChatContent({ chatId, user, ready }: { chatId: string } & ReturnType<typeof useAccount>) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [names, setNames] = useState<Record<string, string | null>>({});
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [target, setTarget] = useState<Language>('ru');
  const [older, setOlder] = useState(false);
  const [limit, setLimit] = useState(100);
  const sendLock = useRef(false);
  useEffect(() => {
    try {
      const value = localStorage.getItem('esx-language');
      // Restore the saved browser preference after server hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (languages.some(item => item.code === value)) setTarget(value as Language);
    } catch {}
  }, []);
  useEffect(() => {
    if (!user) return;
    let stopped = false;
    let loading = false;
    async function load() {
      if (loading) return;
      loading = true;
      try {
        const conversation = await supabase.from('esx_conversations').select('id').eq('id', chatId).maybeSingle();
        if (stopped) return;
        if (conversation.error || !conversation.data) { setAllowed(false); setMessages([]); setStatus('Переписка недоступна. Войдите в аккаунт одного из участников.'); return; }
        const [result, participants] = await Promise.all([
          supabase.from('esx_private_messages').select('id,sender_id,message,created_at').eq('chat_id', chatId).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(limit),
          supabase.rpc('esx_chat_participants', { conversation_id: chatId }),
        ]);
        if (stopped) return;
        if (result.error || participants.error) { setStatus('Не удалось загрузить сообщения. Повторите.'); return; }
        setNames(Object.fromEntries((participants.data ?? []).map((person: { user_id: string; username: string | null }) => [person.user_id, person.username])));
        setAllowed(true); setMessages((result.data ?? []).reverse()); setOlder(result.data.length === limit); setStatus('');
      } catch { if (!stopped) setStatus('Не удалось загрузить сообщения. Проверьте соединение.'); }
      finally { loading = false; if (!stopped) setLoaded(true); }
    }
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 3000);
    return () => { stopped = true; clearInterval(timer); };
  }, [user, chatId, attempt, limit]);
  async function send(event: FormEvent) {
    event.preventDefault();
    await sendMessage(draft.trim());
  }
  async function sendMessage(message: string, sticker = false): Promise<boolean> {
    if (!message || !user || !allowed || sendLock.current) return false;
    sendLock.current = true; setSending(true); setStatus('');
    try {
      const { error } = await supabase.from('esx_private_messages').insert({ chat_id: chatId, message });
      if (error) { setStatus('Сообщение не отправлено. Попробуйте ещё раз.'); return false; }
      if (!sticker) setDraft('');
      setAttempt(value => value + 1);
      return true;
    } catch { setStatus('Сообщение не отправлено. Проверьте соединение.'); return false; }
    finally { sendLock.current = false; setSending(false); }
  }
  return <><div className="esx-site private-chat-site-header"><SiteHeader language={target} /></div><main className="account-page kakao-chat" lang="ru"><div className="account-shell"><nav className="account-nav"><Link href="/account">← Мои переписки</Link><Link href="/account">Мой QR-код</Link></nav><h1>Личная переписка</h1>
    {user?.is_anonymous && <p className="account-muted">Вы общаетесь как гость. Чат доступен в этом браузере, пока сохранена гостевая сессия. <Link href="/account">Зарегистрироваться для постоянного QR-кода</Link></p>}
    {!ready ? <p role="status">Загрузка…</p> : !user ? <Link className="account-button" href={`/account?next=${encodeURIComponent(`/messages/${chatId}`)}`}>Войти / зарегистрироваться</Link> : <>
      <label>Язык входящих сообщений <select value={target} onChange={event => setTarget(event.target.value as Language)}>{languages.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
      {!loaded && <p role="status">Загрузка сообщений…</p>}
      {older && <button className="account-secondary" onClick={() => setLimit(value => value + 100)}>Показать более ранние сообщения</button>}
      <div className="private-list">{messages.map(message => {
        const own = message.sender_id === user.id;
        const sender = names[message.sender_id] || 'Гость';
        return <article key={message.id} className={`private-message-row${own ? ' private-message-row-own' : ''}`}>
          {!own && <span className="private-message-avatar" aria-hidden="true">{Array.from(sender)[0]?.toLocaleUpperCase()}</span>}
          <div className="private-message-content">
            {!own && <strong className="chat-sender" dir="auto">{sender}</strong>}
            <div className="private-message-line">
              <div className={`private-bubble${own ? ' private-own' : ''}`}>
                {getFoxSticker(message.message) ? <FoxStickerImage id={getFoxSticker(message.message)!} language={target} /> : own ? <span dir="auto">{message.message}</span> : <MessageTranslation key={`${message.id}:${target}`} chatId={chatId} messageId={message.id} language={target} target={target} privateChat />}
              </div>
              <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
          </div>
        </article>;
      })}{loaded && allowed && !messages.length && <p className="account-muted">Начните разговор. Сообщения видны только вам и собеседнику.</p>}</div>
      {allowed && <form onSubmit={send} className="private-compose"><label htmlFor="private-message">Сообщение</label><FoxStickerPicker language={target} disabled={sending} onSend={message => sendMessage(message, true)} /><textarea id="private-message" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Написать сообщение…" rows={2} maxLength={4000} required disabled={sending} /><button disabled={sending || !draft.trim()}>{sending ? 'Отправляем…' : 'Отправить'}</button></form>}
      {status && <p role="alert">{status} <button className="account-secondary" onClick={() => setAttempt(value => value + 1)}>Повторить</button></p>}
    </>}
  </div></main></>;
}
