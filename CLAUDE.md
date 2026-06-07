# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`naufragi-game` is a static site for a Catalan solo tabletop RPG ("Naufragi"). It is a printable, editable A4 character sheet plus a small landing menu. There is **no build step, no framework, and no dependencies** — every page is a single self-contained HTML file with inline CSS and vanilla JS. Deployed to Netlify as static files.

## Development

- **Run locally:** open the HTML file directly in a browser, or serve the folder (e.g. `python3 -m http.server`). No install/build.
- **Deploy:** Netlify publishes the repo root (`publish = "."` in `netlify.toml`); pushing to `main` deploys. `netlify.toml` also sets security headers (`X-Frame-Options: DENY`, etc.) — note `DENY` blocks the sheet from being iframed.
- **Language:** all UI copy is in Catalan (`lang="ca"`). Preserve Catalan text and accents (e.g. `estel·lar`) when editing.
- No tests, linter, or formatter are configured.

## Architecture

- `index.html` — landing menu with three buttons. "Naufragi" navigates to `naufragi.html`; "Portades de llum" and "Buidor estel·lar" are stubs (`alert('Not implemented')`) for game modes not yet built.
- `naufragi.html` — the full character sheet (~1500 lines, self-contained). This is the real application.
- `naufragi-fitxes-a4-editable.html` — an older/duplicate copy of the sheet kept around; `naufragi.html` is the canonical one served at the menu link.

### Inside `naufragi.html`

Everything lives in one file: A4 print layout (`.page`, two pages), a fixed top controls bar, and an inline `<script>` at the bottom. Key pieces:

- **Persistence** — state auto-saves to `localStorage` under the key `naufragi_fitxa_v1`. `gatherState()` serializes all inputs + the map canvas; `applyState()` restores them. Auto-save is debounced and wired in `attachAutoSave()`. `exportJSON()`/`importJSON()` move the same state object to/from a downloadable file. **If you add a field, make sure it flows through `gatherState`/`applyState` or it won't persist.**
- **Map** — a `<canvas>` (`mapCanvas`) the player draws on with pointer events; serialized as a data URL in the saved state.
- **Adventure deck** — a 52-card deck built from `SUITS` × `RANKS` (`buildFullDeck`); cards are drawn, dragged, and returned as DOM elements. Card IDs are `suitId-rank` strings, parsed by `parseCardId`.
- **Dice** — a floating panel with CSS-3D dice; `rollDice()` animates rotation to a result.
- **Init** — `DOMContentLoaded` runs `init()`, `initCards()`, `initDice()`.

When adding a new game mode (the stubbed menu buttons), follow the same pattern: one new self-contained HTML file, namespaced `localStorage` key, linked from `index.html`.
