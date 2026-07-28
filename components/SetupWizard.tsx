'use client';

import { useState } from 'react';
import type { Player, RuleConfig } from '@/lib/types';
import { DEFAULT_RULES } from '@/lib/types';
import { START_OFFSET } from '@/lib/board4';
import { COLOR_HEX, COLORS_BY_COUNT } from '@/lib/colors';
import { useI18n } from '@/lib/i18n';
import type { DiceMode } from './Dice';
import RuleToggles from './RuleToggles';
import LanguageSwitch from './LanguageSwitch';

interface Entry {
  name: string;
  age: string;
}

const EMPTY: Entry = { name: '', age: '' };

export default function SetupWizard({
  onStart,
}: {
  onStart: (players: Player[], rules: RuleConfig, diceMode: DiceMode) => void;
}) {
  const { t } = useI18n();
  const [count, setCount] = useState(2);
  const [entries, setEntries] = useState<Entry[]>([{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }, { ...EMPTY }]);
  const [diceMode, setDiceMode] = useState<DiceMode>('virtual');
  const [rules, setRules] = useState<RuleConfig>({ ...DEFAULT_RULES });

  const colors = COLORS_BY_COUNT[count];
  const active = entries.slice(0, count);
  const namesOk = active.every((e) => e.name.trim().length > 0);

  function setEntry(i: number, patch: Partial<Entry>) {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }

  function start() {
    if (!namesOk) return;
    const seated: Player[] = active.map((e, i) => ({
      id: `p${i}`,
      name: e.name.trim(),
      age: Number(e.age) || 0,
      color: colors[i],
      startOffset: START_OFFSET[colors[i]],
    }));
    // Youngest starts, then clockwise (seated is already in clockwise order).
    let youngest = 0;
    seated.forEach((p, i) => {
      if (p.age < seated[youngest].age) youngest = i;
    });
    const ordered = [...seated.slice(youngest), ...seated.slice(0, youngest)];
    onStart(ordered, rules, diceMode);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-board-border">{t('app.title')}</h1>
        <LanguageSwitch />
      </div>

      {/* player count */}
      <section>
        <h2 className="mb-2 font-semibold text-stone-700">{t('setup.players')}</h2>
        <div className="flex gap-2">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`h-11 w-11 rounded-lg text-lg font-semibold transition ${
                count === n ? 'bg-board-border text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* players */}
      <section className="flex flex-col gap-2">
        {active.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-6 w-6 shrink-0 rounded-full border border-black/20" style={{ background: COLOR_HEX[colors[i]] }} />
            <input
              value={e.name}
              onChange={(ev) => setEntry(i, { name: ev.target.value })}
              placeholder={`${t('setup.player', { n: i + 1 })} — ${t('setup.namePlaceholder')}`}
              className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2"
            />
            <input
              value={e.age}
              onChange={(ev) => setEntry(i, { age: ev.target.value.replace(/\D/g, '') })}
              inputMode="numeric"
              placeholder={t('setup.age')}
              className="w-20 rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
        ))}
        <p className="text-xs text-stone-400">{t('setup.youngestStarts')}</p>
      </section>

      {/* dice mode */}
      <section>
        <h2 className="mb-2 font-semibold text-stone-700">{t('setup.dice')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(['virtual', 'physical'] as DiceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setDiceMode(m)}
              className={`rounded-lg border p-3 text-left transition ${
                diceMode === m ? 'border-board-border bg-stone-100' : 'border-stone-200'
              }`}
            >
              <span className="block font-medium">{t(`setup.dice.${m}`)}</span>
              <span className="block text-xs text-stone-500">{t(`setup.dice.${m}Hint`)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* rules */}
      <section>
        <h2 className="mb-2 font-semibold text-stone-700">{t('setup.rules')}</h2>
        <RuleToggles rules={rules} onChange={setRules} />
      </section>

      <button
        onClick={start}
        disabled={!namesOk}
        className="sticky bottom-3 rounded-xl bg-board-border py-3 text-lg font-semibold text-white shadow-lg transition disabled:opacity-40"
      >
        {t('setup.start')}
      </button>
      {!namesOk && <p className="-mt-3 text-center text-sm text-red-500">{t('setup.needNames')}</p>}
    </div>
  );
}
