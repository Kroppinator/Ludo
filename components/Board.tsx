'use client';

import type { GameState, PlayerColor } from '@/lib/types';
import {
  BOARD_SIZE,
  TRACK_CELLS,
  TRACK_CELL_KEYS,
  GOAL_CELLS,
  BASE_CELLS,
  START_OFFSET,
  cellForPiece,
  cellKey,
} from '@/lib/board4';
import { COLOR_HEX } from '@/lib/colors';
import Piece from './Piece';

// Precompute lookups from cell key → meaning.
const startKeys = new Map<string, PlayerColor>();
const goalKeys = new Map<string, PlayerColor>();
const baseKeys = new Map<string, PlayerColor>();
(Object.keys(START_OFFSET) as PlayerColor[]).forEach((c) => {
  startKeys.set(cellKey(TRACK_CELLS[START_OFFSET[c]]), c);
  GOAL_CELLS[c].forEach((cell) => goalKeys.set(cellKey(cell), c));
  BASE_CELLS[c].forEach((cell) => baseKeys.set(cellKey(cell), c));
});

function cornerColor(r: number, c: number): PlayerColor | null {
  if (r <= 3 && c <= 3) return 'red'; // top-left
  if (r <= 3 && c >= 7) return 'green'; // top-right
  if (r >= 7 && c >= 7) return 'yellow'; // bottom-right
  if (r >= 7 && c <= 3) return 'blue'; // bottom-left
  return null;
}

export default function Board({
  state,
  onPieceClick,
}: {
  state: GameState;
  onPieceClick: (pieceId: string) => void;
}) {
  const cells = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r},${c}`;
      const start = startKeys.get(key);
      const goal = goalKeys.get(key);
      const base = baseKeys.get(key);
      const isTrack = TRACK_CELL_KEYS.has(key);
      const isCenter = r === 5 && c === 5;

      let bg = 'transparent';
      let border = 'none';
      let radius = '9999px';
      if (start) {
        bg = COLOR_HEX[start];
        border = '2px solid rgba(0,0,0,0.35)';
      } else if (goal) {
        bg = COLOR_HEX[goal];
        border = '2px solid rgba(255,255,255,0.6)';
      } else if (isTrack) {
        bg = '#ffffff';
        border = '1px solid rgba(255,255,255,0.35)';
      } else if (base) {
        bg = '#ffffff';
        border = `3px solid ${COLOR_HEX[base]}`;
      } else if (isCenter) {
        bg = '#e7ddc9';
        border = '2px solid #cbb992';
        radius = '6px';
      }

      const corner = !start && !goal && !isTrack && !base && !isCenter ? cornerColor(r, c) : null;

      cells.push(
        <div
          key={key}
          style={{ background: corner ? `${COLOR_HEX[corner]}2e` : 'transparent' }}
          className="flex min-h-0 min-w-0 items-center justify-center"
        >
          {isCenter ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/avatar.jpg"
              alt="Avatar"
              className="h-[96%] w-[96%] rounded-full object-cover shadow"
              style={{ border: '2px solid #cbb992' }}
            />
          ) : (
            (start || goal || isTrack || base) && (
              <div
                className="h-[86%] w-[86%]"
                style={{ background: bg, border, borderRadius: radius }}
              />
            )
          )}
        </div>,
      );
    }
  }

  // Group pieces by cell to fan out any that share a field (barriers).
  const byCell = new Map<string, string[]>();
  for (const p of state.pieces) {
    const cell = cellForPiece(p.color, p.index, p.progress);
    const k = cellKey(cell);
    byCell.set(k, [...(byCell.get(k) ?? []), p.id]);
  }

  const movedIds = new Set(state.events.filter((e) => e.type === 'moved').map((e) => (e as { pieceId: string }).pieceId));
  const capturedIds = new Set(state.events.filter((e) => e.type === 'captured').map((e) => (e as { pieceId: string }).pieceId));

  return (
    <div
      className="relative mx-auto w-full max-w-[min(92vw,72vh)] rounded-2xl bg-board-bg p-[1.5%]"
      style={{
        border: '3px solid #ff2d9b',
        boxShadow:
          '0 0 28px rgba(255,45,155,0.55), 0 0 64px rgba(176,38,255,0.35), inset 0 0 24px rgba(176,38,255,0.25)',
      }}
    >
      {/* aspect-square on this inner, width-driven box makes the height derive
          from a definite width (reliable on iOS). Grid + overlay share this box
          so pieces line up exactly with the cells and nothing overflows. */}
      <div className="relative aspect-square w-full">
        <div
          className="grid h-full w-full"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)` }}
        >
          {cells}
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto relative h-full w-full">
            {state.pieces.map((p) => {
              const [row, col] = cellForPiece(p.color, p.index, p.progress);
              const mates = byCell.get(cellKey([row, col]))!;
              const idx = mates.indexOf(p.id);
              const offset = mates.length > 1 ? (idx - (mates.length - 1) / 2) * 2.4 : 0;
              return (
                <Piece
                  key={p.id}
                  color={p.color}
                  xCol={col}
                  yRow={row}
                  legal={state.legalMoves.includes(p.id)}
                  moved={movedIds.has(p.id)}
                  captured={capturedIds.has(p.id)}
                  stackOffset={offset}
                  onClick={() => onPieceClick(p.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
