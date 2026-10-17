"use client";

import ShareChatLink from "@/app/components/ShareChatLink";
import { copy, languages, type Language } from '@/app/design/content';
import { accountLabels } from '@/app/account/accountLabels';
import QrLanguagePicker from './QrLanguagePicker';
import Link from 'next/link';

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from '@/lib/supabase';

export default function ChatPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [copyStatus, setCopyStatus] = useState<'linkCopied' | 'copyError' | ''>('');
  const t = accountLabels[language];
  useEffect(() => {
    try {
      const saved = localStorage.getItem('esx-language');
      if (languages.some(item => item.code === saved)) setLanguage(saved as Language);
    } catch {}
  }, []);
  function chooseLanguage(value: Language) {
    setLanguage(value);
    try { localStorage.setItem('esx-language', value); } catch {}
  }

  const [chatId, setChatId] = useState("");
  const [chatLink, setChatLink] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session && !session.user.is_anonymous) { window.location.replace('/account'); return; }
      const id = crypto.randomUUID();
      setChatId(id);
      setChatLink(`${window.location.origin}/chat/${id}`);
    });
    return () => { active = false; };
  }, []);

  const copyLink = async () => {
    if (!chatLink) return;

    try { await navigator.clipboard.writeText(chatLink); setCopyStatus('linkCopied'); } catch { setCopyStatus('copyError'); }
  };

  return (
    <main lang={language} className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            ESX
          </Link>

          <span className="text-sm text-zinc-400">
            {t.qrTitle}
          </span>
        </header>
        <nav aria-label={copy[language][44]} className="flex flex-wrap items-center justify-between gap-3 py-4"><Link href="/" className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800">← {copy[language][0]}</Link><QrLanguagePicker language={language} onChange={chooseLanguage} /></nav>

        {/* Chat creation */}
        <section className="flex flex-1 flex-col items-center justify-center text-center">

          <h1 className="text-3xl font-bold sm:text-4xl">
            {t.qrTitle}
          </h1>

          <p className="mt-4 max-w-md text-zinc-500">
            {t.qrHelp}
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
                {t.qrLoading}
              </div>
            )}
          </div>

          {/* Chat ID */}
          <div className="mt-6">
            <p className="text-sm text-zinc-400">
              {t.conversation} ID
            </p>

            <p className="mt-1 font-mono text-lg font-semibold">
              {chatId || t.qrLoading}
            </p>
          </div>

          {chatLink && <ShareChatLink url={chatLink} language={language} />}
          {/* Copy */}
          {chatLink && (
            <a href={chatLink} className="mt-6 font-semibold underline">
              {t.openChat}
            </a>
          )}
          <button
            onClick={copyLink}
            disabled={!chatLink}
            className="mt-6 rounded-full bg-black px-7 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.copyLink}
          </button>
          <p role="status" aria-live="polite">{copyStatus ? t[copyStatus] : ''}</p>

        </section>

        <footer className="py-6 text-center text-base text-zinc-400">
          ESX · {copy[language][5]}
        </footer>

      </div>
    </main>
  );
}
