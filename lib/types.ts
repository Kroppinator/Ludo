// Core domain model for the Ludo board game.
// This layer is pure data — no React, no board pixel geometry.

/** The four player colours available on the 4-player board (phase 1). */
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

/** Number of fields on the shared circular track (4-player board). */
export const TRACK_LENGTH = 40;
/** Number of goal ("Häuschen") fields each player must fill. */
export const GOAL_LENGTH = 4;
/** Pieces per player. */
export const PIECES_PER_PLAYER = 4;
/** Rolling this value lets a piece leave the base and grants another roll. */
export const SIX = 6;

/**
 * A piece's position is expressed as `progress`, measured in steps from the
 * owner's own start field:
 *   -1            → in the base ("B-Feld" / Ausgangsfeld), not yet in play
 *   0 … 39        → on the shared track (0 = own start field)
 *   40 … 43       → in the goal lane (40 = first goal cell, 43 = last)
 *
 * The absolute track cell for a piece on the track is
 *   (owner.startOffset + progress) mod 40
 * which is how collisions/captures between different colours are detected.
 */
export const BASE = -1;
export const GOAL_START = TRACK_LENGTH; // first goal progress value (40)
export const GOAL_END = TRACK_LENGTH + GOAL_LENGTH - 1; // last goal progress (43)

export interface Piece {
  id: string; // `${color}-${index}`
  color: PlayerColor;
  index: number; // 0..3
  progress: number; // see BASE / track / goal ranges above
}

export interface Player {
  id: string;
  name: string;
  age: number;
  color: PlayerColor;
  /** Fixed entry point on the 40-field track: red 0, and clockwise 10/20/30. */
  startOffset: number;
}

/** The six optional rules (Wikipedia "Optionale Regeln") plus our custom option. */
export interface RuleConfig {
  /** Drei-Versuche-Regel: all pieces in base → up to 3 rolls to get a six. */
  threeAttempts: boolean;
  /** Bonus-Wurf: a six on attempts 1–2 of the three-attempts rule grants a re-roll. */
  bonusRollBeforeThird: boolean;
  /** Überspring-Verbot: no jumping over pieces inside the colored goal lane. */
  noJumpInGoal: boolean;
  /** Schlagzwang: if a capture is possible this turn, it must be taken. */
  mustCapture: boolean;
  /** Erweiterter Schlagzwang: must capture even if it costs another full loop. */
  mustCaptureExtended: boolean;
  /** Barrieren-Regel: two own pieces on one field form an impassable barrier. */
  barriers: boolean;
  /** Custom option: start with one piece already on the start field. */
  prePlacedPiece: boolean;
}

export const DEFAULT_RULES: RuleConfig = {
  threeAttempts: true,
  bonusRollBeforeThird: false,
  noJumpInGoal: false,
  mustCapture: false,
  mustCaptureExtended: false,
  barriers: false,
  prePlacedPiece: false,
};

export type Phase = 'roll' | 'move' | 'gameover';

/** Describes what just happened, so the UI can animate it. */
export type GameEvent =
  | { type: 'rolled'; value: number }
  | { type: 'moved'; pieceId: string; from: number; to: number }
  | { type: 'captured'; pieceId: string; byPieceId: string }
  | { type: 'skipped'; playerId: string }
  | { type: 'won'; playerId: string };

export interface GameState {
  /** Players in turn order (index 0 = youngest, then clockwise by board seat). */
  players: Player[];
  pieces: Piece[];
  rules: RuleConfig;
  currentPlayerIndex: number;
  /** Last rolled die value, or null before the first roll of a turn. */
  dice: number | null;
  phase: Phase;
  /** Consecutive roll attempts this turn (for the three-attempts rule). */
  rollAttempts: number;
  /** True when the current player earns another roll (after a six). */
  extraRoll: boolean;
  /** Piece ids the current player may legally move with the current die. */
  legalMoves: string[];
  winnerId: string | null;
  events: GameEvent[]; // events produced by the most recent action
}

export function pieceId(color: PlayerColor, index: number): string {
  return `${color}-${index}`;
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function isOnTrack(progress: number): boolean {
  return progress >= 0 && progress < TRACK_LENGTH;
}

export function isInGoal(progress: number): boolean {
  return progress >= GOAL_START && progress <= GOAL_END;
}

export function isInBase(progress: number): boolean {
  return progress === BASE;
}

/** Absolute cell on the shared 40-field track for a track piece. */
export function absoluteCell(startOffset: number, progress: number): number {
  return (startOffset + progress) % TRACK_LENGTH;
}
