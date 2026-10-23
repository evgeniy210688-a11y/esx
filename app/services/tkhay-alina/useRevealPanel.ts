'use client';

import { useEffect } from 'react';

// Recheck after the accordion settles: a closing sibling can move the new panel.
export default function useRevealPanel(panelId: string | null) {
  useEffect(() => {
    if (!panelId) return;
    let cancelled = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function reveal() {
      const panel = document.getElementById(panelId!);
      if (cancelled || !panel || panel.getAttribute('aria-hidden') === 'true') return;
      const rect = panel.getBoundingClientRect();
      const viewport = window.visualViewport?.height ?? window.innerHeight;
      // Keep context when the beginning of the expanded content is already visible.
      if (rect.top >= 24 && rect.top + Math.min(rect.height, 200) <= viewport - 24) return;
      panel.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    }
    const first = window.setTimeout(reveal, reduced ? 0 : 120);
    const settled = window.setTimeout(reveal, 1900);
    const cancel = () => { cancelled = true; };
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    return () => {
      window.clearTimeout(first); window.clearTimeout(settled);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [panelId]);
}
