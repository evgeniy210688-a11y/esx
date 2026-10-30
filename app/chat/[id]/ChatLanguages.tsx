"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { chatLabels } from "./chatLabels";
import { languages, type Language } from "@/app/design/content";

const languageFlags: Record<Language, string> = { ru: "ru", ko: "kr", en: "gb", zh: "cn", tr: "tr", vi: "vn", km: "kh", kk: "kz" };

function validLanguage(value: unknown): value is Language {
  return languages.some((language) => language.code === value);
}

export default function ChatLanguages({ chatId, value, onMineChange }: { chatId: string; value?: Language | null; onMineChange: (language: Language) => void }) {
  const [mine, setMine] = useState<Language>("en");
  const pickerRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const selectedId = useId();
  const storageKey = `esx-chat-languages:${chatId}`;

  useEffect(() => {
    let restored: Language = "en";
    try {
      const preferred = localStorage.getItem("esx-language");
      if (validLanguage(preferred)) restored = preferred;
    } catch {}
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (validLanguage(saved?.mine)) restored = saved.mine;
    } catch {}
    // Restore preferences only after hydration; keep selection usable without storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMine(restored);
    onMineChange(restored);
  }, [storageKey, onMineChange]);
  useEffect(() => {
    if (value) {
      // Keep the header in sync with the language menu in the bottom toolbar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMine(value);
    }
  }, [value]);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const picker = pickerRef.current;
      if (picker?.open && event.target instanceof Node && !picker.contains(event.target)) {
        picker.open = false;
      }
    };
    document.addEventListener("pointerdown", closeOutside, true);
    return () => document.removeEventListener("pointerdown", closeOutside, true);
  }, []);

  function save(nextMine: Language) {
    setMine(nextMine);
    onMineChange(nextMine);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ mine: nextMine }));
    } catch {}
  }

  const selectedLanguage = languages.find((language) => language.code === mine)!;

  return (
          <details ref={pickerRef} id="chat-language-panel" className="chat-language-picker chat-header-picker" onBlur={(event) => {
            // Touch browsers can blur the summary without focusing the tapped option.
            // Keep options mounted until their click handler applies the language.
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
          }} onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              if (pickerRef.current) pickerRef.current.open = false;
              summaryRef.current?.focus();
            }
          }}>
            <summary ref={summaryRef} aria-label={`${chatLabels[mine][0]}: ${selectedLanguage.name}`}>
              <Image src={`/flags/${languageFlags[mine]}.svg`} width={24} height={16} alt="" />
              <span id={selectedId}>{selectedLanguage.name}</span>
              <span className="chat-language-chevron" aria-hidden="true">⌄</span>
            </summary>
            <ul aria-label={chatLabels[mine][0]}>
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
  );
}
