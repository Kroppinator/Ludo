'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import DiceFace from './DiceFace';
import { rollDie } from '@/lib/game';
import type { PlayerColor } from '@/lib/types';
import { COLOR_HEX } from '@/lib/colors';
import { useI18n } from '@/lib/i18n';

export type DiceMode = 'virtual' | 'physical';

export default function Dice({
  mode,
  disabled,
  lastValue,
  color,
  onRoll,
}: {
  mode: DiceMode;
  disabled: boolean;
  lastValue: number | null;
  color: PlayerColor;
  onRoll: (value: number) => void;
}) {
  const { t } = useI18n();
  const hex = COLOR_HEX[color];
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(lastValue ?? 1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!rolling && lastValue) setFace(lastValue);
  }, [lastValue, rolling]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function rollVirtual() {
    if (disabled || rolling) return;
    const value = rollDie();
    setRolling(true);
    // Flicker random faces, then settle on the rolled value.
    let ticks = 0;
    const tick = () => {
      setFace(rollDie());
      ticks += 1;
      if (ticks < 6) timers.current.push(setTimeout(tick, 70));
      else
        timers.current.push(
          setTimeout(() => {
            setFace(value);
            setRolling(false);
            onRoll(value);
          }, 90),
        );
    };
    tick();
  }

  if (mode === 'physical') {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-stone-500">{t('game.enterRoll')}</span>
        <div className="grid grid-cols-6 gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((v) => (
            <button
              key={v}
              disabled={disabled}
              onClick={() => onRoll(v)}
              className="rounded-lg transition enabled:hover:scale-110 enabled:active:scale-95 disabled:opacity-40"
              aria-label={`${v}`}
            >
              <DiceFace value={v} size={44} faceColor={hex} pipColor="#ffffff" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={rollVirtual}
        disabled={disabled || rolling}
        animate={rolling ? { rotate: [0, -12, 12, -8, 0], scale: [1, 1.12, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileTap={{ scale: 0.92 }}
        className="rounded-2xl shadow-lg disabled:opacity-60"
        style={{ perspective: 600 }}
        aria-label={t('game.tapToRoll')}
      >
        <DiceFace value={face} size={72} faceColor={hex} pipColor="#ffffff" />
      </motion.button>
      <span className="text-sm text-stone-500">{disabled ? ' ' : t('game.tapToRoll')}</span>
    </div>
  );
}
