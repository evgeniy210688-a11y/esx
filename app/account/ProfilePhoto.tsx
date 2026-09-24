"use client";
import { accountLabels, type AccountMessage } from './accountLabels';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import type { Language } from '@/app/design/content';
import { supabase } from '@/lib/supabase';
import { prepareAccountPhoto } from '@/lib/account-photo';

export default function ProfilePhoto({ userId, language, children }: { userId: string; language: Language; children?: ReactNode }) {
  const t = accountLabels[language];
  const fileInput = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<AccountMessage | ''>('');
  useEffect(() => {
    let active = true;
    void supabase.from('esx_profiles').select('avatar').eq('user_id', userId).single().then(({ data, error }) => {
      if (!active) return;
      if (error || sessionStorage.getItem('esx-photo-save-failed')) {
        setStatus('photoLoadError');
        sessionStorage.removeItem('esx-photo-save-failed');
      }
      if (data?.avatar) setPhoto(data.avatar);
    });
    return () => { active = false; };
  }, [userId]);
  async function save(value: string | null) {
    const { error } = await supabase.from('esx_profiles').update({ avatar: value }).eq('user_id', userId).select('user_id').single();
    if (error) throw error;
    setPhoto(value ?? '');
    setStatus('photoSaved');
  }
  return <div className="account-profile-photo">
    <div className="account-profile-summary">
    {photo ? <Image unoptimized width={96} height={96} className="account-avatar" src={photo} alt={t.photoAlt} /> : <span className="account-avatar account-avatar-empty" aria-hidden="true">ESX</span>}
    <div className="account-profile-details">{children}</div>
    </div>
    <div className="account-photo-actions">
    <button type="button" disabled={busy} onClick={() => fileInput.current?.click()}>{t.changePhoto}</button>
    <input ref={fileInput} type="file" hidden aria-label={t.changePhoto} accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
      setBusy(true); setStatus('');
      try { await save(await prepareAccountPhoto(file)); } catch { setStatus('photoSaveError'); }
      finally { setBusy(false); }
    }} />
    {photo && <button className="account-secondary" disabled={busy} onClick={async () => {
      setBusy(true); try { await save(null); } catch { setStatus('photoRemoveError'); } finally { setBusy(false); }
    }}>{t.removePhoto}</button>}
    </div>
    <p role="status">{busy ? t.saving : status ? t[status] : ''}</p>
  </div>;
}
