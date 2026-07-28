// Geometry for the 4-player cross board — matches the official board layout
// (Wikipedia "Mensch ärgere dich nicht 4"), with clockwise play.
//
// Two concerns live here:
//  1. The ABSTRACT model (start offsets + clockwise colour order) used by the
//     rules engine and setup.
//  2. The PIXEL/GRID model: every field mapped to a [row, col] cell on an
//     11×11 grid, so the UI can render and animate pieces.
//
// Pieces travel CLOCKWISE (track index increasing). Arms/goals: green = top,
// yellow = right, blue = bottom, red = left. Homes sit in the corners:
// red = top-left, green = top-right, yellow = bottom-right, blue = bottom-left.
// TRACK_CELLS index i corresponds to the board's field number (i + 1).

import type { PlayerColor } from './types';

export type Cell = readonly [number, number]; // [row, col] on an 11×11 grid

export const BOARD_SIZE = 11;
export const CENTER: Cell = [5, 5];

/** Track index of each colour's start field (where its pieces enter). */
export const START_OFFSET: Record<PlayerColor, number> = {
  green: 1, // field 2  (0,6) — top
  yellow: 11, // field 12 (6,10) — right
  blue: 21, // field 22 (10,4) — bottom
  red: 31, // field 32 (4,0) — left
};

/** Seating order going clockwise around the board (top → right → bottom → left). */
export const CLOCKWISE_COLORS: PlayerColor[] = ['green', 'yellow', 'blue', 'red'];

/**
 * The 40 shared track cells, index 0..39 (= field 1..40), laid out CLOCKWISE.
 */
export const TRACK_CELLS: readonly Cell[] = [
  [0, 5], // 0  (field 1)
  [0, 6], // 1  (field 2)  green start
  [1, 6], // 2
  [2, 6], // 3
  [3, 6], // 4
  [4, 6], // 5
  [4, 7], // 6
  [4, 8], // 7
  [4, 9], // 8
  [4, 10], // 9
  [5, 10], // 10
  [6, 10], // 11 (field 12) yellow start
  [6, 9], // 12
  [6, 8], // 13
  [6, 7], // 14
  [6, 6], // 15
  [7, 6], // 16
  [8, 6], // 17
  [9, 6], // 18
  [10, 6], // 19
  [10, 5], // 20
  [10, 4], // 21 (field 22) blue start
  [9, 4], // 22
  [8, 4], // 23
  [7, 4], // 24
  [6, 4], // 25
  [6, 3], // 26
  [6, 2], // 27
  [6, 1], // 28
  [6, 0], // 29
  [5, 0], // 30
  [4, 0], // 31 (field 32) red start
  [4, 1], // 32
  [4, 2], // 33
  [4, 3], // 34
  [4, 4], // 35
  [3, 4], // 36
  [2, 4], // 37
  [1, 4], // 38
  [0, 4], // 39 (field 40)
];

/** Goal lane per colour: index 0 = cell entered first (nearest the track). */
export const GOAL_CELLS: Record<PlayerColor, readonly Cell[]> = {
  green: [[1, 5], [2, 5], [3, 5], [4, 5]], // top column, downward
  yellow: [[5, 9], [5, 8], [5, 7], [5, 6]], // right row, leftward
  blue: [[9, 5], [8, 5], [7, 5], [6, 5]], // bottom column, upward
  red: [[5, 1], [5, 2], [5, 3], [5, 4]], // left row, rightward
};

/** Base ("Ausgangsfeld") cells per colour, one per piece index (0..3). */
export const BASE_CELLS: Record<PlayerColor, readonly Cell[]> = {
  red: [[0, 0], [1, 0], [0, 1], [1, 1]], // top-left
  green: [[0, 9], [1, 9], [0, 10], [1, 10]], // top-right
  yellow: [[9, 9], [10, 9], [9, 10], [10, 10]], // bottom-right
  blue: [[9, 0], [10, 0], [9, 1], [10, 1]], // bottom-left
};

/** Set of every track cell keyed as "row,col", for quick board rendering. */
export const TRACK_CELL_KEYS = new Set(TRACK_CELLS.map(([r, c]) => `${r},${c}`));

export function cellKey(cell: Cell): string {
  return `${cell[0]},${cell[1]}`;
}

/** The grid cell a piece currently occupies. */
export function cellForPiece(color: PlayerColor, index: number, progress: number): Cell {
  if (progress < 0) return BASE_CELLS[color][index];
  if (progress >= 40) return GOAL_CELLS[color][progress - 40];
  return TRACK_CELLS[(START_OFFSET[color] + progress) % TRACK_CELLS.length];
}

/** The grid cell of a colour's start field (where its pieces enter). */
export function startCell(color: PlayerColor): Cell {
  return TRACK_CELLS[START_OFFSET[color]];
}
