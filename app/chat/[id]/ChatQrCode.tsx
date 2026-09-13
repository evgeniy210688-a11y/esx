"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ChatQrCode({ chatId }: { chatId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState("");

  function showCode() {
    setUrl(`${window.location.origin}/chat/${encodeURIComponent(chatId)}`);
    dialog.current?.showModal();
  }

  return <>
    <button type="button" onClick={showCode} className="mt-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100" aria-haspopup="dialog">
      QR-код
    </button>
    <dialog ref={dialog} aria-labelledby="chat-qr-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_32px)] max-w-sm overflow-y-auto rounded-3xl bg-white p-6 text-center text-zinc-900 shadow-xl backdrop:bg-black/50" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <h2 id="chat-qr-title" className="text-xl font-bold">Пригласить в этот чат</h2>
      <p className="mt-2 text-sm text-zinc-500">Покажите QR-код собеседнику. Отсканировав его камерой телефона, он сможет открыть этот чат.</p>
      {url && <QRCodeSVG value={url} size={256} level="M" marginSize={4} title="QR-код для подключения к этому чату" className="mx-auto my-5 h-auto w-full max-w-[256px]" />}
      <p className="break-all text-base text-zinc-500">Chat ID: {chatId}</p>
      <form method="dialog" className="mt-5"><button autoFocus className="w-full rounded-full bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Закрыть</button></form>
    </dialog>
  </>;
}
