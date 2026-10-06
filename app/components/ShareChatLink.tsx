'use client';

import { useState } from 'react';
import type { Language } from '@/app/design/content';
import { accountLabels } from '@/app/account/accountLabels';

const labels: Record<Language, string> = {
  ru: 'Поделиться ссылкой', en: 'Share link', ko: '링크 공유', zh: '分享链接',
  tr: 'Bağlantıyı paylaş', vi: 'Chia sẻ liên kết', km: 'ចែករំលែកតំណ', kk: 'Сілтемені бөлісу',
};

export default function ShareChatLink({ url, language }: { url: string; language: Language }) {
  const [status, setStatus] = useState<'linkCopied' | 'copyError' | ''>('');
  const [busy, setBusy] = useState(false);
  const t = accountLabels[language];

  async function share() {
    if (!url || busy) return;
    setBusy(true);
    setStatus('');
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: t.qrTitle, url });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return;
        }
      }
      await navigator.clipboard.writeText(url);
      setStatus('linkCopied');
    } catch {
      setStatus('copyError');
    } finally {
      setBusy(false);
    }
  }

  return <div className="share-chat-link" style={{ marginBlock: 12 }}>
    <button type="button" onClick={() => void share()} disabled={!url || busy} style={{ border: '1px solid #78d9ee', borderRadius: 24, padding: '12px 18px', background: '#142b48', color: '#fff', font: 'inherit', cursor: 'pointer' }}>{labels[language]}</button>
    <p role="status" aria-live="polite">{status ? t[status] : ''}</p>
    {status === 'copyError' && <input readOnly aria-label={t.copyLink} value={url} onFocus={event => event.currentTarget.select()} style={{ width: '100%', color: '#10223b', background: '#fff' }} />}
  </div>;
}
