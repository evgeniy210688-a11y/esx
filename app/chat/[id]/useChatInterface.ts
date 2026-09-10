"use client";

import { useSyncExternalStore } from "react";
import { languages, type Language } from "@/app/design/content";

const text: Record<Language, { placeholder: string; send: string; loading: string; empty: string; first: string }> = {
  ru: { placeholder: "Написать сообщение…", send: "Отправить", loading: "Загрузка сообщений…", empty: "В чате пока нет сообщений", first: "Отправьте первое сообщение." },
  en: { placeholder: "Write a message…", send: "Send", loading: "Loading messages…", empty: "Your chat is empty", first: "Send your first message." },
  ko: { placeholder: "메시지를 입력하세요…", send: "보내기", loading: "메시지 불러오는 중…", empty: "아직 메시지가 없습니다", first: "첫 메시지를 보내보세요." },
  zh: { placeholder: "输入消息…", send: "发送", loading: "正在加载消息…", empty: "暂无消息", first: "发送第一条消息吧。" },
  tr: { placeholder: "Mesaj yazın…", send: "Gönder", loading: "Mesajlar yükleniyor…", empty: "Henüz mesaj yok", first: "İlk mesajınızı gönderin." },
  vi: { placeholder: "Nhập tin nhắn…", send: "Gửi", loading: "Đang tải tin nhắn…", empty: "Chưa có tin nhắn", first: "Hãy gửi tin nhắn đầu tiên." },
  km: { placeholder: "សរសេរសារ…", send: "ផ្ញើ", loading: "កំពុងផ្ទុកសារ…", empty: "មិនទាន់មានសារទេ", first: "ផ្ញើសារដំបូងរបស់អ្នក។" },
  kk: { placeholder: "Хабарлама жазыңыз…", send: "Жіберу", loading: "Хабарламалар жүктелуде…", empty: "Чатта әзірге хабарлама жоқ", first: "Алғашқы хабарламаңызды жіберіңіз." },
};

function subscribe(update: () => void) {
  window.addEventListener("storage", update);
  return () => window.removeEventListener("storage", update);
}
function getLanguage(): Language {
  try {
    const value = localStorage.getItem("esx-language");
    return languages.find(language => language.code === value)?.code ?? "ru";
  } catch { return "ru"; }
}
export default function useChatInterface() {
  const language = useSyncExternalStore(subscribe, getLanguage, () => "ru" as Language);
  return { language, text: text[language] };
}
