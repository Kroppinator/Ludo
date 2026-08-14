'use client';

import { useReducer, useState, useMemo, useCallback } from 'react';
import { I18nContext, Lang, translate } from '@/lib/i18n';
import type { GameState, Player, RuleConfig } from '@/lib/types';
import { createGame, applyRoll, applyMove } from '@/lib/game';
import SetupWizard, { type SetupSnapshot } from '@/components/SetupWizard';
import Board from '@/components/Board';
import GameControls from '@/components/GameControls';
import WinCelebration from '@/components/WinCelebration';
import LanguageSwitch from '@/components/LanguageSwitch';
import type { DiceMode } from '@/components/Dice';

type Action =
  | { type: 'START'; players: Player[]; rules: RuleConfig }
  | { type: 'ROLL'; value: number }
  | { type: 'MOVE'; pieceId: string }
  | { type: 'RESET' };

function reducer(state: GameState | null, action: Action): GameState | null {
  switch (action.type) {
    case 'START':
      return createGame(action.players, action.rules);
    case 'ROLL':
      return state ? applyRoll(state, action.value) : state;
    case 'MOVE':
      return state ? applyMove(state, action.pieceId) : state;
    case 'RESET':
      return null;
  }
}

export default function Home() {
  const [lang, setLang] = useState<Lang>('de');
  const [diceMode, setDiceMode] = useState<DiceMode>('virtual');
  const [lastSetup, setLastSetup] = useState<SetupSnapshot | null>(null);
  const [game, dispatch] = useReducer(reducer, null);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang],
  );
  const i18n = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  const handleStart = (players: Player[], rules: RuleConfig, mode: DiceMode, snapshot: SetupSnapshot) => {
    setDiceMode(mode);
    setLastSetup(snapshot);
    dispatch({ type: 'START', players, rules });
  };

  return (
    <I18nContext.Provider value={i18n}>
      {!game ? (
        <main className="min-h-dvh py-4">
          <SetupWizard onStart={handleStart} initial={lastSetup} />
        </main>
      ) : (
        <main className="flex min-h-dvh flex-col items-center gap-4 p-4">
          <div className="flex w-full max-w-md items-center justify-between">
            <h1 className="text-lg font-bold text-board-border">{t('app.title')}</h1>
            <LanguageSwitch />
          </div>
          <Board state={game} onPieceClick={(id) => dispatch({ type: 'MOVE', pieceId: id })} />
          <GameControls
            state={game}
            diceMode={diceMode}
            onRoll={(value) => dispatch({ type: 'ROLL', value })}
            onNewGame={() => dispatch({ type: 'RESET' })}
          />
          {game.phase === 'gameover' && game.winnerId && (
            <WinCelebration
              winnerName={game.players.find((p) => p.id === game.winnerId)!.name}
              color={game.players.find((p) => p.id === game.winnerId)!.color}
              onNewGame={() => dispatch({ type: 'RESET' })}
            />
          )}
        </main>
      )}
    </I18nContext.Provider>
  );
}
