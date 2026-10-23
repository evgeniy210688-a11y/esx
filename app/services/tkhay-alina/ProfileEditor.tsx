'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useAccount from '@/app/account/useAccount';
import { supabase } from '@/lib/supabase';
import { ALINA_ID } from '@/lib/specialist-content';
import { companyPhotos, prepareCompanyPhoto } from '@/lib/service-media';
import { joinServiceDescription, splitServiceDescription } from '@/lib/service-description';
import { serviceLanguages, type ServiceLanguage, type ServiceListing } from '@/lib/service-directory';

export default function ProfileEditor() {
  const { user } = useAccount();
  const userId = user && !user.is_anonymous ? user.id : null;
  const [allowed, setAllowed] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (userId) void supabase.from('esx_service_admins').select('user_id').eq('user_id',userId).maybeSingle().then(({data,error}) => {
      if (active) setAllowed(data && !error ? userId : null);
    });
    return () => { active = false; };
  }, [userId]);
  return userId && allowed === userId ? <Editor key={userId} /> : null;
}

function Editor() {
  const router = useRouter();
  const [original,setOriginal] = useState<ServiceListing | null>(null);
  const [draft,setDraft] = useState<ServiceListing | null>(null);
  const [services,setServices] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const lock = useRef(false);
  const dirty = !!draft && !!original && (JSON.stringify(draft) !== JSON.stringify({...original,description:splitServiceDescription(original.description).description}) || services !== splitServiceDescription(original.description).services);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload',warn);
    return () => window.removeEventListener('beforeunload',warn);
  }, [dirty]);
  async function start() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const {data,error} = await supabase.from('esx_service_listings').select('id,name,city,category,represented_company,description,address,photo,photos,service_languages').eq('id',ALINA_ID).single();
      if (error || !data) throw error;
      const row = data as ServiceListing;
      const text = splitServiceDescription(row.description);
      setOriginal(row); setDraft({...row,description:text.description}); setServices(text.services);
    } catch { setMessage('Не удалось открыть редактор. Проверьте соединение и повторите.'); }
    finally { lock.current = false; setBusy(false); }
  }
  function change<K extends keyof ServiceListing>(key: K,value: ServiceListing[K]) { setDraft(current => current ? {...current,[key]:value} : current); }
  async function photo(file?: File) {
    if (!file || lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const result = await prepareCompanyPhoto(file);
      setDraft(current => current ? {...current,photo:result,photos:[result,...companyPhotos(current).slice(1)]} : current);
    } catch { setMessage('Выберите фото JPG, PNG или WebP до 10 МБ.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || !original || lock.current) return;
    const description = joinServiceDescription(draft.description,services);
    if (!draft.name.trim() || !draft.city.trim() || !draft.category.trim()) { setMessage('Заполните имя, город и специализацию.'); return; }
    if (description.length > 5000) { setMessage('Описание и услуги вместе — не более 5000 символов.'); return; }
    if (!draft.service_languages.length) { setMessage('Выберите хотя бы один язык общения.'); return; }
    const values = { name:draft.name.trim(),city:draft.city.trim(),category:draft.category.trim(),represented_company:draft.represented_company?.trim() || null,description,address:draft.address.trim(),photo:draft.photo,photos:draft.photos,service_languages:draft.service_languages };
    // Update only edited fields; never overwrite unrelated listing settings.
    const changes = Object.fromEntries(Object.entries(values).filter(([key,value]) => JSON.stringify(value) !== JSON.stringify(original[key as keyof ServiceListing])));
    if (!Object.keys(changes).length) { setDraft(null); setMessage('Изменений нет.'); return; }
    lock.current = true; setBusy(true); setMessage('');
    try {
      const {data,error} = await supabase.from('esx_service_listings').update(changes).eq('id',ALINA_ID).select('id').maybeSingle();
      if (error) throw error;
      if (!data) { setMessage('Не удалось сохранить: карточка недоступна или права изменились. Ваши изменения остались в форме.'); return; }
      setDraft(null); setOriginal(null); setMessage('Сохранено.'); router.refresh();
    } catch { setMessage('Не удалось сохранить. Ваши изменения остались в форме — попробуйте ещё раз.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="profile-main-editor">
    {!draft ? <button type="button" disabled={busy} onClick={start}>{busy ? 'Открываем…' : 'Редактировать'}</button> : <form onSubmit={save}>
      <h2>Редактирование карточки</h2><fieldset disabled={busy}>
        <div className="profile-photo-editor">{companyPhotos(draft)[0] && <Image src={companyPhotos(draft)[0]} alt="Предпросмотр фото" width={120} height={120} unoptimized />}<label>Поменять фото<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void photo(file); }} /></label></div>
        <label>Имя<input value={draft.name} maxLength={200} required onChange={e => change('name',e.target.value)} /></label>
        <label>Город<input value={draft.city} maxLength={100} required onChange={e => change('city',e.target.value)} /></label>
        <label>Специализация<input value={draft.category} maxLength={100} required onChange={e => change('category',e.target.value)} /></label>
        <label>Компания<input value={draft.represented_company ?? ''} maxLength={200} onChange={e => change('represented_company',e.target.value)} /></label>
        <label>Описание<textarea value={draft.description} rows={7} maxLength={5000} onChange={e => change('description',e.target.value)} /></label>
        <label>Услуги — каждая с новой строки<textarea value={services} rows={5} maxLength={5000} onChange={e => setServices(e.target.value)} /></label>
        <label>Адрес<input value={draft.address ?? ''} maxLength={500} placeholder="Укажите полный адрес" onChange={e => change('address',e.target.value)} /></label>
        <fieldset className="profile-language-options"><legend>Языки общения</legend>{Object.entries(serviceLanguages).map(([code,label]) => <label key={code}><input type="checkbox" checked={draft.service_languages.includes(code as ServiceLanguage)} onChange={e => change('service_languages',e.target.checked ? [...draft.service_languages,code as ServiceLanguage] : draft.service_languages.filter(value => value !== code))} />{label}</label>)}</fieldset>
        <div className="profile-editor-actions"><button type="submit">{busy ? 'Сохраняем…' : 'Сохранить'}</button><button type="button" onClick={() => { if (dirty && !window.confirm('Отменить несохранённые изменения?')) return; setDraft(null); setOriginal(null); setMessage(''); }}>Отмена</button></div>
      </fieldset>
    </form>}
    {message && <p role="status">{message}</p>}
  </div>;
}
