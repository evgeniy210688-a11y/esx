'use client';
import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import type { Language } from '@/app/design/content';
import { privateChatLabels } from './privateChatLabels';
import { accountLabels } from '@/app/account/accountLabels';
import { chatLabels } from '@/app/chat/[id]/chatLabels';
export default function PrivateQrCode({ language, userId, anonymous, chatId }: { language: Language; userId?: string; anonymous?: boolean; chatId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function show() {
    dialog.current?.showModal(); setUrl(''); setError(false); setBusy(true);
    try {
      if (!userId) throw Error('Unavailable');
      if (anonymous) { setUrl(window.location.origin + '/messages/' + encodeURIComponent(chatId)); return; }
      const result = await supabase.from('esx_profiles').select('qr_token').eq('user_id', userId).single();
      if (result.error || !result.data?.qr_token) throw Error('Unavailable');
      setUrl(window.location.origin + '/connect/' + encodeURIComponent(result.data.qr_token));
    } catch { setError(true); } finally { setBusy(false); }
  }
  return <><button type="button" className="private-header-qr" aria-haspopup="dialog" onClick={() => void show()}>{privateChatLabels[language].qr}</button>
    <dialog ref={dialog} aria-labelledby="private-qr-title" className="private-qr-dialog" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <h2 id="private-qr-title">{anonymous ? privateChatLabels[language].title : accountLabels[language].qrTitle}</h2>
      {busy && <p role="status">{privateChatLabels[language].loading}</p>}
      {error && <p role="alert">{privateChatLabels[language].loadError} <button type="button" onClick={() => void show()}>{accountLabels[language].retry}</button></p>}
      {url && <QRCodeSVG value={url} size={256} level="M" marginSize={4} />}
      <form method="dialog"><button autoFocus>{chatLabels[language][5]}</button></form>
    </dialog></>;
}
