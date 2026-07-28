'use client';

import type { RuleConfig } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

const RULE_KEYS: (keyof RuleConfig)[] = [
  'threeAttempts',
  'noJumpInGoal',
  'mustCapture',
  'mustCaptureExtended',
  'barriers',
  'prePlacedPiece',
];

export default function RuleToggles({
  rules,
  onChange,
}: {
  rules: RuleConfig;
  onChange: (rules: RuleConfig) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-2">
      {RULE_KEYS.map((key) => (
        <label
          key={key}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3 transition hover:bg-stone-50"
        >
          <input
            type="checkbox"
            checked={rules[key]}
            onChange={(e) => onChange({ ...rules, [key]: e.target.checked })}
            className="mt-1 h-5 w-5 accent-board-border"
          />
          <span>
            <span className="block font-medium text-stone-800">{t(`rule.${key}`)}</span>
            <span className="block text-sm text-stone-500">{t(`rule.${key}.desc`)}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
