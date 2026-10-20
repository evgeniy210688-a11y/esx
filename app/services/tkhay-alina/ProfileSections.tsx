'use client';

import { useState, type ReactNode } from 'react';

const labels = ['Услуги', 'Контакты', 'Наш адрес'];

export default function ProfileSections({ children }: { children: ReactNode[] }) {
  const [active, setActive] = useState<number | null>(null);
  return <div className="specialist-sections">
    <div className="specialist-actions">
      {labels.map((label, index) => <button
        key={label} type="button" id={`profile-section-button-${index}`}
        aria-expanded={active === index} aria-controls={`profile-section-${index}`}
        onClick={() => setActive(current => current === index ? null : index)}
      >{label}<span aria-hidden="true">{active === index ? '▴' : '▾'}</span></button>)}
    </div>
    {children.map((content, index) => <div
      key={index} id={`profile-section-${index}`} className="profile-section-panel"
      role="region" aria-labelledby={`profile-section-button-${index}`}
      data-open={active === index} aria-hidden={active !== index} inert={active !== index}
    ><div className="profile-section-inner"><div className="profile-section-content">{content}</div></div></div>)}
  </div>;
}
