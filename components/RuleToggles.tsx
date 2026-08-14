'use client';

import { useState } from 'react';
import type { RuleConfig } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

const PRIMARY_RULE_KEYS: (keyof RuleConfig)[] = [
  'threeAttempts',
  'noJumpInGoal',
  'mustCapture',
  'prePlacedPiece',
];

const ADVANCED_RULE_KEYS: (keyof RuleConfig)[] = ['mustCaptureExtended', 'barriers'];

export default function RuleToggles({
  rules,
  onChange,
}: {
  rules: RuleConfig;
  onChange: (rules: RuleConfig) => void;
}) {
  const { t } = useI18n();
  const [showMore, setShowMore] = useState(false);

  const row = (key: keyof RuleConfig) => (
    <label
      key={key}
      className="disco-panel flex cursor-pointer items-start gap-3 rounded-lg p-3 transition hover:border-neon-pink/60"
    >
      <input
        type="checkbox"
        checked={rules[key]}
        onChange={(e) => onChange({ ...rules, [key]: e.target.checked })}
        className="mt-0.5 h-6 w-6 accent-neon-pink"
      />
      <span>
        <span className="block font-disco text-disco-text">{t(`rule.${key}`)}</span>
        <span className="block text-sm text-disco-muted">{t(`rule.${key}.desc`)}</span>
      </span>
    </label>
  );

  return (
    <div className="flex flex-col gap-2">
      {PRIMARY_RULE_KEYS.map(row)}

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="flex items-center gap-1 self-start py-1 font-disco text-sm text-neon-cyan transition hover:brightness-125"
      >
        <span className={`inline-block transition-transform ${showMore ? 'rotate-90' : ''}`}>▸</span>
        {t('setup.moreRules')}
      </button>

      {showMore && ADVANCED_RULE_KEYS.map(row)}
    </div>
  );
}
