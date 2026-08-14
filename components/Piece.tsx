'use client';

import { motion } from 'framer-motion';
import type { PlayerColor } from '@/lib/types';
import { COLOR_HEX } from '@/lib/colors';

const CELL = 100 / 11; // one grid cell as a percentage of the board

export default function Piece({
  color,
  xCol,
  yRow,
  legal,
  moved,
  captured,
  stackOffset = 0,
  onClick,
}: {
  color: PlayerColor;
  xCol: number; // grid column of the piece's cell
  yRow: number; // grid row of the piece's cell
  legal: boolean;
  moved: boolean;
  captured: boolean;
  stackOffset?: number;
  onClick?: () => void;
}) {
  const left = (xCol + 0.5) * CELL + stackOffset;
  const top = (yRow + 0.5) * CELL - stackOffset;
  const hex = COLOR_HEX[color];

  return (
    <motion.button
      onClick={legal ? onClick : undefined}
      initial={false}
      animate={{
        left: `${left}%`,
        top: `${top}%`,
        rotate: captured ? [0, 200, 360] : 0,
        scale: captured ? [1, 1.35, 0.85, 1] : moved ? [1, 1.18, 1] : 1,
      }}
      transition={{
        left: { type: 'spring', stiffness: 280, damping: 22 },
        top: { type: 'spring', stiffness: 280, damping: 22 },
        default: { duration: 0.5 },
      }}
      whileTap={legal ? { scale: 0.9 } : undefined}
      // Hit area fills the whole cell for easy tapping on phones; only legal
      // pieces are interactive so they never block each other.
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-transparent"
      style={{
        width: `${CELL}%`,
        height: `${CELL}%`,
        cursor: legal ? 'pointer' : 'default',
        pointerEvents: legal ? 'auto' : 'none',
      }}
      aria-label={`${color} piece`}
    >
      {/* Visual token — kept at the original size (72% of the cell). */}
      <span
        className="relative block h-[72%] w-[72%] rounded-full"
        style={{
          // Glossy 3D token: highlight top-left, colour body, dark rim + drop shadow.
          background: `radial-gradient(circle at 32% 28%, #ffffffcc 0%, ${hex} 42%, ${hex} 70%, #00000055 100%)`,
          boxShadow: '0 3px 5px rgba(0,0,0,0.35), inset 0 -2px 3px rgba(0,0,0,0.3)',
          border: legal ? '2px solid #ffffff' : '2px solid rgba(0,0,0,0.25)',
          outline: legal ? '3px solid #fbbf24' : 'none',
        }}
      >
        {legal && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 0 3px #fbbf24' }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.18, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
        )}
      </span>
    </motion.button>
  );
}
