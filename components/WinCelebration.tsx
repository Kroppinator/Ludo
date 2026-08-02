'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { PlayerColor } from '@/lib/types';
import { COLOR_HEX } from '@/lib/colors';
import { useI18n } from '@/lib/i18n';

const CONFETTI_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function WinCelebration({
  winnerName,
  color,
  onNewGame,
}: {
  winnerName: string;
  color: PlayerColor;
  onNewGame: () => void;
}) {
  const { t } = useI18n();

  const pieces = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.5 + Math.random() * 2,
        drift: (Math.random() - 0.5) * 120,
        spin: 180 + Math.random() * 720,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        w: 6 + Math.random() * 8,
        h: 10 + Math.random() * 10,
        round: Math.random() > 0.5,
      })),
    [],
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Falling confetti */}
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: p.round ? '9999px' : '2px',
          }}
          initial={{ y: '-10vh', x: 0, rotate: 0, opacity: 0 }}
          animate={{ y: '110vh', x: p.drift, rotate: p.spin, opacity: [0, 1, 1, 1, 0.7] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Winner card */}
      <motion.div
        className="relative z-10 mx-4 flex flex-col items-center gap-4 rounded-3xl bg-white/95 px-8 py-7 text-center shadow-2xl"
        initial={{ scale: 0.6, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
      >
        <motion.div
          className="text-6xl"
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.7 }}
        >
          🏆
        </motion.div>
        <div className="flex items-center gap-2 text-2xl font-extrabold" style={{ color: COLOR_HEX[color] }}>
          <span className="inline-block h-5 w-5 rounded-full" style={{ background: COLOR_HEX[color] }} />
          {t('game.wins', { name: winnerName })}
        </div>
        <button
          onClick={onNewGame}
          className="mt-1 rounded-xl bg-board-border px-6 py-2.5 text-lg font-semibold text-white shadow transition hover:opacity-90 active:scale-95"
        >
          {t('game.newGame')}
        </button>
      </motion.div>
    </motion.div>
  );
}
