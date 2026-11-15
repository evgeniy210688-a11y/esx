// Leave native touch scrolling and its momentum in control of scrollLeft.
export function guardCarouselTouch(track: HTMLElement, pause: () => void, now = () => performance.now()) {
  let touching = false;
  let settleAt = 0;
  const isActive = () => touching || now() < settleAt;
  const hold = () => { settleAt = now() + 250; pause(); };
  const start = () => { touching = true; hold(); };
  const end = (event: TouchEvent) => { touching = event.touches.length > 0; hold(); };
  const scroll = () => { if (isActive()) hold(); };
  track.addEventListener('touchstart', start, { passive: true });
  track.addEventListener('touchend', end, { passive: true });
  track.addEventListener('touchcancel', end, { passive: true });
  track.addEventListener('scroll', scroll, { passive: true });
  return { isActive, dispose() {
    track.removeEventListener('touchstart', start);
    track.removeEventListener('touchend', end);
    track.removeEventListener('touchcancel', end);
    track.removeEventListener('scroll', scroll);
  } };
}
