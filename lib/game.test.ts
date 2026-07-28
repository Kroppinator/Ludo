import { describe, it, expect } from 'vitest';
import { createGame, applyRoll, applyMove, getLegalMoves, computeMove } from './game';
import { START_OFFSET } from './board4';
import {
  DEFAULT_RULES,
  RuleConfig,
  Player,
  PlayerColor,
  GameState,
  BASE,
  GOAL_START,
  pieceId,
} from './types';

// --- test helpers -----------------------------------------------------------

function mkPlayers(colors: PlayerColor[]): Player[] {
  return colors.map((c, i) => ({
    id: `p${i}`,
    name: c,
    age: 20 + i,
    color: c,
    startOffset: START_OFFSET[c],
  }));
}

function game(colors: PlayerColor[], rules: Partial<RuleConfig> = {}): GameState {
  return createGame(mkPlayers(colors), { ...DEFAULT_RULES, ...rules });
}

/** Place pieces at explicit progress values. */
function place(
  state: GameState,
  placements: Array<{ color: PlayerColor; index: number; progress: number }>,
): GameState {
  const pieces = state.pieces.map((p) => {
    const hit = placements.find((x) => x.color === p.color && x.index === p.index);
    return hit ? { ...p, progress: hit.progress } : p;
  });
  return { ...state, pieces };
}

function progressOf(state: GameState, color: PlayerColor, index: number): number {
  return state.pieces.find((p) => p.id === pieceId(color, index))!.progress;
}

// --- setup ------------------------------------------------------------------

describe('createGame', () => {
  it('starts every piece in the base by default', () => {
    const g = game(['red', 'yellow']);
    expect(g.pieces).toHaveLength(8);
    expect(g.pieces.every((p) => p.progress === BASE)).toBe(true);
  });

  it('pre-places one piece on the start field when the option is on', () => {
    const g = game(['red', 'yellow'], { prePlacedPiece: true });
    expect(progressOf(g, 'red', 0)).toBe(0);
    expect(progressOf(g, 'red', 1)).toBe(BASE);
  });
});

// --- leaving the base -------------------------------------------------------

describe('leaving the base', () => {
  it('requires a six', () => {
    const g = game(['red', 'yellow']);
    expect(getLegalMoves(g, 3)).toEqual([]);
    expect(getLegalMoves(g, 6)).toContain(pieceId('red', 0));
  });

  it('is blocked when an own piece already sits on the start field', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [{ color: 'red', index: 0, progress: 0 }]);
    const moves = getLegalMoves(g, 6);
    // index0 (already out) may advance; base pieces cannot come out onto it.
    expect(moves).toEqual([pieceId('red', 0)]);
  });

  it('captures an opponent standing on the start field', () => {
    let g = game(['red', 'yellow']);
    // yellow at absolute cell 0 = red's start field.
    g = place(g, [{ color: 'yellow', index: 0, progress: 20 }]);
    g = applyRoll(g, 6);
    g = applyMove(g, pieceId('red', 0));
    expect(progressOf(g, 'red', 0)).toBe(0);
    expect(progressOf(g, 'yellow', 0)).toBe(BASE);
  });
});

// --- mandatory six rule -----------------------------------------------------

describe('mandatory six rule', () => {
  it('forces bringing a piece out when a six is rolled and the start is free', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [{ color: 'red', index: 0, progress: 10 }]); // one already on the track
    const moves = getLegalMoves(g, 6);
    // Must move a base piece out; may not advance the track piece.
    expect(moves).not.toContain(pieceId('red', 0));
    expect(moves).toContain(pieceId('red', 1));
  });

  it('grants an extra roll (same player) after a six', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [
      { color: 'red', index: 0, progress: 5 },
      { color: 'red', index: 1, progress: 10 },
      { color: 'red', index: 2, progress: 15 },
      { color: 'red', index: 3, progress: 20 },
    ]);
    g = applyRoll(g, 6);
    expect(g.extraRoll).toBe(true);
    g = applyMove(g, pieceId('red', 0));
    expect(g.currentPlayerIndex).toBe(0); // still red
    expect(g.phase).toBe('roll');
  });
});

// --- three-attempts rule ----------------------------------------------------

describe('three-attempts rule (optional)', () => {
  it('gives up to three rolls to get a six when all pieces are in base', () => {
    let g = game(['red', 'yellow'], { threeAttempts: true });
    g = applyRoll(g, 2);
    expect(g.currentPlayerIndex).toBe(0);
    expect(g.rollAttempts).toBe(1);
    g = applyRoll(g, 3);
    expect(g.currentPlayerIndex).toBe(0);
    g = applyRoll(g, 4);
    expect(g.currentPlayerIndex).toBe(1); // third failure → next player
  });

  it('passes immediately after one failed roll when the rule is off', () => {
    let g = game(['red', 'yellow'], { threeAttempts: false });
    g = applyRoll(g, 2);
    expect(g.currentPlayerIndex).toBe(1);
  });
});

// --- capture & blocking -----------------------------------------------------

describe('captures and blocking', () => {
  it('sends a captured opponent back to base', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [
      { color: 'red', index: 0, progress: 3 },
      { color: 'yellow', index: 0, progress: 25 }, // absolute cell 5
    ]);
    g = applyRoll(g, 2); // red 3 -> 5
    g = applyMove(g, pieceId('red', 0));
    expect(progressOf(g, 'red', 0)).toBe(5);
    expect(progressOf(g, 'yellow', 0)).toBe(BASE);
  });

  it('cannot land on an own piece (no barriers rule)', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [
      { color: 'red', index: 0, progress: 3 },
      { color: 'red', index: 1, progress: 5 },
    ]);
    expect(computeMove(g, g.pieces[0], 2)).toBeNull(); // 3 -> 5 blocked by own
  });
});

// --- goal lane --------------------------------------------------------------

describe('goal lane', () => {
  it('enters the goal with an exact count and rejects overshoot', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [{ color: 'red', index: 0, progress: 39 }]);
    expect(computeMove(g, g.pieces[0], 4)).toMatchObject({ targetProgress: GOAL_START + 3 });
    expect(computeMove(g, g.pieces[0], 5)).toBeNull(); // overshoots past the last goal cell
  });

  it('forbids jumping over an own goal piece when Überspring-Verbot is on', () => {
    let base = game(['red', 'yellow'], { noJumpInGoal: true });
    base = place(base, [
      { color: 'red', index: 0, progress: 39 },
      { color: 'red', index: 1, progress: GOAL_START + 1 }, // goal cell index 1
    ]);
    expect(computeMove(base, base.pieces[0], 3)).toBeNull(); // 39 -> goal idx 2 jumps over idx 1

    let off = game(['red', 'yellow'], { noJumpInGoal: false });
    off = place(off, [
      { color: 'red', index: 0, progress: 39 },
      { color: 'red', index: 1, progress: GOAL_START + 1 },
    ]);
    expect(computeMove(off, off.pieces[0], 3)).toMatchObject({ targetProgress: GOAL_START + 2 });
  });
});

// --- Schlagzwang ------------------------------------------------------------

describe('Schlagzwang (optional)', () => {
  it('forces a capturing move when one is available', () => {
    let g = game(['red', 'yellow'], { mustCapture: true });
    g = place(g, [
      { color: 'red', index: 0, progress: 3 }, // can capture at cell 5
      { color: 'red', index: 1, progress: 10 }, // non-capturing alternative
      { color: 'yellow', index: 0, progress: 25 }, // absolute cell 5
    ]);
    expect(getLegalMoves(g, 2)).toEqual([pieceId('red', 0)]);
  });
});

// --- Barrieren-Regel --------------------------------------------------------

describe('Barrieren-Regel (optional)', () => {
  it('allows stacking own pieces and blocks others from passing', () => {
    // red forms a barrier at absolute cell 5.
    let g = game(['red', 'yellow'], { barriers: true });
    g = place(g, [
      { color: 'red', index: 0, progress: 5 },
      { color: 'red', index: 1, progress: 5 },
      { color: 'yellow', index: 0, progress: 24 }, // absolute cell 4
    ]);
    g = { ...g, currentPlayerIndex: 1 }; // yellow to move
    const yellow0 = g.pieces.find((p) => p.id === pieceId('yellow', 0))!;
    expect(computeMove(g, yellow0, 3)).toBeNull(); // path crosses the barrier at cell 5
  });

  it('permits stacking onto an own piece when the rule is on', () => {
    let g = game(['red', 'yellow'], { barriers: true });
    g = place(g, [
      { color: 'red', index: 0, progress: 5 },
      { color: 'red', index: 1, progress: 3 },
    ]);
    expect(computeMove(g, g.pieces[1], 2)).toMatchObject({ targetProgress: 5 });
  });
});

// --- winning ----------------------------------------------------------------

describe('winning', () => {
  it('declares the winner when all four pieces reach the goal', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [
      { color: 'red', index: 0, progress: GOAL_START },
      { color: 'red', index: 1, progress: GOAL_START + 1 },
      { color: 'red', index: 2, progress: GOAL_START + 2 },
      { color: 'red', index: 3, progress: 39 }, // one step from the last goal cell
    ]);
    g = applyRoll(g, 4); // 39 -> goal idx 3
    g = applyMove(g, pieceId('red', 3));
    expect(g.phase).toBe('gameover');
    expect(g.winnerId).toBe('p0');
  });
});

// --- auto-move & six re-roll -----------------------------------------------

describe('single legal move', () => {
  it('is played automatically without asking (no move phase)', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [{ color: 'red', index: 0, progress: 3 }]); // only movable piece
    g = applyRoll(g, 2); // just the one legal move: 3 -> 5
    expect(progressOf(g, 'red', 0)).toBe(5);
    expect(g.phase).toBe('roll'); // move phase was skipped
    expect(g.currentPlayerIndex).toBe(1); // turn advanced
  });
});

describe('a six always grants another roll', () => {
  it('lets the player roll again after bringing a piece onto the board', () => {
    // Only one piece can leave the base, so the six auto-plays.
    let g = game(['red', 'yellow']);
    g = place(g, [
      { color: 'red', index: 1, progress: GOAL_START },
      { color: 'red', index: 2, progress: GOAL_START + 1 },
      { color: 'red', index: 3, progress: GOAL_START + 2 },
    ]); // index 0 stays in base
    g = applyRoll(g, 6);
    expect(progressOf(g, 'red', 0)).toBe(0); // brought onto the start field
    expect(g.currentPlayerIndex).toBe(0); // same player
    expect(g.phase).toBe('roll'); // rolls again
  });
});

// --- clear-the-start-field rule --------------------------------------------

describe('clearing the start field', () => {
  it('forces moving the start-field piece while a piece still waits in the base', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [
      { color: 'red', index: 0, progress: 0 }, // sits on the start field
      { color: 'red', index: 1, progress: BASE }, // still waiting in the base
      { color: 'red', index: 2, progress: 10 }, // could otherwise move
      { color: 'red', index: 3, progress: 15 }, // could otherwise move
    ]);
    expect(getLegalMoves(g, 3)).toEqual([pieceId('red', 0)]);
  });

  it('allows a free choice once no piece remains in the base', () => {
    let g = game(['red', 'yellow']);
    g = place(g, [
      { color: 'red', index: 0, progress: 0 }, // on the start field
      { color: 'red', index: 1, progress: 5 },
      { color: 'red', index: 2, progress: 10 },
      { color: 'red', index: 3, progress: 15 },
    ]);
    const moves = getLegalMoves(g, 3);
    expect(moves).toHaveLength(4);
    expect(moves).toContain(pieceId('red', 1));
  });
});
