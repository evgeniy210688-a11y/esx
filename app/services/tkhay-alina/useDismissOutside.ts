'use client';

import { useEffect, useRef } from 'react';

export default function useDismissOutside<T extends HTMLElement>(dismiss: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.target instanceof Node && ref.current && !ref.current.contains(event.target)) {
        dismiss();
      }
    }
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [dismiss]);
  return ref;
}
