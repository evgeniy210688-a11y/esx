'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/design/SiteHeader';
import { languages, type Language } from '@/app/design/content';

import { qrLink } from '@/lib/qr-link';
import { scanLabels } from './labels';
import './scan.css';

const closeLabels: Record<Language, string> = { en: 'Close', ru: 'Закрыть', ko: '닫기', zh: '关闭', tr: 'Kapat', vi: 'Đóng', km: 'បិទ', kk: 'Жабу' };

export default function ScanPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState<'camera' | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const frame = useRef(0);
  const generation = useRef(0);
  const t = scanLabels[language];
  const link = qrLink(result);

  const release = useCallback(() => {
    generation.current++;
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }, []);
  const stop = useCallback(() => { release(); setActive(false); setBusy(false); }, [release]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('esx-language');
      // Restore the site's saved language after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (languages.some(item => item.code === saved)) setLanguage(saved as Language);
    } catch {}
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', stop);
    return () => {
      release();
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', stop);
    };
  }, [release, stop]);

  function decode(source: CanvasImageSource, width: number, height: number, canvas: HTMLCanvasElement) {
    const scale = Math.min(1, 960 / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' })?.data;
  }

  async function start() {
    stop(); setBusy(true); setError(null); setResult('');
    const run = generation.current;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } } });
      if (run !== generation.current) { media.getTracks().forEach(track => track.stop()); return; }
      stream.current = media;
      const element = video.current;
      if (!element) { stop(); return; }
      element.srcObject = media;
      await element.play();
      if (run !== generation.current) return;
      setBusy(false); setActive(true);
      const canvas = document.createElement('canvas');
      let last = 0;
      const scan = (now: number) => {
        if (run !== generation.current) return;
        if (now - last > 150 && element.readyState >= 2 && element.videoWidth) {
          last = now;
          try {
            const value = decode(element, element.videoWidth, element.videoHeight, canvas);
            if (value) { stop(); setResult(value); return; }
          } catch { stop(); setError('camera'); return; }
        }
        frame.current = requestAnimationFrame(scan);
      };
      frame.current = requestAnimationFrame(scan);
    } catch { if (run === generation.current) { stop(); setError('camera'); } }
  }

  return <div className="esx-site qr-scan-page" lang={language}>
    <SiteHeader language={language} />
    <main className="qr-scan-card">
      <div className="qr-scan-heading"><h1>{t[0]}</h1><button type="button" className="qr-close" onClick={() => { stop(); if (window.history.length > 1) router.back(); else router.replace('/'); }}><span aria-hidden="true">×</span> {closeLabels[language]}</button></div>
      <p>{t[3]}</p>
      <video ref={video} className={active || busy ? 'qr-camera' : 'qr-camera qr-camera-idle'} autoPlay playsInline muted aria-label={t[0]} />
      <div className="qr-scan-actions">
        {active || busy ? <button onClick={stop}>{t[4]}</button> : <button onClick={() => void start()}>{t[1]}</button>}
      </div>
      {error && <p role="alert">{t[5]}</p>}
      {result && <section aria-live="polite"><h2>{t[7]}</h2><p className="qr-result">{result}</p>{link && <a className="qr-open-link" href={link}>{t[8]}</a>}<button onClick={() => { setResult(''); void start(); }}>{t[9]}</button></section>}
    </main>
  </div>;
}
