'use client';

import type { GameState } from '@/lib/types';
import { currentPlayer, isInBase } from '@/lib/types';
import { COLOR_HEX } from '@/lib/colors';
import { useI18n } from '@/lib/i18n';
import Dice, { DiceMode } from './Dice';

export default function GameControls({
  state,
  diceMode,
  onRoll,
  onNewGame,
}: {
  state: GameState;
  diceMode: DiceMode;
  onRoll: (value: number) => void;
  onNewGame: () => void;
}) {
  const { t } = useI18n();
  const player = state.winnerId
    ? state.players.find((p) => p.id === state.winnerId)!
    : currentPlayer(state);

  const allInBase = state.pieces
    .filter((p) => p.color === player.color)
    .every((p) => isInBase(p.progress));

  let status = '';
  if (state.phase === 'gameover') status = t('game.wins', { name: player.name });
  else if (state.phase === 'move') status = t('game.pickPiece');
  else if (state.rollAttempts > 0 && state.rules.threeAttempts && allInBase)
    status = t('game.attempts', { n: state.rollAttempts + 1 });
  else if (state.extraRoll) status = t('game.rollAgain');
  else status = t('game.tapToRoll');

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <span className="inline-block h-4 w-4 rounded-full" style={{ background: COLOR_HEX[player.color] }} />
        {state.phase === 'gameover' ? status : t('game.turn', { name: player.name })}
      </div>

      {state.phase !== 'gameover' && (
        <>
          <p className="min-h-5 text-sm text-stone-500">{status}</p>
          <Dice
            mode={diceMode}
            disabled={state.phase !== 'roll'}
            lastValue={state.dice}
            onRoll={onRoll}
          />
        </>
      )}

      <button
        onClick={onNewGame}
        className="mt-2 rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100"
      >
        {t('game.newGame')}
      </button>
    </div>
  );
}
