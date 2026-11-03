# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`naufragi-game` is a static site for Catalan solo tabletop RPGs ("Naufragi" and "Portadores de llum"). It provides printable, editable A4 character sheets plus a landing menu. It is a **React + TypeScript single-page app built with Vite**, deployed to Netlify. The original implementation was a set of self-contained HTML files; those are preserved (unmaintained) in `legacy/`.

## Development

- **Install:** `npm install`
- **Run locally:** `npm run dev` (Vite dev server).
- **Build:** `npm run build` (runs `tsc -b` for type-checking, then `vite build` → `dist/`).
- **Preview a build:** `npm run preview`.
- **Deploy:** Netlify runs `npm run build` and publishes `dist/` (see `netlify.toml`). A SPA redirect (`/* → /index.html`) makes deep links like `/naufragi` resolve on reload. Security headers (`X-Frame-Options: DENY`, etc.) are set there too.
- **Language:** all UI copy is in Catalan (`lang="ca"`). Write Catalan text with literal accented characters (`é`, `í`, `ò`, `ç`, `·`) directly in JSX — no HTML entities.
- No tests, linter, or formatter are configured. TypeScript is `strict` with `noUnusedLocals`/`noUnusedParameters`, so the build fails on unused symbols.

## Architecture

Routing (`src/App.tsx`, `react-router-dom`): `/` → `Home`, `/naufragi` → `NaufragiPage`, `/portadores` → `PortadoresPage`. The Home menu only links Naufragi; Portadores de llum is shown disabled ("En desenvolupament"), though its routes still work by URL.

### Persistence — the central pattern (`src/context/SheetContext.tsx`)

Each sheet page wraps its content in a `<SheetProvider storageKey="…" exportFallbackName="…">`. The provider holds the **entire sheet state** as one object:

- `fields: Record<string, string | boolean>` — every simple input, keyed by a string.
- `deck: string[]` and `drawnCards: DrawnCard[]` — the card system.
- `extra: Record<string, unknown>` — page-specific blobs (Naufragi's freehand `mapData` URL; Portadores' `territoris` map).

Components read/write through the `useSheet()` hook rather than touching the DOM. State **auto-saves to `localStorage` (debounced ~600ms)** via an effect, and the same object is what `exportJSON`/`importJSON` move to/from a file. Named saves ("Desar"/"Carregar" dialogs in `ControlsBar`) are stored as a `SavedGame[]` under `${storageKey}__partides` via `saveAs`/`loadSaved`/`deleteSaved`. `normalize()` migrates the old vanilla-JS flat save format (top-level keys + `_deck`/`_mapData`/`_territoris`) into the nested shape, so older saves still load.

**To add a field:** give it a unique key and bind it with `<TextField fieldKey="…">` / `<CheckField fieldKey="…">` (`src/components/fields/Fields.tsx`). It then persists automatically — no wiring needed. For richer per-page state, store it under `extra` via `getExtra`/`setExtra`.

### Shared components (`src/components/`)

- `ControlsBar` — fixed top bar (save / export / import / print / clear + save flash, and an optional `onHelp` “!” button). Pulls all actions from `useSheet()`.
- `Modal` — native `<dialog>` wrapper shared by the save/load dialogs and `WelcomeDialog`.
- `WelcomeDialog` — how-to-play + storage disclaimer for Naufragi; opens automatically on first visit (flag `naufragi_benvinguda_vista` in localStorage) and from the bar's “!” button.
- `Credits` — faint footer crediting the background painting (rendered once in `App.tsx`).
- `DiceRoller` — floating FAB + 2d6 CSS-3D dice panel; self-contained, no persistence.
- `cards/CardTable` + `cards/PlayingCard` — the 52-card adventure deck (faces use the rulebook suit glyphs via `cards/SuitIcon`; the back masks `public/img/palmera-carta.png` in brass). Cards are drawn onto an absolutely-positioned overlay and dragged with pointer events (position stored in `drawnCards`). `<CardTable orientation="landscape" />` for landscape sheets (Naufragi), default portrait (Portadores). Card logic/types live in `src/lib/cards.ts`.

### Pages (`src/pages/`)

- `Naufragi/` — landscape A4 sheets: character + diary; island map + locations legend (own page); events/ally/leaving; cards. `NaufragiMap` is a `<canvas>` serialized to a data URL in `extra.mapData`, with pencil/path/eraser, stamps (`stamps.ts`, drawn with canvas paths) and in-memory undo. Location numbers are dragged (or tapped, then tap the map) from the legend onto the map as pins stored in `extra.mapPins` (`{ [locNum]: {x,y} }` in % of the map); pin labels read the `loc_N` field live.
- `Portadores/` — portrait sheet (Guardià de l'esperança), cards, and `PortadoresMap`: an SVG flat-top hex grid. Clicking a hex opens a type picker; assigning a type auto-creates a linked **territory card** (keyed by hex index, named by coordinate like "A1") in the side panel. Territory types/geometry are in `territoris.ts`; the moves list in `moviments.ts`.

### Styling

Per-component **CSS Modules** (`*.module.css`) plus one global stylesheet (`src/styles/global.css`) for design tokens (`--ink`, `--line`, …), base inputs, the `.sheet-layout`/`.page` wrappers, and print rules. Print uses a `landscape` class + named `@page` to mix portrait and landscape pages. EB Garamond (body) and IM Fell English (display, `--font-display`) are loaded in `index.html`, matching the printed rulebook. The screen background is Vernet's *The Shipwreck* (1772, NGA open access, CC0; `public/img/naufragi-fons.jpg`, 2400px) on `body::before`; pages use a procedural SVG-noise paper (`--paper-texture`: edge gradient + `public/img/paper-mottle.svg`). Both are dropped in print. Sheets reflow on screen below 1180px (two columns) and 700px (one column); print always keeps the A4 layout.

### Adding a new game mode

Add a route in `App.tsx`, a page under `src/pages/`, and wrap it in `<SheetProvider>` with a unique `storageKey`. Reuse `ControlsBar`, `DiceRoller`, `CardTable`, and the field components; put any bespoke state in `extra`.
