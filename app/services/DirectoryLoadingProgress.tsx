"use client";

import { useEffect, useState } from 'react';
import './directory-loading-progress.css';

export default function DirectoryLoadingProgress({ status, progress }: { status: 'loading' | 'ready' | 'error'; progress: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (status === 'loading') { setVisible(true); return; }
    if (status === 'error') { setVisible(false); return; }
    const timer = window.setTimeout(() => setVisible(false), 700);
    return () => window.clearTimeout(timer);
  }, [status]);

  if (!visible || status === 'error') return null;
  return <div className={`directory-loading-progress${status === 'ready' ? ' is-complete' : ''}`}>
    <div className="directory-loading-progress-copy">
      <span role="status">{status === 'ready' ? 'Информация загружена' : 'Пожалуйста, подождите, загружается информация.'}</span>
      <strong aria-hidden="true">{progress}%</strong>
    </div>
    <div className="directory-loading-progress-track" role="progressbar" aria-label="Загрузка информации" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      <span style={{ width: `${progress}%` }} />
    </div>
  </div>;
}
