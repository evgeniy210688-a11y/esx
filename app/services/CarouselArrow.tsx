"use client";
import { useEffect, useRef, type RefObject, type ReactNode } from 'react';

export default function CarouselArrow({ track, direction, onStep, label, controls, children }: {
  track: RefObject<HTMLDivElement | null>; direction: number; onStep: () => void;
  label: string; controls?: string; children: ReactNode;
}) {
  const stopRef = useRef<(() => void) | null>(null);
  const held = useRef(false);
  useEffect(() => () => stopRef.current?.(), []);
  return <button type="button" aria-label={label} aria-controls={controls}
    style={{ touchAction: 'none', userSelect: 'none' }}
    onContextMenu={event => event.preventDefault()}
    onPointerDown={event => {
      if (event.button !== 0) return;
      stopRef.current?.();
      held.current = false;
      const element = track.current;
      if (!element) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      let frame = 0;
      let previous = 0;
      const snap = element.style.scrollSnapType;
      const behavior = element.style.scrollBehavior;
      element.dataset.arrowHeld = 'true';
      const timer = window.setTimeout(() => {
        held.current = true;
        element.style.scrollSnapType = 'none';
        element.style.scrollBehavior = 'auto';
        const animate = (now: number) => {
          if (previous) element.scrollLeft += direction * Math.min(now - previous, 50) * 0.4;
          previous = now;
          frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      }, 220);
      const stop = () => {
        clearTimeout(timer);
        cancelAnimationFrame(frame);
        element.style.scrollSnapType = snap;
        element.style.scrollBehavior = behavior;
        delete element.dataset.arrowHeld;
        window.removeEventListener('blur', stop);
        document.removeEventListener('visibilitychange', stop);
        stopRef.current = null;
      };
      stopRef.current = stop;
      window.addEventListener('blur', stop);
      document.addEventListener('visibilitychange', stop);
    }}
    onPointerUp={() => stopRef.current?.()}
    onPointerCancel={() => stopRef.current?.()}
    onLostPointerCapture={() => stopRef.current?.()}
    onClick={event => { if (!held.current || event.detail === 0) onStep(); held.current = false; }}
  >{children}</button>;
}
