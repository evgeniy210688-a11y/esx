import { useEffect, useRef, type ReactNode } from 'react';

export default function AnimatedPanel({ index, open, children }: { index: number; open: boolean; children: ReactNode }) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      const element = panel.current;
      if (element && element.getBoundingClientRect().bottom > window.innerHeight) {
        element.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      }
    }, 1020);
    return () => window.clearTimeout(timer);
  }, [open]);
  return <section ref={panel} id={`listing-panel-${index}`} role="region" aria-labelledby={`listing-button-${index}`} className="listing-animated-panel" data-open={open} aria-hidden={!open} inert={!open}>
    <div className="listing-panel-clip"><div className="profile-section-content">{children}</div></div>
  </section>;
}
