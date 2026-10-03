"use client";

import { useSyncExternalStore } from 'react';

export const backgroundColors = ['blue', 'pink', 'gray', 'black'] as const;
export type ChatBackground = typeof backgroundColors[number];
const storageKey = 'esx-chat-background';
const changeEvent = 'esx-chat-background-change';
function readBackground(): ChatBackground | null {
  try {
    const value = localStorage.getItem(storageKey);
    return backgroundColors.includes(value as ChatBackground) ? value as ChatBackground : null;
  } catch { return null; }
}
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(changeEvent, callback);
  };
}
let temporaryBackground: ChatBackground | null = null;
const snapshot = () => temporaryBackground ?? readBackground();
const serverSnapshot = () => null;
export default function useChatBackground() {
  const background = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  function setBackground(value: ChatBackground) {
    try { localStorage.setItem(storageKey, value); temporaryBackground = null; }
    catch { temporaryBackground = value; }
    window.dispatchEvent(new Event(changeEvent));
  }
  return { background, setBackground };
}
