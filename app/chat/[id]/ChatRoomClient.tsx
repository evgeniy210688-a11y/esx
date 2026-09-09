"use client";

import HomeLink from "@/app/components/HomeLink";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: number;
  chat_id: string;
  message: string;
  created_at: string;
};

export default function ChatRoomClient({
  chatId,
}: {
  chatId: string;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем сообщения и подключаем Realtime
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function startChat() {
      console.log("CHAT ID:", chatId);

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
        console.log("MESSAGES:", data);
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
          console.log("NEW MESSAGE:", payload);

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

    console.log("SENDING:", text);

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

    console.log("SENT:", data);

    // Добавляем сообщение сразу на этом устройстве
    if (data && data.length > 0) {
      const newMessages = data as Message[];

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
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">

        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white px-6 py-5">
          <a
            href="/design"
            className="text-2xl font-bold"
          >
            ESX
          </a>

          <div className="min-w-0 text-right">
            <p className="text-xs text-zinc-400">
              Chat ID
            </p>

            <p className="max-w-[240px] break-all font-mono text-sm font-semibold">
              {chatId}
            </p>
          </div>
        </header>
        <nav aria-label="Home" className="px-6 py-3"><HomeLink /></nav>

        {/* Messages */}
        <section className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-6">

          {loading ? (
            <div className="flex flex-1 items-center justify-center text-zinc-400">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-zinc-400">
              <div>
                <p className="text-lg font-medium">
                  Your chat is empty
                </p>

                <p className="mt-2 text-sm">
                  Send your first message.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="ml-auto max-w-[80%] rounded-2xl bg-black px-4 py-3 text-white"
              >
                {msg.message}
              </div>
            ))
          )}

        </section>

        {/* Input */}
        <div className="border-t bg-white p-4">
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
              placeholder="Write a message..."
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
              Send
            </button>

          </div>
        </div>

      </div>
    </main>
  );
}