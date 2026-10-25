'use client';
import SearchableSelect from '@/app/services/SearchableSelect';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import useAccount from '@/app/account/useAccount';
import { supabase } from '@/lib/supabase';
import { ALINA_ID } from '@/lib/specialist-content';

type Status = 'new' | 'working' | 'done';
type Inquiry = { id: string; name: string; contact: string; message: string; status: Status; created_at: string };
const labels: Record<Status,string> = { new: 'Новая', working: 'В работе', done: 'Завершена' };
const PAGE_SIZE = 20;

export default function ServiceInbox() {
  const { user, ready } = useAccount();
  const userId = user && !user.is_anonymous ? user.id : null;
  const [adminId, setAdminId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (userId) void supabase.from('esx_service_admins').select('user_id').eq('user_id', userId).maybeSingle().then(({ data, error }) => {
      if (active) setAdminId(!error && data ? userId : null);
    });
    return () => { active = false; };
  }, [userId]);
  return <section className="services-card specialist-inquiries" aria-labelledby="inquiries-heading">
    <h2 id="inquiries-heading">Заявки Алине</h2>
    {!ready ? <p role="status">Проверяем вход…</p> : userId ? <>
      {adminId === userId && <Inbox key={'inbox-' + userId} />}
      <details className="inquiry-compose" open={adminId !== userId}><summary>Написать Алине</summary><InquiryForm key={userId} /></details>
    </> : <><p>Войдите в аккаунт ESX, чтобы отправить заявку Алине.</p><Link href="/account">Войти или зарегистрироваться</Link></>}
  </section>;
}

function InquiryForm() {
  const [busy,setBusy] = useState(false);
  const [sent,setSent] = useState(false);
  const [message,setMessage] = useState('');
  const requestId = useRef<string | null>(null);
  const inFlight = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || sent) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const contact = String(form.get('contact') ?? '').trim();
    const text = String(form.get('message') ?? '').trim();
    if (!name || contact.length < 3 || !text) { setMessage('Заполните имя, контакт и сообщение.'); return; }
    inFlight.current = true; setBusy(true); setMessage('');
    requestId.current ??= crypto.randomUUID();
    try {
      const { error } = await supabase.rpc('esx_submit_specialist_inquiry', { p_id: requestId.current, p_name: name, p_contact: contact, p_message: text });
      if (error) { setMessage(error.message.includes('rate_limited') ? 'Можно отправить до 5 заявок в час. Попробуйте позже.' : 'Не удалось отправить заявку. Текст остался в форме — попробуйте ещё раз.'); return; }
      setSent(true); setMessage('Заявка отправлена. С вами свяжутся по указанному контакту.');
    } catch { setMessage('Нет соединения. Текст остался в форме — повторите отправку.'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <form onSubmit={submit} className="inquiry-form">
    <p>Опишите ваш вопрос и оставьте телефон, email или контакт в мессенджере для ответа.</p>
    <fieldset disabled={busy || sent}>
      <label>Ваше имя<input name="name" required maxLength={100} autoComplete="name" /></label>
      <label>Контакт для ответа<input name="contact" required minLength={3} maxLength={200} placeholder="Телефон, email или мессенджер" /></label>
      <label>Сообщение<textarea name="message" required maxLength={5000} rows={5} /></label>
      <p className="inquiry-note">Заявка доступна только администраторам ESX. Не прикладывайте паспортные данные и другие документы.</p>
      <button type="submit">{busy ? 'Отправляем…' : sent ? 'Отправлено' : 'Отправить заявку'}</button>
    </fieldset>
    {message && <p role="status">{message}</p>}
    {sent && <button type="button" onClick={event => { event.currentTarget.form?.reset(); requestId.current = null; setSent(false); setMessage(''); }}>Написать ещё</button>}
  </form>;
}

function Inbox() {
  const [filter,setFilter] = useState<Status | 'all'>('all');
  const [page,setPage] = useState(0);
  const [refresh,setRefresh] = useState(0);
  const [items,setItems] = useState<Inquiry[]>([]);
  const [count,setCount] = useState(0);
  const [loadedKey,setLoadedKey] = useState('');
  const queryKey = `${filter}:${page}:${refresh}`;
  const loading = loadedKey !== queryKey;
  const [error,setError] = useState('');
  const [busy,setBusy] = useState<string | null>(null);
  const [open,setOpen] = useState(false);
  useEffect(() => {
    let active = true;
    let query = supabase.from('esx_specialist_inquiries').select('id,name,contact,message,status,created_at', { count: 'exact' }).eq('listing_id',ALINA_ID);
    if (filter !== 'all') query = query.eq('status',filter);
    void query.order('created_at',{ ascending:false }).order('id').range(page*PAGE_SIZE,(page+1)*PAGE_SIZE-1).then(({data,error,count}) => {
      if (!active) return;
      setLoadedKey(queryKey); setError('');
      if (error) { setItems([]); setError('Не удалось загрузить заявки. Нажмите «Обновить».'); return; }
      if (!data?.length && page > 0) { setPage(value => value-1); return; }
      setItems((data ?? []) as Inquiry[]); setCount(count ?? 0);
    });
    return () => { active = false; };
  }, [filter,page,refresh,queryKey]);
  async function changeStatus(id: string,status: Status) {
    if (busy) return;
    setBusy(id); setError('');
    try {
      const {data,error} = await supabase.from('esx_specialist_inquiries').update({status}).eq('id',id).eq('listing_id',ALINA_ID).select('id').maybeSingle();
      if (error || !data) { setError('Не удалось изменить статус. Проверьте доступ и повторите.'); return; }
      setRefresh(value => value+1);
    } catch { setError('Нет соединения. Повторите изменение статуса.'); }
    finally { setBusy(null); }
  }
  return <div className="inquiry-inbox">
    <button type="button" className="inquiry-inbox-toggle" aria-expanded={open} aria-controls="alina-inbox" onClick={() => setOpen(value => !value)}>✉ Входящие заявки{!loading && !error && filter === 'all' ? ` (${count})` : ''}</button>
    {open && <div id="alina-inbox">
      <div className="inquiry-toolbar"><label>Показать<SearchableSelect value={filter} disabled={!!busy} onChange={event => { setFilter(event.target.value as Status | 'all'); setPage(0); }}><option value="all">Все заявки</option>{Object.entries(labels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</SearchableSelect></label><button type="button" disabled={loading || !!busy} onClick={() => setRefresh(value => value+1)}>Обновить</button></div>
      {!loading && error && <p role="alert">{error}</p>}
      {loading ? <p role="status">Загружаем заявки…</p> : !error && items.length === 0 ? <p>Заявок пока нет.</p> : <ul className="inquiry-list">{items.map(item => <li key={item.id}><details><summary><strong>{item.name}</strong><span className={'inquiry-status inquiry-status-' + item.status}>{labels[item.status]}</span><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString('ru-RU',{timeZone:'Asia/Seoul'})} (Корея)</time></summary><p><strong>Контакт:</strong> {item.contact}</p><p className="inquiry-message">{item.message}</p><label>Статус<SearchableSelect value={item.status} disabled={!!busy} onChange={event => void changeStatus(item.id,event.target.value as Status)}>{Object.entries(labels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</SearchableSelect></label></details></li>)}</ul>}
      <div className="inquiry-toolbar"><button type="button" disabled={page === 0 || loading || !!busy} onClick={() => setPage(value => value-1)}>Назад</button><span>Страница {page+1}</span><button type="button" disabled={(page+1)*PAGE_SIZE >= count || loading || !!busy} onClick={() => setPage(value => value+1)}>Далее</button></div>
    </div>}
  </div>;
}
