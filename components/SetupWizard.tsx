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

export interface Entry {
  name: string;
  age: string;
}

/** Raw setup values, kept so a new game can prefill the previous players. */
export interface SetupSnapshot {
  count: number;
  entries: Entry[];
}

const EMPTY: Entry = { name: '', age: '' };

function initialEntries(initial?: SetupSnapshot | null): Entry[] {
  const slots: Entry[] = [{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }, { ...EMPTY }];
  initial?.entries.forEach((e, i) => {
    if (i < slots.length) slots[i] = { name: e.name, age: e.age };
  });
  return slots;
}

export default function SetupWizard({
  onStart,
  initial,
}: {
  onStart: (players: Player[], rules: RuleConfig, diceMode: DiceMode, snapshot: SetupSnapshot) => void;
  initial?: SetupSnapshot | null;
}) {
  const { t } = useI18n();
  const [count, setCount] = useState(initial?.count ?? 2);
  const [entries, setEntries] = useState<Entry[]>(() => initialEntries(initial));
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
    onStart(ordered, rules, diceMode, {
      count,
      entries: active.map((e) => ({ name: e.name.trim(), age: e.age })),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-disco text-3xl text-neon-pink neon-text">{t('app.title')}</h1>
        <LanguageSwitch />
      </div>

      {/* player count */}
      <section>
        <h2 className="mb-2 font-disco text-lg text-neon-cyan">{t('setup.players')}</h2>
        <div className="flex gap-2">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`h-11 w-11 rounded-lg font-disco text-lg transition ${
                count === n
                  ? 'bg-neon-pink text-white shadow-[0_0_16px_rgba(255,45,155,0.7)]'
                  : 'disco-panel text-disco-muted'
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
            <span
              className="h-6 w-6 shrink-0 rounded-full border border-white/40"
              style={{ background: COLOR_HEX[colors[i]], boxShadow: `0 0 10px ${COLOR_HEX[colors[i]]}` }}
            />
            <input
              value={e.name}
              onChange={(ev) => setEntry(i, { name: ev.target.value })}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              data-1p-ignore
              data-lpignore="true"
              placeholder={`${t('setup.player', { n: i + 1 })} — ${t('setup.namePlaceholder')}`}
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 placeholder-disco-muted/50 focus:border-neon-cyan focus:outline-none"
            />
            <input
              value={e.age}
              onChange={(ev) => setEntry(i, { age: ev.target.value.replace(/\D/g, '') })}
              autoComplete="off"
              autoCorrect="off"
              inputMode="numeric"
              placeholder={t('setup.age')}
              className="w-20 rounded-lg border border-white/15 bg-black/30 px-3 py-2 placeholder-disco-muted/50 focus:border-neon-cyan focus:outline-none"
            />
          </div>
        ))}
        <p className="text-xs text-disco-muted">{t('setup.youngestStarts')}</p>
      </section>

      {/* dice mode */}
      <section>
        <h2 className="mb-2 font-disco text-lg text-neon-cyan">{t('setup.dice')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(['virtual', 'physical'] as DiceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setDiceMode(m)}
              className={`rounded-lg border p-3 text-left transition ${
                diceMode === m
                  ? 'border-neon-cyan bg-neon-cyan/10 text-disco-text shadow-[0_0_14px_rgba(36,224,255,0.4)]'
                  : 'disco-panel text-disco-muted'
              }`}
            >
              <span className="block font-disco">{t(`setup.dice.${m}`)}</span>
              <span className="block text-xs opacity-70">{t(`setup.dice.${m}Hint`)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* rules */}
      <section>
        <h2 className="mb-2 font-disco text-lg text-neon-cyan">{t('setup.rules')}</h2>
        <RuleToggles rules={rules} onChange={setRules} />
      </section>

      <button
        onClick={start}
        disabled={!namesOk}
        className="sticky bottom-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple py-3 font-disco text-xl uppercase tracking-wide text-white shadow-[0_0_24px_rgba(255,45,155,0.7)] transition disabled:opacity-40 disabled:shadow-none"
      >
        {t('setup.start')}
      </button>
      {!namesOk && <p className="-mt-3 text-center text-sm text-neon-pink">{t('setup.needNames')}</p>}
    </div>
  );
}
