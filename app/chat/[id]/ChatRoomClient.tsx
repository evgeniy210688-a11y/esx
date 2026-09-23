"use client";
import ChatShortcuts from "../ChatShortcuts";
import "../chat-theme.css";

import Image from "next/image";
import Link from "next/link";
import ChatLanguages from "./ChatLanguages";
import { chatLabels } from "./chatLabels";
import MessageTranslation from "./MessageTranslation";
import type { Language } from "@/app/design/content";
import ChatQrCode from "./ChatQrCode";
import useChatInterface from "./useChatInterface";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: number | string;
  chat_id: string;
  message: string;
  created_at: string;
  sender_login?: string | null;
};

export default function ChatRoomClient({
  chatId,
}: {
  chatId: string;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [translationLanguage, setTranslationLanguage] = useState<Language | null>(null);
  const [ownMessageIds, setOwnMessageIds] = useState<Set<number | string>>(new Set());
  const { language, text: ui } = useChatInterface(translationLanguage);

  // Загружаем сообщения и подключаем Realtime
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function startChat() {
      try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(`esx-tab-own-messages:${chatId}`) || "[]");
        setOwnMessageIds(new Set(Array.isArray(stored) ? stored.filter((id): id is number | string => typeof id === "number" || typeof id === "string") : []));
      } catch {
        setOwnMessageIds(new Set());
      }

      // Загружаем существующие сообщения
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", {
          ascending: true,
        });

      if (cancelled) return;

      if (error) {
        console.error("LOAD ERROR:", error);
        alert(`Ошибка загрузки: ${error.message}`);
      } else {

        setMessages((data || []) as Message[]);
      }

      setLoading(false);

      // Создаём канал Realtime
      channel = supabase.channel(`chat-${chatId}`);

      // ВАЖНО:
      // Сначала .on()
      // Потом .subscribe()
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {


          const newMessage = payload.new as Message;

          setMessages((current) => {
            // Не добавляем одно сообщение два раза
            if (
              current.some(
                (item) => item.id === newMessage.id
              )
            ) {
              return current;
            }

            return [...current, newMessage];
          });
        }
      );

      // Подключаемся после добавления обработчика
      channel.subscribe((status) => {
        console.log("REALTIME STATUS:", status);
      });
    }

    startChat();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [chatId]);

  // Отправка сообщения
  async function sendMessage() {
    const text = message.trim();

    if (!text) {
      return;
    }



    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        message: text,
      })
      .select();

    if (error) {
      console.error("SEND ERROR:", error);

      alert(`Ошибка отправки:\n${error.message}`);

      return;
    }



    // Добавляем сообщение сразу на этом устройстве
    if (data && data.length > 0) {
      const newMessages = data as Message[];
      // The database has no sender column; remember successful sends locally.
      // Keep ownership private to this tab, including after a reload.
      const owned = new Set(ownMessageIds);
      try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(`esx-tab-own-messages:${chatId}`) || "[]");
        if (Array.isArray(stored)) stored.forEach(id => { if (typeof id === "number" || typeof id === "string") owned.add(id); });
      } catch {}
      newMessages.forEach(item => owned.add(item.id));
      setOwnMessageIds(owned);
      try { sessionStorage.setItem(`esx-tab-own-messages:${chatId}`, JSON.stringify([...owned])); } catch {}

      setMessages((current) => {
        const result = [...current];

        for (const newMessage of newMessages) {
          if (
            !result.some(
              (item) => item.id === newMessage.id
            )
          ) {
            result.push(newMessage);
          }
        }

        return result;
      });
    }

    setMessage("");
  }

  return (
    <main lang={language} className="chat-theme flex min-h-screen flex-col">

        {/* Header */}
        <header className="chat-header flex w-full shrink-0 items-center justify-between border-b px-6 py-5">
          <Link
            href="/"
            className="mr-4 shrink-0"
          >
            <Image src="/esx-logo.png" alt="ESX" width={64} height={64} className="rounded-xl" />
          </Link>

          <div className="min-w-0 text-right">
            <ChatQrCode chatId={chatId} language={language} />
          </div>
        </header>

      <div className="chat-shell mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <details id="chat-language-panel" className="chat-language-panel"><summary>{chatLabels[language][0]}</summary><ChatLanguages key={chatId} chatId={chatId} onMineChange={setTranslationLanguage} /></details>

        {/* Messages */}
        <section className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-6">

          {loading ? (
            <div className="flex flex-1 items-center justify-center text-zinc-400">
              {ui.loading}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-zinc-400">
              <div>
                <p className="text-lg font-medium">
                  {ui.empty}
                </p>

                <p className="mt-2 text-sm">
                  {ui.first}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${ownMessageIds.has(msg.id) ? "chat-message-own" : "chat-message-incoming"}`}
              >
                {msg.sender_login && <strong className="block text-sm mb-1" dir="auto">{msg.sender_login}</strong>}
                {ownMessageIds.has(msg.id) ? <span dir="auto">{msg.message}</span>
                  : translationLanguage ? <MessageTranslation key={`${chatId}:${msg.id}:${translationLanguage}`} chatId={chatId} messageId={msg.id} target={translationLanguage} language={translationLanguage} />
                  : <span>{ui.loading}</span>}
              </div>
            ))
          )}

        </section>

        {/* Input */}
        <div className="chat-composer border-t p-4">
          <div className="flex gap-3">

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder={ui.placeholder}
              aria-label={ui.placeholder}
              className="min-w-0 flex-1 rounded-full border border-zinc-200 px-5 py-3 outline-none focus:border-black"
            />

            <button
              type="button"
              onClick={sendMessage}
              style={{
                position: "relative",
                zIndex: 9999,
                cursor: "pointer",
                touchAction: "manipulation",
              }}
              className="shrink-0 rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-zinc-800"
            >
              {ui.send}
            </button>

          </div>
        </div>

      </div>
      <ChatShortcuts language={language} />
    </main>
  );
}
