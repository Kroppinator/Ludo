# Ludo

A touch-first **Ludo** (pachisi-style race game) for tablet and smartphone — pass-and-play for 2–4 players. German edition name: **"Chill dein Leben, Digga!"**

The game rules live in a pure, framework-free TypeScript engine covered by unit tests; the UI is a Next.js app optimized for touch.

## Features

- **2–4 player pass-and-play** on a single device
- Authentic 4-player cross board, **clockwise** movement
- **Virtual dice** (random roll) or **physical dice** (tap the face you actually rolled)
- All mandatory rules plus **toggleable optional rules**
- **English & German** (German is the default), switchable in-app
- Smooth **Framer Motion** animations — 3D piece hops, capture "kick", and a **win celebration** with confetti
- Personal avatar in the center of the board

## Rules

**Mandatory:** roll a six to leave the base, a six grants another roll, landing on an opponent sends it back to base, you can't land on your own piece, exact count to enter the goal, a piece on the start field must be cleared while pieces wait in the base, three attempts to roll a six when otherwise stuck, and you win by bringing all four pieces home.

**Optional (toggles in setup):** Three attempts · No jumping in the goal · Must capture (Schlagzwang) · Extended must-capture · Barriers · One piece pre-placed.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) · [React 19](https://react.dev/) · TypeScript (strict)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Vitest](https://vitest.dev/) — rules-engine tests

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` / `build` / `start` | Next.js dev server / build / serve |
| `lint` | ESLint |
| `typecheck` | `tsc --noEmit` |
| `test` / `test:watch` | Vitest (run once / watch) |

## Project structure

- **`lib/`** — pure, framework-free rules engine (`types`, `game`, `board4`) plus `i18n` and `colors`. Fully unit-tested.
- **`components/`** — `Board`, `Piece`, `Dice`, `SetupWizard`, `GameControls`, `WinCelebration`, `RuleToggles`, `LanguageSwitch`, …
- **`app/`** — Next.js App Router entry (`page.tsx`, `layout.tsx`, `globals.css`).

## Testing & CI

`npm test` runs the Vitest suite covering every mandatory and optional rule. GitHub Actions runs type-check + tests on every push and pull request (see `.github/workflows/ci.yml`).

## Roadmap

- 6-player hexagonal board
- Touch hardening (larger piece hit-areas)

## Credits

Built by **Kroppinator** & **Claude**.

---

This is an original Ludo / pachisi-style game and is not affiliated with, or endorsed by, any trademarked commercial edition.
