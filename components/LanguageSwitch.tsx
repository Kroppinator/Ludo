'use client';

import { LANGUAGES, useI18n } from '@/lib/i18n';

export default function LanguageSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex gap-1 rounded-lg bg-stone-200 p-1">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition ${
            lang === l.code ? 'bg-white shadow text-stone-800' : 'text-stone-500'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
