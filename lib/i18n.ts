'use client';

// Lightweight i18n: a flat dictionary per language plus a context/hook.
// No external dependency.

import { createContext, useContext } from 'react';

export type Lang = 'en' | 'de';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

type Dict = Record<string, string>;

const en: Dict = {
  'app.title': 'Ludo',
  'app.subtitle': 'The classic board game — for tablet & phone',

  'setup.language': 'Language',
  'setup.players': 'Number of players',
  'setup.player': 'Player {n}',
  'setup.name': 'Name',
  'setup.age': 'Age',
  'setup.namePlaceholder': 'Name',
  'setup.dice': 'Dice',
  'setup.dice.virtual': 'Virtual dice',
  'setup.dice.virtualHint': 'The app rolls a random number.',
  'setup.dice.physical': 'Physical dice',
  'setup.dice.physicalHint': 'Roll your own dice and tap the result.',
  'setup.rules': 'Optional rules',
  'setup.moreRules': 'More rules',
  'setup.start': 'Start game',
  'setup.needNames': 'Please enter a name for every player.',
  'setup.youngestStarts': 'Youngest player starts, then clockwise.',

  'rule.threeAttempts': 'Three attempts',
  'rule.threeAttempts.desc': 'When no piece can move, roll up to three times for a six.',
  'rule.bonusRollBeforeThird': 'Bonus roll',
  'rule.bonusRollBeforeThird.desc': 'A six on attempts 1–2 grants an extra roll.',
  'rule.noJumpInGoal': 'No jumping in the goal',
  'rule.noJumpInGoal.desc': 'Pieces may not jump over others in the goal lane.',
  'rule.mustCapture': 'Must capture',
  'rule.mustCapture.desc': 'If you can capture, you must.',
  'rule.mustCaptureExtended': 'Extended must-capture',
  'rule.mustCaptureExtended.desc': 'Capture even if it costs another lap.',
  'rule.barriers': 'Barriers',
  'rule.barriers.desc': 'Two own pieces on one field block everyone.',
  'rule.prePlacedPiece': 'One piece pre-placed',
  'rule.prePlacedPiece.desc': 'Start with one piece already on the start field.',

  'game.turn': "{name}'s turn",
  'game.roll': 'Roll',
  'game.rollAgain': 'Roll again',
  'game.tapToRoll': 'Tap to roll',
  'game.enterRoll': 'Tap your roll',
  'game.pickPiece': 'Pick a piece to move',
  'game.noMove': 'No move possible',
  'game.rolled': 'Rolled {value}',
  'game.wins': '{name} wins! 🎉',
  'game.newGame': 'New game',
  'game.attempts': 'Attempt {n} of 3',
};

const de: Dict = {
  'app.title': 'Chill dein Leben, Digga!',
  'app.subtitle': 'Das klassische Brettspiel — für Tablet & Smartphone',

  'setup.language': 'Sprache',
  'setup.players': 'Anzahl der Spieler',
  'setup.player': 'Spieler {n}',
  'setup.name': 'Name',
  'setup.age': 'Alter',
  'setup.namePlaceholder': 'Name',
  'setup.dice': 'Würfel',
  'setup.dice.virtual': 'Virtueller Würfel',
  'setup.dice.virtualHint': 'Die App würfelt eine Zufallszahl.',
  'setup.dice.physical': 'Echter Würfel',
  'setup.dice.physicalHint': 'Selbst würfeln und das Ergebnis antippen.',
  'setup.rules': 'Optionale Regeln',
  'setup.moreRules': 'Weitere Regeln',
  'setup.start': 'Spiel starten',
  'setup.needNames': 'Bitte für jeden Spieler einen Namen eingeben.',
  'setup.youngestStarts': 'Der jüngste Spieler beginnt, dann im Uhrzeigersinn.',

  'rule.threeAttempts': 'Drei Versuche',
  'rule.threeAttempts.desc': 'Wenn keine Figur ziehen kann, dreimal auf eine Sechs würfeln.',
  'rule.bonusRollBeforeThird': 'Bonus-Wurf',
  'rule.bonusRollBeforeThird.desc': 'Eine Sechs im 1.–2. Versuch bringt einen Extra-Wurf.',
  'rule.noJumpInGoal': 'Kein Überspringen im Ziel',
  'rule.noJumpInGoal.desc': 'Im Zielbereich darf keine Figur übersprungen werden.',
  'rule.mustCapture': 'Schlagzwang',
  'rule.mustCapture.desc': 'Wer schlagen kann, muss schlagen.',
  'rule.mustCaptureExtended': 'Erweiterter Schlagzwang',
  'rule.mustCaptureExtended.desc': 'Schlagen, auch wenn es eine weitere Runde kostet.',
  'rule.barriers': 'Barrieren',
  'rule.barriers.desc': 'Zwei eigene Figuren auf einem Feld blockieren alle.',
  'rule.prePlacedPiece': 'Eine Figur vorgesetzt',
  'rule.prePlacedPiece.desc': 'Mit einer Figur auf dem Startfeld beginnen.',

  'game.turn': '{name} ist am Zug',
  'game.roll': 'Würfeln',
  'game.rollAgain': 'Nochmal würfeln',
  'game.tapToRoll': 'Zum Würfeln tippen',
  'game.enterRoll': 'Wurf antippen',
  'game.pickPiece': 'Figur zum Ziehen wählen',
  'game.noMove': 'Kein Zug möglich',
  'game.rolled': 'Eine {value} gewürfelt',
  'game.wins': '{name} gewinnt! 🎉',
  'game.newGame': 'Neues Spiel',
  'game.attempts': 'Versuch {n} von 3',
};

const DICTS: Record<Lang, Dict> = { en, de };

export function translate(lang: Lang, key: string, params?: Record<string, string | number>): string {
  let s = DICTS[lang][key] ?? DICTS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

export interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}
