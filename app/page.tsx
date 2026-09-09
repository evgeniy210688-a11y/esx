"use client";

import HomeLink from "@/app/components/HomeLink";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ChatPage() {
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 10);
    setRoomId(id);
  }, []);

  const chatLink =
    roomId && typeof window !== "undefined"
      ? `${window.location.origin}/chat/${roomId}`
      : "";

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8">

        <header className="flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            ESX
          </div>

          <div className="text-sm text-zinc-400">
            Private Chat
          </div>
        </header>
        <nav aria-label="Home" className="px-6 py-3"><HomeLink /></nav>

        <section className="flex flex-1 flex-col items-center justify-center text-center">

          <h1 className="text-3xl font-bold sm:text-4xl">
            Your private chat
          </h1>

          <p className="mt-3 max-w-md text-zinc-500">
            Scan this QR code with another phone to join the chat.
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg">
            {chatLink && (
              <QRCodeSVG
                value={chatLink}
                size={240}
                level="M"
              />
            )}
          </div>

          <p className="mt-6 text-sm text-zinc-400">
            Chat ID
          </p>

          <div className="mt-1 rounded-lg bg-zinc-100 px-4 py-2 font-mono text-sm">
            {roomId || "Creating..."}
          </div>

          {chatLink && (
            <a href={chatLink} className="mt-6 font-semibold underline">
              Open chat
            </a>
          )}

          <button
            disabled={!chatLink}
            className="mt-8 rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-zinc-800"
            onClick={() => {
              navigator.clipboard.writeText(chatLink);
            }}
          >
            Copy invite link
          </button>

        </section>

        <footer className="py-6 text-center text-xs text-zinc-400">
          ESX · Private communication
        </footer>

      </div>
    </main>
  );
}
