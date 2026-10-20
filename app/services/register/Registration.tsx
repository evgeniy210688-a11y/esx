'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useAccount from '@/app/account/useAccount';
import EmailSignIn from '@/app/account/EmailSignIn';
import { supabase } from '@/lib/supabase';
import { serviceLanguages, type ServiceLanguage } from '@/lib/service-directory';
import { prepareCompanyPhoto, validCompanyPhones } from '@/lib/service-media';
import { joinServiceDescription } from '@/lib/service-description';
import '../services.css';
import '../services-light.css';
import '../services-soft.css';
import './registration.css';

type Application = { id: string; name: string; status: string };
const statusLabels: Record<string, string> = { pending: 'На проверке', published: 'Опубликовано', archived: 'Не опубликовано', draft: 'На рассмотрении' };

export default function Registration() {
  const { user, ready } = useAccount();
  return <div className="services-page services-directory registration-page" lang="ru">
    <header className="services-top"><Link className="services-brand" href="/"><Image src="/esx-wordmark-color.png" alt="ESX" width={140} height={48} unoptimized /></Link><nav><Link href="/services">Справочник</Link><Link href="/account">Мой аккаунт</Link></nav></header>
    <main className="services-main"><h1>Регистрация в справочнике</h1><p>Добавьте компанию или специалиста. Карточка появится на сайте только после проверки и одобрения администратором.</p>
      {!ready ? <p role="status">Проверяем вход…</p> : !user || user.is_anonymous ? <><p>Войдите или создайте аккаунт, чтобы отправить заявку.</p><EmailSignIn language="ru" /></> : <SubmissionForm key={user.id} userId={user.id} />}
    </main>
  </div>;
}

function SubmissionForm({ userId }: { userId: string }) {
  const [kind, setKind] = useState<'company' | 'specialist'>('company');
  const [interpreter, setInterpreter] = useState(false);
  const [languages, setLanguages] = useState<ServiceLanguage[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [success, setSuccess] = useState(false);
  const lock = useRef(false);
  const requestId = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error } = await supabase.from('esx_service_owners')
          .select('esx_service_listings(id,name,status)').eq('user_id', userId);
        if (error) throw error;
        if (active) { setApplications((data ?? []).flatMap(row => row.esx_service_listings ? [row.esx_service_listings] : []).flat() as Application[]); setLoadError(false); }
      } catch { if (active) setLoadError(true); }
    }
    void load();
    return () => { active = false; };
  }, [userId, refresh]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || photoBusy) return;
    const values = new FormData(event.currentTarget);
    const get = (key: string) => String(values.get(key) ?? '').trim();
    if (!languages.length) { setMessage('Выберите хотя бы один язык общения.'); return; }
    if (!validCompanyPhones([{ type: 'other', number: get('phone') }])) { setMessage('Проверьте номер телефона.'); return; }
    const description = joinServiceDescription(get('description'), get('services'));
    if (description.length > 5000) { setMessage('Описание и список услуг вместе должны содержать не более 5000 символов.'); return; }
    if (get('website')) {
      try { const url = new URL(get('website')); if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error(); }
      catch { setMessage('Укажите ссылку на сайт, начинающуюся с https:// или http://.'); return; }
    }
    lock.current = true; setBusy(true); setMessage('');
    requestId.current ??= crypto.randomUUID();
    try {
      const { error } = await supabase.rpc('esx_submit_service', {
        p_id: requestId.current,
        p_input: {
          listing_kind: kind === 'company' ? 'company' : interpreter ? 'interpreter' : 'manager',
          name: get('name'), city: get('city'), category: get('category'), address: get('address'),
          phone: get('phone'), website: get('website'), description, photo, service_languages: languages,
        },
      });
      if (error) throw error;
      setSuccess(true); setMessage('Заявка отправлена на проверку. Она появится в справочнике после одобрения администратором.');
      setRefresh(value => value + 1);
    } catch (error) {
      const code = (error as { code?: string }).code;
      setMessage(code === 'P0001' ? 'Достигнут лимит заявок. Дождитесь проверки или попробуйте завтра.'
        : code === '42501' ? 'Войдите в аккаунт с подтверждённой почтой.'
        : code === '23514' || code === '22023' ? 'Проверьте обязательные поля, телефон и языки.'
        : 'Не удалось отправить заявку. Данные сохранены в форме — попробуйте ещё раз.');
    } finally { lock.current = false; setBusy(false); }
  }

  return <>
    <section className="services-card registration-history"><h2>Мои заявки</h2>
      {loadError ? <p role="alert">Не удалось загрузить заявки. <button type="button" onClick={() => setRefresh(value => value + 1)}>Повторить</button></p>
        : applications.length ? <ul>{applications.map(item => <li key={item.id}><strong>{item.name}</strong> — {statusLabels[item.status] ?? 'На рассмотрении'}</li>)}</ul> : <p>Пока нет заявок.</p>}
    </section>
    <form ref={formRef} className="services-card registration-form" onSubmit={submit}>
      <h2>Новая заявка</h2>
      <fieldset disabled={busy || success || photoBusy}>
        <label>Кого регистрируете?<select value={kind} onChange={e => { setKind(e.target.value as typeof kind); setInterpreter(false); }}><option value="company">Компания</option><option value="specialist">Специалист</option></select></label>
        <label>{kind === 'company' ? 'Название компании' : 'Имя специалиста'}<input name="name" required maxLength={200} /></label>
        <label>{kind === 'company' ? 'Категория компании' : 'Специальность / должность'}<input name="category" required maxLength={100} /></label>
        {kind === 'specialist' && <label className="registration-check"><input type="checkbox" checked={interpreter} onChange={e => setInterpreter(e.target.checked)} />Работаю переводчиком</label>}
        <label>Город<input name="city" required={kind === 'company'} maxLength={100} /></label>
        <label>Адрес{kind === 'specialist' ? ' (необязательно)' : ''}<input name="address" required={kind === 'company'} maxLength={500} /></label>
        <label>Телефон<input name="phone" type="tel" required maxLength={30} placeholder="+82 10-1234-5678" /></label>
        <label>Сайт или страница в соцсети (необязательно)<input name="website" type="url" maxLength={500} placeholder="https://" /></label>
        <label>Описание<textarea name="description" required maxLength={4000} rows={5} /></label>
        <label>Услуги — по одной на строку<textarea name="services" maxLength={2000} rows={4} /></label>
        <fieldset><legend>Языки общения{interpreter ? ' / перевода' : ''}</legend><div className="registration-languages">{Object.entries(serviceLanguages).map(([code, name]) => <label className="registration-check" key={code}><input type="checkbox" checked={languages.includes(code as ServiceLanguage)} onChange={() => setLanguages(current => current.includes(code as ServiceLanguage) ? current.filter(value => value !== code) : [...current, code as ServiceLanguage])} />{name}</label>)}</div></fieldset>
        <label>Фото (необязательно)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e => {
          const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
          setPhotoBusy(true); setMessage('');
          try { setPhoto(await prepareCompanyPhoto(file)); } catch { setMessage('Не удалось добавить фото. Выберите JPG, PNG или WebP до 10 МБ.'); }
          finally { setPhotoBusy(false); }
        }} /></label>
        {photo && <div><Image src={photo} alt="Фото для заявки" width={160} height={160} unoptimized /><button type="button" onClick={() => setPhoto(null)}>Убрать фото</button></div>}
        <p>После отправки данные передаются на проверку. Отправка заявки не означает публикацию.</p>
        <button type="submit">{busy ? 'Отправляем…' : 'Отправить на проверку'}</button>
      </fieldset>
      {photoBusy && <p role="status">Подготавливаем фото…</p>}
      <p role="status" aria-live="polite">{message}</p>
      {success && <button type="button" onClick={() => { formRef.current?.reset(); setLanguages([]); setPhoto(null); setKind('company'); setInterpreter(false); requestId.current = null; setSuccess(false); setMessage(''); }}>Подать ещё одну заявку</button>}
    </form>
  </>;
}
