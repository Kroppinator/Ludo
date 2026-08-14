'use client';

import { LANGUAGES, useI18n } from '@/lib/i18n';

export default function LanguageSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="disco-panel flex gap-1 rounded-lg p-1">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-md px-3 py-1 text-sm font-disco transition ${
            lang === l.code
              ? 'bg-neon-pink text-white shadow-[0_0_12px_rgba(255,45,155,0.6)]'
              : 'text-disco-muted'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
