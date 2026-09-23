"use client";

import { useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { languages, type Language } from '@/app/design/content';

const translatorLabels: Record<Language, string> = {
  ru: 'Чат-переводчик', en: 'Translator chat', ko: '번역 채팅', zh: '翻译聊天',
  tr: 'Çevirili sohbet', vi: 'Trò chuyện phiên dịch', km: 'ការជជែកបកប្រែ', kk: 'Аудармашы чат',
};

async function loadLogo() {
  const logo = new window.Image();
  logo.src = '/esx-logo.png';
  await logo.decode();
  await document.fonts.ready;
  return logo;
}

export default function AccountQr({ url, username, russian }: { url: string; username: string; russian: boolean }) {
  const qrCanvas = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const c = (ru: string, en: string) => russian ? ru : en;
  const title = c('Мой постоянный QR-код', 'My permanent QR code');
  const instruction = c('Сканируйте, чтобы начать чат', 'Scan to start a chat');
  const caption = c('Регистрация не нужна', 'No registration needed');

  async function download() {
    if (!qrCanvas.current || busy) return;
    setBusy(true); setStatus('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const logo = await loadLogo();
      // Render the sheet with browser fonts so Cyrillic and other Unicode logins
      // survive export without a remote font request. QR stays high resolution.
      const canvas = document.createElement('canvas');
      canvas.width = 1680; canvas.height = 2376;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#10223b'; ctx.textAlign = 'center';
      ctx.drawImage(logo, 700, 100, 280, 280);
      ctx.font = '44px Arial, sans-serif';
      languages.forEach(({ code }, index) => {
        ctx.fillText(translatorLabels[code], index % 2 === 0 ? 455 : 1225, 490 + Math.floor(index / 2) * 80, 690);
      });
      ctx.font = 'bold 48px Arial, sans-serif'; ctx.fillText(username, 840, 825, 1450);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qrCanvas.current, 328, 880, 1024, 1024);
      ctx.font = '48px Arial, sans-serif'; ctx.fillText(instruction, 840, 2020, 1450);
      ctx.font = '36px Arial, sans-serif'; ctx.fillText(caption, 840, 2090, 1450);
      ctx.font = '24px Arial, sans-serif'; ctx.fillText(url, 840, 2230, 1450);
      const pdf = await PDFDocument.create();
      pdf.setTitle(`ESX QR - ${username || 'Chat'}`);
      const page = pdf.addPage([595.28, 841.89]);
      const image = await pdf.embedPng(canvas.toDataURL('image/png'));
      page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
      const bytes = await pdf.save();
      const objectUrl = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `ESX-QR${username ? '-' + username.replace(/[^a-zA-Z0-9_-]/g, '_') : ''}.pdf`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      setStatus(c('Не удалось скачать PDF. Попробуйте ещё раз или нажмите «Распечатать».', 'Could not download the PDF. Try again or use Print.'));
    } finally { setBusy(false); }
  }

  return <>
    <div className="account-qr"><QRCodeSVG value={url} size={240} level="M" marginSize={4} title={title} /></div>
    <a className="account-link" href={url}>{url}</a>
    <div className="account-actions">
      <button onClick={async () => { try { await navigator.clipboard.writeText(url); setStatus(c('Ссылка скопирована.', 'Link copied.')); } catch { setStatus(c('Скопируйте ссылку под QR-кодом вручную.', 'Copy the link below the QR code manually.')); } }}>{c('Скопировать ссылку', 'Copy link')}</button>
      <button onClick={async () => { try { await loadLogo(); window.print(); } catch { setStatus(c('Не удалось загрузить логотип. Попробуйте ещё раз.', 'Could not load the logo. Please try again.')); } }}>{c('Распечатать', 'Print')}</button>
      <button onClick={download} disabled={busy}>{busy ? c('Создаём PDF…', 'Creating PDF…') : c('Скачать PDF', 'Download PDF')}</button>
    </div>
    <p role="status" className="account-status">{status}</p>
    <div hidden aria-hidden="true"><QRCodeCanvas ref={qrCanvas} value={url} size={1024} level="M" marginSize={4} /></div>
    <section className="account-qr-print" aria-label={title}>
      <Image className="qr-print-logo" src="/esx-logo.png" alt="ESX" width={140} height={140} loading="eager" unoptimized />
      <div className="qr-print-languages">{languages.map(({ code }) => <p key={code} lang={code}>{translatorLabels[code]}</p>)}</div>
      {username && <p className="qr-print-login" dir="auto">{username}</p>}
      <QRCodeSVG value={url} size={400} level="M" marginSize={4} title={title} />
      <h2>{instruction}</h2><p>{caption}</p><p className="qr-print-url">{url}</p>
    </section>
  </>;
}
