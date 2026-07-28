import type { PlayerColor } from './types';

/** Piece / zone colours (match the Tailwind theme in globals.css). */
export const COLOR_HEX: Record<PlayerColor, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#ca8a04',
};

/** A soft tint of each colour for goal lanes and base areas. */
export const COLOR_TINT: Record<PlayerColor, string> = {
  red: '#f7d5d5',
  blue: '#d3e0fb',
  green: '#d1ecdb',
  yellow: '#f0e4c2',
};

/** Colour assignment by player count (seated clockwise: top, right, bottom, left). */
export const COLORS_BY_COUNT: Record<number, PlayerColor[]> = {
  2: ['green', 'blue'], // top & bottom (opposite)
  3: ['green', 'yellow', 'blue'],
  4: ['green', 'yellow', 'blue', 'red'], // clockwise seating
};
