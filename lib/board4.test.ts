import { describe, it, expect } from 'vitest';
import {
  TRACK_CELLS,
  GOAL_CELLS,
  BASE_CELLS,
  START_OFFSET,
  BOARD_SIZE,
  type Cell,
} from './board4';
import type { PlayerColor } from './types';

const COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
const manhattan = (a: Cell, b: Cell) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const inBounds = ([r, c]: Cell) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

describe('track geometry', () => {
  it('has 40 unique cells that all lie on the board', () => {
    expect(TRACK_CELLS).toHaveLength(40);
    const keys = new Set(TRACK_CELLS.map((c) => `${c[0]},${c[1]}`));
    expect(keys.size).toBe(40);
    expect(TRACK_CELLS.every(inBounds)).toBe(true);
  });

  it('forms a closed loop of grid-adjacent cells', () => {
    for (let i = 0; i < TRACK_CELLS.length; i++) {
      const next = TRACK_CELLS[(i + 1) % TRACK_CELLS.length];
      expect(manhattan(TRACK_CELLS[i], next)).toBe(1);
    }
  });

  it('places the four start fields 10 apart', () => {
    expect(START_OFFSET).toEqual({ green: 1, yellow: 11, blue: 21, red: 31 });
  });
});

describe('goal lanes', () => {
  it('each colour turns into its goal from the cell one step before its start', () => {
    for (const color of COLORS) {
      const beforeStart = TRACK_CELLS[(START_OFFSET[color] + 39) % 40];
      expect(manhattan(beforeStart, GOAL_CELLS[color][0])).toBe(1);
    }
  });

  it('has 4 in-bounds goal cells and 4 base cells per colour', () => {
    for (const color of COLORS) {
      expect(GOAL_CELLS[color]).toHaveLength(4);
      expect(BASE_CELLS[color]).toHaveLength(4);
      expect(GOAL_CELLS[color].every(inBounds)).toBe(true);
      expect(BASE_CELLS[color].every(inBounds)).toBe(true);
    }
  });
});
