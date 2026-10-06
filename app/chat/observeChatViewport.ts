// Keep the conversation inside the visible viewport when a mobile keyboard opens.
export default function observeChatViewport(root: HTMLElement, list: HTMLElement) {
  const viewport = window.visualViewport;
  let following = true;
  let frame = 0;
  const onScroll = () => {
    following = list.scrollHeight - list.clientHeight - list.scrollTop < 48;
  };
  const follow = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (following) list.scrollTop = list.scrollHeight;
    });
  };
  const resizeViewport = () => {
    // Retain CSS dvh sizing during pinch zoom.
    if (viewport && viewport.scale === 1) root.style.height = viewport.height + 'px';
    else root.style.removeProperty('height');
    follow();
  };
  const observer = new ResizeObserver(follow);
  const observeMessages = () => {
    observer.disconnect();
    observer.observe(list);
    for (const child of list.children) observer.observe(child);
    follow();
  };
  const mutations = new MutationObserver(observeMessages);
  mutations.observe(list, { childList: true });
  list.addEventListener('scroll', onScroll, { passive: true });
  viewport?.addEventListener('resize', resizeViewport);
  window.addEventListener('resize', resizeViewport);
  observeMessages();
  resizeViewport();
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    mutations.disconnect();
    list.removeEventListener('scroll', onScroll);
    viewport?.removeEventListener('resize', resizeViewport);
    window.removeEventListener('resize', resizeViewport);
    root.style.removeProperty('height');
  };
}
