'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import useDismissOutside from './useDismissOutside';
import { useProfileLanguage } from './ProfileLanguage';

const labels = ['Услуги', 'Контакты', 'Наш адрес'];

function Panel({ content, index, open, onCollapse }: { content: ReactNode; index: number; open: boolean; onCollapse: () => void }) {
  const {t} = useProfileLanguage();
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const node = inner.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setHeight(node.getBoundingClientRect().height));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div
    id={`profile-section-${index}`} className="profile-section-panel"
    role="region" aria-labelledby={`profile-section-button-${index}`}
    data-open={open} aria-hidden={!open} inert={!open}
    style={{ height: open ? height : 0 }}
  ><div ref={inner} className="profile-section-content">{content}{index === 0 && <button type="button" className="services-details-toggle profile-collapse-services" onClick={onCollapse} aria-label={t('Свернуть')}> {t('Свернуть')} <span aria-hidden="true">▴</span></button>}</div></div>;
}

export default function ProfileSections({ children }: { children: ReactNode[] }) {
  const {t} = useProfileLanguage();
  const [active, setActive] = useState<number | null>(null);
  const sectionRef = useDismissOutside<HTMLDivElement>(() => setActive(null));
  return <div ref={sectionRef} className="specialist-sections">
    <div className="specialist-actions">
      {labels.map((label, index) => <button
        key={label} type="button" id={`profile-section-button-${index}`}
        aria-expanded={active === index} aria-controls={`profile-section-${index}`}
        onClick={() => setActive(current => current === index ? null : index)}
      >{t(label)}<span aria-hidden="true">▾</span></button>)}
    </div>
    {children.map((content, index) => <Panel key={index} content={content} index={index} open={active === index} onCollapse={() => {
      setActive(null);
      const trigger = document.getElementById(`profile-section-button-${index}`);
      trigger?.focus({ preventScroll: true });
    }} />)}
  </div>;
}
