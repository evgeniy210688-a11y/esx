"use client";

import { useRef, useState } from "react";
import type { Language } from "@/app/design/content";
import { chatLabels } from "./chatLabels";
import { QRCodeSVG } from "qrcode.react";

export default function ChatQrCode({ chatId, language }: { chatId: string; language: Language }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState("");

  function showCode() {
    setUrl(`${window.location.origin}/chat/${encodeURIComponent(chatId)}`);
    dialog.current?.showModal();
  }

  return <>
    <button type="button" onClick={showCode} className="mt-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100" aria-haspopup="dialog">
      {chatLabels[language][2]}
    </button>
    <dialog ref={dialog} aria-labelledby="chat-qr-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_32px)] max-w-sm overflow-y-auto rounded-3xl bg-white p-6 text-center text-zinc-900 shadow-xl backdrop:bg-black/50" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <h2 id="chat-qr-title" className="text-xl font-bold">{chatLabels[language][3]}</h2>
      <p className="mt-2 text-sm text-zinc-500">{chatLabels[language][4]}</p>
      {url && <QRCodeSVG value={url} size={256} level="M" marginSize={4} title={chatLabels[language][3]} className="mx-auto my-5 h-auto w-full max-w-[256px]" />}
      <form method="dialog" className="mt-5"><button autoFocus className="w-full rounded-full bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">{chatLabels[language][5]}</button></form>
    </dialog>
  </>;
}
