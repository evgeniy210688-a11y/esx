"use client";

import HomeLink from "@/app/components/HomeLink";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ChatPage() {
  const [chatId, setChatId] = useState("");
  const [chatLink, setChatLink] = useState("");

  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 10);

    setChatId(id);
    setChatLink(`${window.location.origin}/chat/${id}`);
  }, []);

  const copyLink = async () => {
    if (!chatLink) return;

    await navigator.clipboard.writeText(chatLink);
    alert("Invite link copied!");
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <a
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            ESX
          </a>

          <span className="text-sm text-zinc-400">
            Private Chat
          </span>
        </header>
        <nav aria-label="Home" className="px-6 py-3"><HomeLink /></nav>

        {/* Chat creation */}
        <section className="flex flex-1 flex-col items-center justify-center text-center">

          <h1 className="text-3xl font-bold sm:text-4xl">
            Your private chat
          </h1>

          <p className="mt-4 max-w-md text-zinc-500">
            Scan this QR code with another phone to join the chat.
          </p>

          {/* QR */}
          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg">
            {chatLink ? (
              <QRCodeSVG
                value={chatLink}
                size={240}
                level="M"
              />
            ) : (
              <div className="flex h-[240px] w-[240px] items-center justify-center text-sm text-zinc-400">
                Creating QR code...
              </div>
            )}
          </div>

          {/* Chat ID */}
          <div className="mt-6">
            <p className="text-sm text-zinc-400">
              Chat ID
            </p>

            <p className="mt-1 font-mono text-lg font-semibold">
              {chatId || "Creating..."}
            </p>
          </div>

          {/* Copy */}
          {chatLink && (
            <a href={chatLink} className="mt-6 font-semibold underline">
              Open chat
            </a>
          )}
          <button
            onClick={copyLink}
            disabled={!chatLink}
            className="mt-6 rounded-full bg-black px-7 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy invite link
          </button>

        </section>

        <footer className="py-6 text-center text-base text-zinc-400">
          ESX · Private communication
        </footer>

      </div>
    </main>
  );
}
