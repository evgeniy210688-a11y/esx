"use client";

import { useSyncExternalStore } from "react";

const labels: Record<string, string> = {
  ru: "Главная страница", en: "Home page", ko: "홈으로", zh: "返回首页",
  tr: "Ana sayfa", vi: "Trang chủ", km: "ទំព័រដើម", kk: "Басты бет",
};
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
function getLanguage() {
  try { return localStorage.getItem("esx-language") || "ru"; }
  catch { return "ru"; }
}
export default function HomeLink() {
  const language = useSyncExternalStore(subscribe, getLanguage, () => "ru");
  return (
    <a href="/design" lang={language} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
      <span aria-hidden="true">←</span>{labels[language] || labels.ru}
    </a>
  );
}
