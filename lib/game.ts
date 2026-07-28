// Pure rules engine for "Mensch ärgere dich nicht".
//
// No React, no rendering. State transitions are pure functions returning a new
// GameState. The UI generates a die value (virtual RNG or a tapped physical
// value) and calls `applyRoll`, then `applyMove` with the chosen piece id.

import {
  GameState,
  Player,
  Piece,
  RuleConfig,
  GameEvent,
  PlayerColor,
  TRACK_LENGTH,
  GOAL_START,
  GOAL_END,
  BASE,
  SIX,
  PIECES_PER_PLAYER,
  pieceId,
  absoluteCell,
  isInGoal,
  isInBase,
  currentPlayer,
} from './types';

// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

/** A fair 1–6 die roll (used for the virtual dice mode). */
export function rollDie(): number {
  const g = globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } };
  if (g.crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    g.crypto.getRandomValues(buf);
    return (buf[0] % 6) + 1;
  }
  return Math.floor(Math.random() * 6) + 1;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

/**
 * Create a fresh game. `players` must already be in turn order
 * (index 0 = youngest, then clockwise by board seat).
 */
export function createGame(players: Player[], rules: RuleConfig): GameState {
  const pieces: Piece[] = players.flatMap((p) =>
    Array.from({ length: PIECES_PER_PLAYER }, (_, i) => ({
      id: pieceId(p.color, i),
      color: p.color,
      index: i,
      // Optional rule: begin with one piece already on the start field.
      progress: rules.prePlacedPiece && i === 0 ? 0 : BASE,
    })),
  );

  return {
    players,
    pieces,
    rules,
    currentPlayerIndex: 0,
    dice: null,
    phase: 'roll',
    rollAttempts: 0,
    extraRoll: false,
    legalMoves: [],
    winnerId: null,
    events: [],
  };
}

// ---------------------------------------------------------------------------
// Occupancy helpers
// ---------------------------------------------------------------------------

function playerOf(state: GameState, color: PlayerColor): Player {
  return state.players.find((p) => p.color === color)!;
}

/** Pieces standing on a given absolute track cell. */
function trackPiecesAt(state: GameState, cell: number): Piece[] {
  return state.pieces.filter((pc) => {
    if (pc.progress < 0 || pc.progress >= TRACK_LENGTH) return false;
    return absoluteCell(playerOf(state, pc.color).startOffset, pc.progress) === cell;
  });
}

/** A barrier is ≥2 same-colour pieces on one cell (only when the rule is on). */
function isBarrierAt(state: GameState, cell: number): boolean {
  if (!state.rules.barriers) return false;
  const counts = new Map<PlayerColor, number>();
  for (const pc of trackPiecesAt(state, cell)) {
    counts.set(pc.color, (counts.get(pc.color) ?? 0) + 1);
  }
  return [...counts.values()].some((n) => n >= 2);
}

/** Goal-lane indices (0..3) already occupied by `color`, excluding `exceptId`. */
function goalOccupied(state: GameState, color: PlayerColor, exceptId?: string): Set<number> {
  const set = new Set<number>();
  for (const pc of state.pieces) {
    if (pc.color !== color || pc.id === exceptId) continue;
    if (isInGoal(pc.progress)) set.add(pc.progress - GOAL_START);
  }
  return set;
}

// ---------------------------------------------------------------------------
// Move computation
// ---------------------------------------------------------------------------

export interface Move {
  pieceId: string;
  targetProgress: number;
  capturedPieceId?: string;
}

/**
 * Compute the resulting move for a piece with the given die value, or null if
 * the move is illegal under the current rules.
 */
export function computeMove(state: GameState, piece: Piece, value: number): Move | null {
  const player = playerOf(state, piece.color);
  const s = player.startOffset;
  const { rules } = state;

  // --- Leave the base: only on a six, onto the own start field (progress 0).
  if (isInBase(piece.progress)) {
    if (value !== SIX) return null;
    const cell = absoluteCell(s, 0);
    if (isBarrierAt(state, cell)) return null;
    const occ = trackPiecesAt(state, cell);
    const own = occ.filter((p) => p.color === piece.color);
    if (own.length > 0) {
      return rules.barriers ? { pieceId: piece.id, targetProgress: 0 } : null;
    }
    const opp = occ.find((p) => p.color !== piece.color);
    return { pieceId: piece.id, targetProgress: 0, capturedPieceId: opp?.id };
  }

  const target = piece.progress + value;

  // --- Move along the shared track (does not reach the goal yet).
  if (piece.progress < TRACK_LENGTH && target < TRACK_LENGTH) {
    for (let p = piece.progress + 1; p < target; p++) {
      if (isBarrierAt(state, absoluteCell(s, p))) return null; // can't jump a barrier
    }
    const cell = absoluteCell(s, target);
    if (isBarrierAt(state, cell)) return null;
    const occ = trackPiecesAt(state, cell);
    const own = occ.filter((p) => p.color === piece.color);
    if (own.length > 0) {
      return rules.barriers ? { pieceId: piece.id, targetProgress: target } : null;
    }
    const opp = occ.find((p) => p.color !== piece.color);
    return { pieceId: piece.id, targetProgress: target, capturedPieceId: opp?.id };
  }

  // --- Entering / moving within the goal lane. Exact count required.
  if (target > GOAL_END) return null; // overshoot

  // Barrier check for any remaining shared-track cells before the goal turn-in.
  for (let p = piece.progress + 1; p < TRACK_LENGTH; p++) {
    if (isBarrierAt(state, absoluteCell(s, p))) return null;
  }

  const goalIdx = target - GOAL_START;
  const occupied = goalOccupied(state, piece.color, piece.id);
  if (occupied.has(goalIdx)) return null; // can't land on own piece (no stacking in goal)

  if (rules.noJumpInGoal) {
    const from = isInGoal(piece.progress) ? piece.progress - GOAL_START + 1 : 0;
    for (let gi = from; gi < goalIdx; gi++) {
      if (occupied.has(gi)) return null; // Überspring-Verbot
    }
  }

  return { pieceId: piece.id, targetProgress: target };
}

/** All piece ids the current player may legally move with `value`. */
export function getLegalMoves(state: GameState, value: number): string[] {
  const player = currentPlayer(state);
  const own = state.pieces.filter((p) => p.color === player.color);
  const moves = own.map((p) => computeMove(state, p, value)).filter((m): m is Move => m !== null);
  const pieceById = (id: string) => state.pieces.find((p) => p.id === id)!;

  let candidates = moves;

  // Mandatory six rule: on a six you must bring a piece out (if the start field
  // is free); only when that's impossible may you move a piece already in play.
  if (value === SIX) {
    const outMoves = moves.filter((m) => isInBase(pieceById(m.pieceId).progress));
    if (outMoves.length > 0) candidates = outMoves;
  }

  // Clear-the-start-field rule: a piece sitting on its own start field (progress
  // 0) must be moved away as long as pieces still wait in the base, so the base
  // can empty. Exception: if no piece remains in the base, any piece may move.
  if (candidates === moves) {
    const baseWaiting = own.some((p) => isInBase(p.progress));
    const startPiece = own.find((p) => p.progress === 0);
    if (startPiece && baseWaiting) {
      const clearMove = moves.find((m) => m.pieceId === startPiece.id);
      if (clearMove) candidates = [clearMove];
    }
  }

  // Schlagzwang: if a capture is available, only capturing moves are allowed.
  const forceCapture = state.rules.mustCapture || state.rules.mustCaptureExtended;
  if (forceCapture) {
    const captures = candidates.filter((m) => m.capturedPieceId);
    if (captures.length > 0) candidates = captures;
  }

  return candidates.map((m) => m.pieceId);
}

// ---------------------------------------------------------------------------
// Turn transitions
// ---------------------------------------------------------------------------

function advance(state: GameState, extraEvents: GameEvent[]): GameState {
  return {
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    dice: null,
    phase: 'roll',
    rollAttempts: 0,
    extraRoll: false,
    legalMoves: [],
    events: extraEvents,
  };
}

/**
 * Apply a die value for the current player. Handles the mandatory six rule, the
 * optional three-attempts rule, and skipping when no move is possible.
 */
export function applyRoll(state: GameState, value: number): GameState {
  if (state.phase !== 'roll') return state;

  const player = currentPlayer(state);
  const allInBase = state.pieces
    .filter((p) => p.color === player.color)
    .every((p) => isInBase(p.progress));
  const attempt = state.rollAttempts + 1;
  const events: GameEvent[] = [{ type: 'rolled', value }];
  const moves = getLegalMoves(state, value);

  // Rolling a six always grants another roll — including the six that brings a
  // piece onto the board.
  const extraRoll = value === SIX;

  if (moves.length > 0) {
    const rolled: GameState = {
      ...state,
      dice: value,
      phase: 'move',
      rollAttempts: attempt,
      extraRoll,
      legalMoves: moves,
      events,
    };
    // If there is only one legal move, make it automatically — no need to ask.
    if (moves.length === 1) {
      const done = applyMove(rolled, moves[0]);
      return { ...done, events: [...events, ...done.events] };
    }
    return rolled;
  }

  // No legal move this roll.
  if (allInBase && state.rules.threeAttempts && value !== SIX && attempt < 3) {
    // Three-attempts rule: keep the turn, roll again.
    return { ...state, dice: value, phase: 'roll', rollAttempts: attempt, extraRoll: false, legalMoves: [], events };
  }

  events.push({ type: 'skipped', playerId: player.id });
  return advance(state, events);
}

/** Execute the move for `pieceId` (must be in `state.legalMoves`). */
export function applyMove(state: GameState, movePieceId: string): GameState {
  if (state.phase !== 'move' || state.dice === null) return state;
  if (!state.legalMoves.includes(movePieceId)) return state;

  const piece = state.pieces.find((p) => p.id === movePieceId)!;
  const move = computeMove(state, piece, state.dice);
  if (!move) return state;

  const events: GameEvent[] = [];
  const pieces = state.pieces.map((p) => {
    if (p.id === piece.id) return { ...p, progress: move.targetProgress };
    if (p.id === move.capturedPieceId) return { ...p, progress: BASE };
    return p;
  });
  if (move.capturedPieceId) {
    events.push({ type: 'captured', pieceId: move.capturedPieceId, byPieceId: piece.id });
  }
  events.push({ type: 'moved', pieceId: piece.id, from: piece.progress, to: move.targetProgress });

  const next: GameState = { ...state, pieces };
  const player = currentPlayer(state);

  // Win check: all of the player's pieces are in the goal lane.
  const won = pieces.filter((p) => p.color === player.color).every((p) => isInGoal(p.progress));
  if (won) {
    events.push({ type: 'won', playerId: player.id });
    return { ...next, phase: 'gameover', winnerId: player.id, dice: null, legalMoves: [], events };
  }

  if (state.extraRoll) {
    // Same player rolls again (after a six).
    return { ...next, phase: 'roll', dice: null, rollAttempts: 0, extraRoll: false, legalMoves: [], events };
  }

  return advance(next, events);
}
