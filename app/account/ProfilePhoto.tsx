"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { prepareAccountPhoto } from '@/lib/account-photo';

export default function ProfilePhoto({ userId, russian }: { userId: string; russian: boolean }) {
  const c = (ru: string, en: string) => russian ? ru : en;
  const [photo, setPhoto] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    let active = true;
    void supabase.from('esx_profiles').select('avatar').eq('user_id', userId).single().then(({ data, error }) => {
      if (!active) return;
      if (error || sessionStorage.getItem('esx-photo-save-failed')) {
        setStatus(russian ? 'Не удалось загрузить фото. Попробуйте выбрать его ещё раз.' : 'Could not load your photo. Please select it again.');
        sessionStorage.removeItem('esx-photo-save-failed');
      }
      if (data?.avatar) setPhoto(data.avatar);
    });
    return () => { active = false; };
  }, [userId, russian]);
  async function save(value: string | null) {
    const { error } = await supabase.from('esx_profiles').update({ avatar: value }).eq('user_id', userId).select('user_id').single();
    if (error) throw error;
    setPhoto(value ?? '');
    setStatus(c('Фото сохранено.', 'Photo saved.'));
  }
  return <div className="account-profile-photo">
    {photo ? <Image unoptimized width={96} height={96} className="account-avatar" src={photo} alt={c('Фото профиля', 'Profile photo')} /> : <span className="account-avatar account-avatar-empty" aria-hidden="true">ESX</span>}
    <label>{c('Изменить фото', 'Change photo')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
      setBusy(true); setStatus('');
      try { await save(await prepareAccountPhoto(file)); } catch { setStatus(c('Не удалось сохранить фото. Выберите JPG, PNG или WebP до 10 МБ и повторите.', 'Could not save photo. Choose a JPG, PNG or WebP up to 10 MB and retry.')); }
      finally { setBusy(false); }
    }} /></label>
    {photo && <button className="account-secondary" disabled={busy} onClick={async () => {
      setBusy(true); try { await save(null); } catch { setStatus(c('Не удалось убрать фото.', 'Could not remove photo.')); } finally { setBusy(false); }
    }}>{c('Убрать фото', 'Remove photo')}</button>}
    <p role="status">{busy ? c('Сохраняем…', 'Saving…') : status}</p>
  </div>;
}
