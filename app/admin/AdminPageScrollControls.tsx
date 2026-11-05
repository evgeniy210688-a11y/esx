'use client';

export default function AdminPageScrollControls() {
  function scrollToEdge(bottom: boolean) {
    window.scrollTo({
      top: bottom ? document.documentElement.scrollHeight : 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  return <nav className="admin-page-scroll" aria-label="Прокрутка страницы">
    <button type="button" aria-label="Вверх страницы" title="Вверх страницы" onClick={() => scrollToEdge(false)}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 11L12 5L18 11M12 5V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
    <button type="button" aria-label="Вниз страницы" title="Вниз страницы" onClick={() => scrollToEdge(true)}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 13L12 19L18 13M12 19V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  </nav>;
}
