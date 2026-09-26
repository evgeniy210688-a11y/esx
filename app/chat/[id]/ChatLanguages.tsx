"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { chatLabels } from "./chatLabels";
import { languages, type Language } from "@/app/design/content";

const languageFlags: Record<Language, string> = { ru: "ru", ko: "kr", en: "gb", zh: "cn", tr: "tr", vi: "vn", km: "kh", kk: "kz" };

function validLanguage(value: unknown): value is Language {
  return languages.some((language) => language.code === value);
}

export default function ChatLanguages({ chatId, onMineChange }: { chatId: string; onMineChange: (language: Language) => void }) {
  const [mine, setMine] = useState<Language>("ru");
  const pickerRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const labelId = useId();
  const selectedId = useId();
  const storageKey = `esx-chat-languages:${chatId}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      const preferred = saved?.mine ?? localStorage.getItem("esx-language");
      // Restore preferences only after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMine(validLanguage(preferred) ? preferred : "ru");
      onMineChange(validLanguage(preferred) ? preferred : "ru");
    } catch {
      onMineChange("ru");
      // The selectors still work when browser storage is unavailable.
    }
  }, [storageKey, onMineChange]);

  function save(nextMine: Language) {
    setMine(nextMine);
    onMineChange(nextMine);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ mine: nextMine }));
    } catch {}
  }

  const selectedLanguage = languages.find((language) => language.code === mine)!;

  return (
    <fieldset className="mx-4 mb-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:mx-6">
      <legend className="px-2 text-sm font-semibold text-zinc-900">{chatLabels[mine][0]}</legend>
      <div className="grid grid-cols-1 gap-4">
        <div className="min-w-0 text-sm font-medium text-zinc-700">
          <span id={labelId}>{chatLabels[mine][1]}</span>
          <details ref={pickerRef} className="chat-language-picker" onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
          }} onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              if (pickerRef.current) pickerRef.current.open = false;
              summaryRef.current?.focus();
            }
          }}>
            <summary ref={summaryRef} aria-labelledby={`${labelId} ${selectedId}`}>
              <Image src={`/flags/${languageFlags[mine]}.svg`} width={24} height={16} alt="" />
              <span id={selectedId}>{selectedLanguage.name}</span>
              <span className="chat-language-chevron" aria-hidden="true">⌄</span>
            </summary>
            <ul aria-labelledby={labelId}>
              {languages.map((language) => <li key={language.code}>
                <button type="button" aria-pressed={mine === language.code} onClick={() => {
                  save(language.code);
                  if (pickerRef.current) pickerRef.current.open = false;
                  summaryRef.current?.focus();
                }}>
                  <Image src={`/flags/${languageFlags[language.code]}.svg`} width={24} height={16} alt="" />
                  <span lang={language.code}>{language.name}</span>
                  {mine === language.code && <span className="chat-language-check" aria-hidden="true">✓</span>}
                </button>
              </li>)}
            </ul>
          </details>
        </div>

      </div>
    </fieldset>
  );
}
