"use client";

import { useEffect, useState } from "react";
import { languages, type Language } from "@/app/design/content";

function validLanguage(value: unknown): value is Language {
  return languages.some((language) => language.code === value);
}

export default function ChatLanguages({ chatId }: { chatId: string }) {
  const [mine, setMine] = useState<Language>("ru");
  const [partner, setPartner] = useState<Language | "">("");
  const storageKey = `esx-chat-languages:${chatId}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      const preferred = saved?.mine ?? localStorage.getItem("esx-language");
      // Restore preferences only after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMine(validLanguage(preferred) ? preferred : "ru");
      setPartner(validLanguage(saved?.partner) ? saved.partner : "");
    } catch {
      // The selectors still work when browser storage is unavailable.
    }
  }, [storageKey]);

  function save(nextMine: Language, nextPartner: Language | "") {
    setMine(nextMine);
    setPartner(nextPartner);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ mine: nextMine, partner: nextPartner }));
    } catch {}
  }

  const selectStyle = "mt-2 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <fieldset className="mx-4 mb-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:mx-6">
      <legend className="px-2 text-sm font-semibold text-zinc-900">Языки общения</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="min-w-0 text-sm font-medium text-zinc-700">
          Ваш язык
          <select value={mine} onChange={(event) => save(event.target.value as Language, partner)} className={selectStyle}>
            {languages.map((language) => <option key={language.code} value={language.code}>{language.name}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-sm font-medium text-zinc-700">
          Язык собеседника
          <select value={partner} onChange={(event) => save(mine, event.target.value as Language | "")} className={selectStyle}>
            <option value="" disabled>Выберите язык</option>
            {languages.map((language) => <option key={language.code} value={language.code}>{language.name}</option>)}
          </select>
        </label>
      </div>
    </fieldset>
  );
}
