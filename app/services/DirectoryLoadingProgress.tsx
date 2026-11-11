"use client";

import { useEffect, useState } from 'react';
import type { InterfaceLanguage } from './serviceLabels';
import './directory-loading-progress.css';

const loadingLabels: Record<InterfaceLanguage, { loading: string; ready: string; label: string }> = {
  ru: { loading: 'Пожалуйста, подождите, загружается информация.', ready: 'Информация загружена', label: 'Загрузка информации' },
  en: { loading: 'Please wait, information is loading.', ready: 'Information loaded', label: 'Loading information' },
  ko: { loading: '정보를 불러오는 중입니다. 잠시 기다려 주세요.', ready: '정보를 불러왔습니다', label: '정보 불러오는 중' },
  uz: { loading: 'Iltimos, kuting, ma’lumotlar yuklanmoqda.', ready: 'Ma’lumotlar yuklandi', label: 'Ma’lumotlar yuklanmoqda' },
  zh: { loading: '正在加载信息，请稍候。', ready: '信息已加载', label: '正在加载信息' },
  vi: { loading: 'Vui lòng đợi, thông tin đang được tải.', ready: 'Đã tải thông tin', label: 'Đang tải thông tin' },
  tr: { loading: 'Lütfen bekleyin, bilgiler yükleniyor.', ready: 'Bilgiler yüklendi', label: 'Bilgiler yükleniyor' },
};

export default function DirectoryLoadingProgress({ status, progress, language }: { status: 'loading' | 'ready' | 'error'; progress: number; language: InterfaceLanguage }) {
  const labels = loadingLabels[language];
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
      <span role="status">{status === 'ready' ? labels.ready : labels.loading}</span>
      <strong aria-hidden="true">{progress}%</strong>
    </div>
    <div className="directory-loading-progress-track" role="progressbar" aria-label={labels.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      <span style={{ width: `${progress}%` }} />
    </div>
  </div>;
}
