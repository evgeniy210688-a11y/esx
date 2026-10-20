'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

const labels = ['Услуги', 'Контакты', 'Наш адрес'];

function Panel({ content, index, open }: { content: ReactNode; index: number; open: boolean }) {
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
  ><div ref={inner} className="profile-section-content">{content}</div></div>;
}

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
    {children.map((content, index) => <Panel key={index} content={content} index={index} open={active === index} />)}
  </div>;
}
