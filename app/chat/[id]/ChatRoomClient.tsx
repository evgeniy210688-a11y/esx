"use client";
import MessageActions from '@/app/components/MessageActions';
import Image from 'next/image';
import { privateChatLabels } from '@/app/messages/[id]/privateChatLabels';
import FoxStickerPicker, { FoxStickerImage } from '@/app/components/FoxStickers';
import { getFoxSticker } from '@/lib/fox-stickers';
import ChatShortcuts from "../ChatShortcuts";
import ChatMenu from "../ChatMenu";
import useChatBackground from "../useChatBackground";
import "../chat-theme.css";

import SiteHeader from "@/app/design/SiteHeader";

import ChatLanguages from "./ChatLanguages";
import GuestExpiryNotice from "./GuestExpiryNotice";
import { chatLabels } from "./chatLabels";
import MessageTranslation from "./MessageTranslation";
import type { Language } from "@/app/design/content";
import ChatQrCode from "./ChatQrCode";
import useChatInterface from "./useChatInterface";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ensureChatSession } from "@/lib/guest-session";

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
  const { background, setBackground } = useChatBackground();
  const messageList = useRef<HTMLElement>(null);
  const sendLock = useRef(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [translationLanguage, setTranslationLanguage] = useState<Language | null>(null);
  const [ownMessageIds, setOwnMessageIds] = useState<Set<number | string>>(new Set());
  const [editableIds, setEditableIds] = useState<Set<string>>(new Set());
  const { language, text: ui } = useChatInterface(translationLanguage);

  useEffect(() => {
    const list = messageList.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  // Загружаем сообщения и подключаем Realtime
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function startChat() {
      try {
        await ensureChatSession();
      } catch {
        if (!cancelled) {
          setLoading(false);
          alert("Не удалось подключиться к чату. Проверьте соединение и повторите отправку.");
        }
        return;
      }
      if (cancelled) return;
      try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(`esx-tab-own-messages:${chatId}`) || "[]");
        setOwnMessageIds(new Set(Array.isArray(stored) ? stored.filter((id): id is number | string => typeof id === "number" || typeof id === "string") : []));
      } catch {
        setOwnMessageIds(new Set());
      }

      const ownership = await supabase.rpc('esx_owned_messages', { room_id: chatId });
      if (cancelled) return;
      if (!ownership.error) {
        const ids = (ownership.data ?? []).map((row: { message_id: string }) => String(row.message_id));
        setEditableIds(new Set(ids));
        setOwnMessageIds(current => new Set([...current, ...ids, ...ids.filter((id: string) => /^\d+$/.test(id)).map(Number)]));
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

  useEffect(() => {
    let stopped = false;
    let busy = false;
    async function syncMessages() {
      if (busy || document.hidden) return;
      busy = true;
      try {
        await ensureChatSession();
        const { data, error } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
        if (!stopped && !error) setMessages((data ?? []) as Message[]);
      } catch { /* Keep the current history on transient connection failures. */ }
      finally { busy = false; }
    }
    const timer = window.setInterval(() => { void syncMessages(); }, 3000);
    window.addEventListener('focus', syncMessages);
    document.addEventListener('visibilitychange', syncMessages);
    return () => { stopped = true; clearInterval(timer); window.removeEventListener('focus', syncMessages); document.removeEventListener('visibilitychange', syncMessages); };
  }, [chatId]);
  // Отправка сообщения
  async function sendMessage(sticker?: string): Promise<boolean> {
    const text = sticker ?? message.trim();

    if (!text || sendLock.current) return false;
    sendLock.current = true; setSending(true);
    try {



    await ensureChatSession();
    if (!sticker && text === '/clear') {
      const { error } = await supabase.rpc('esx_clear_chat', { room_id: chatId, private_chat: false });
      if (error) throw error;
      setMessages([]); setOwnMessageIds(new Set()); setMessage('');
      try { sessionStorage.removeItem(`esx-tab-own-messages:${chatId}`); } catch {}
      return true;
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

      return false;
    }



    // Добавляем сообщение сразу на этом устройстве
    if (data && data.length > 0) {
      const newMessages = data as Message[];
      // Remember successful sends for immediate alignment; mutation ownership is checked by the database.
      // Keep ownership private to this tab, including after a reload.
      const owned = new Set(ownMessageIds);
      try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(`esx-tab-own-messages:${chatId}`) || "[]");
        if (Array.isArray(stored)) stored.forEach(id => { if (typeof id === "number" || typeof id === "string") owned.add(id); });
      } catch {}
      newMessages.forEach(item => owned.add(item.id));
      setEditableIds(current => new Set([...current, ...newMessages.map(item => String(item.id))]));
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

    if (!sticker) setMessage("");
    return true;
    } catch { alert("Не удалось отправить сообщение. Попробуйте ещё раз."); return false; }
    finally { sendLock.current = false; setSending(false); }
  }

  return (
    <main lang={language} data-chat-background={background ?? undefined} className="chat-theme flex min-h-screen flex-col">

        <div className="esx-site chat-site-header"><SiteHeader language={language} actions={<div className="chat-header-actions"><ChatQrCode chatId={chatId} language={language} /><ChatMenu language={language} background={background} onBackgroundChange={setBackground} /></div>} /></div>

      <div className="chat-shell mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <details id="chat-language-panel" className="chat-language-panel"><summary><svg className="chat-language-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6.5h14M5 17.5h14" /></svg>{chatLabels[language][0]}</summary><ChatLanguages key={chatId} chatId={chatId} onMineChange={setTranslationLanguage} /></details>

        {/* Messages */}
        <section ref={messageList} className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-6">

          {loading ? (
            <div className="flex flex-1 items-center justify-center text-zinc-400">
              {ui.loading}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-zinc-400">
              <GuestExpiryNotice language={language} />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-row ${ownMessageIds.has(msg.id) ? "chat-message-row-own" : ""}`}
              >
                {!ownMessageIds.has(msg.id) && <span className="chat-message-avatar" aria-hidden="true">{msg.sender_login ? Array.from(msg.sender_login)[0]?.toLocaleUpperCase() : <Image src="/esx-fox-mascot.webp" alt="" width={40} height={40} />}</span>}
<div className="chat-message-content">
{!ownMessageIds.has(msg.id) && <strong className="chat-sender" dir="auto">{msg.sender_login || privateChatLabels[language].guest}</strong>}
<MessageActions chatId={chatId} messageId={msg.id} message={msg.message} own={editableIds.has(String(msg.id))} sticker={Boolean(getFoxSticker(msg.message))} language={language} onChange={replacement => setMessages(current => replacement === null ? current.filter(item => item.id !== msg.id) : current.map(item => item.id === msg.id ? { ...item, message: replacement } : item))}>
<div className={`chat-message ${ownMessageIds.has(msg.id) ? "chat-message-own" : "chat-message-incoming"}`}>
                {getFoxSticker(msg.message) ? <FoxStickerImage id={getFoxSticker(msg.message)!} language={language} /> : ownMessageIds.has(msg.id) ? <span data-message-text dir="auto">{msg.message}</span>
                  : translationLanguage ? <MessageTranslation key={JSON.stringify([chatId, msg.id, translationLanguage, msg.message])} chatId={chatId} messageId={msg.id} target={translationLanguage} language={translationLanguage} />
                  : <span>{ui.loading}</span>}</div></MessageActions></div>
              </div>
            ))
          )}

        </section>

        {/* Input */}
        <div className="chat-composer border-t p-4">
          <div className="flex gap-3">
            <FoxStickerPicker language={language} disabled={sending} onSend={sendMessage} />

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
              disabled={sending || !message.trim()}
              onClick={() => void sendMessage()}
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
