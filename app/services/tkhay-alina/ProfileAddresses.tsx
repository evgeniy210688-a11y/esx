'use client';

import { useState } from 'react';
import { useProfileLanguage } from './ProfileLanguage';

const incheonAddress = '인천 연수구 청학동 498, 우림빌딩 402호';

export default function ProfileAddresses({ paranAddress }: { paranAddress: string }) {
  const {t} = useProfileLanguage();
  const [selected, setSelected] = useState<'paran' | 'incheon'>('paran');
  const address = selected === 'paran' ? paranAddress.trim() : incheonAddress;
  return <div className="profile-addresses">
    <div className="profile-address-buttons" role="group" aria-label={t('Выберите офис')}>
      <button type="button" aria-pressed={selected === 'paran'} aria-controls="profile-office-address" onClick={() => setSelected('paran')}>{t('Паран')}</button>
      <button type="button" aria-pressed={selected === 'incheon'} aria-controls="profile-office-address" onClick={() => setSelected('incheon')}>{t('Инчхон')}</button>
    </div>
    <div id="profile-office-address" aria-live="polite" aria-atomic="true">
      <p>{address || t('Адрес пока не указан. Уточните его у специалиста.')}</p>
      {address && <div className="services-map-links">
        <a href={'https://map.kakao.com/link/search/' + encodeURIComponent(address)} target="_blank" rel="noopener noreferrer">Kakao Map ↗</a>
        <a href={'https://map.naver.com/p/search/' + encodeURIComponent(address)} target="_blank" rel="noopener noreferrer">Naver Map ↗</a>
      </div>}
    </div>
  </div>;
}
