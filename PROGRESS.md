# DDE Port — Progress & TODO

Branch: `feature/update-dde-app` (off `master`). Last updated: 2026-05-31.

Porting the original Angular 1.5 DDR game to **React 18 + TypeScript + Vite** (`client/`)
with a new **Express + TypeScript** server (`server/src/`). The legacy app is preserved,
runnable, and used as a behavioral oracle (see "Legacy reference" below).

## How to run

```bash
docker compose up -d        # MongoDB
npm run seed                # first time only — seeds songs + users
npm run dev                 # vite :5173 + tsx server :3000
```

App at http://localhost:5173. Seed login: `testing@fsa.com` / `password`
(other seed users: `obama@gmail.com`/`potus`, `K@gmail.com`/`K`). These are throwaway
local dev accounts defined in `server/src/seed.ts`.

## Done on this branch

| Commit | What |
|--------|------|
| `36af786` | Initial port: React/TS/Vite client, Express/TS server, game engine (ArrowEngine, AudioEngine/Tone.js, ScoreEngine, Web Worker timing), Mongoose 8, Passport, Socket.IO, docker-compose, seed |
| `b7690d9` | Fix double-encoded audio URLs for filenames with spaces (`%2520`) |
| `28a385b` | Fix arrow keys ignored in-game after any rebind (keyConfig schema mismatch) |

Earlier engine/layout fixes (folded into the port commit) are recorded in agent memory:
Tailwind/PostCSS emitting zero utilities, arrow animation travel distance, `.arrowPlace`
position, `.animContainer`/`.arrow-lane`/`#animationJSContainer` sizing.

## In progress (interrupted mid-task)

**Menu/navigation arrow-key support + carousel.** I had just finished *reading* the legacy
implementation to port it faithfully; no code written yet. Three pieces requested:

1. **MainMenu arrow-key nav** — currently mouse-only (`client/src/pages/MainMenu.tsx`).
   Legacy (`mainMenu.js`): up/down move `activeChoice` (wrapping), Enter confirms +
   `start` sfx, up/down play `blop` sfx, Escape → home + `back` sfx.

2. **ChooseSong 3D carousel** — currently a plain scrolling list
   (`client/src/pages/ChooseSong.tsx`). Legacy is a rotating 3D carousel
   (`carousel.factory.js`, uses GSAP/TweenMax + CSS 3D transforms): left/right rotate
   between songs (`blop`), Enter selects + zooms the song forward (`start`) then reveals
   the difficulty picker, Escape backs out. Difficulty picker: up/down change level
   (`blop`), left/right change speed mod (1–4, 0.5 steps), Enter loads the song.

3. **Home arrow-key nudge** — DONE in current `Home.tsx` but **differs from legacy**.
   Legacy (`home.js`) physically *translates* each arrow image ~20px in its own
   direction (left arrow shifts `left:-20px`, up shifts `top:-20px`, etc.) plus a
   grayscale/brightness filter, and resets on keyup; Enter → main menu. The current
   React version only applies a brightness/drop-shadow filter (no positional nudge) and
   uses hardcoded `ArrowLeft`/`WASD` rather than `useKeyConfig`. **Decide:** match legacy
   nudge, or keep the current filter-only effect.

### Notes for the carousel work
- `useKeyConfig().getButton(e)` is the unified input entry point — use it everywhere
  (menus, carousel, home) instead of hardcoding keys, so rebinds + future gamepad work.
- Legacy supported **gamepads** (`gamepadbuttondown` events, `gamepad.js`). Not ported.
  Out of scope unless requested.
- SFX live at `/audio/soundEffects/` (`blop`, `start`, `back`, etc.); play via
  `AudioEngine.playSfx(name)`.
- Legacy `chooseSong` also drew a **groove radar** chart (d3 `radar-chart.js`) per
  difficulty. Not yet in the React port. Optional.

## Other known TODO / gaps

- **Versus** (`Versus.tsx`) exists but is less exercised than single-player; verify after
  carousel work since ChooseSong feeds both.
- **Upload** page exists; round-trip (sm + audio) not re-verified post-port.
- Groove radar visualization not ported (see above).
- Gamepad support not ported.

## Gotchas (load-bearing, non-obvious)

See `NOTES-GOTCHAS.md` for the technical gotchas that cost real debugging time
(Tone.js double-encoding, keyConfig schema contract, Tailwind/PostCSS cwd, GSAP headless
rendering, game layout sizing). Read it before touching audio, input, or CSS.

## Legacy reference

Original Angular app runs from an isolated worktree at `/home/sean/Coding/dde-legacy`
(branch `legacy-run`). To run: `cd /home/sean/Coding/dde-legacy && npm install &&
npm run build && npm run seed && npm start` → http://localhost:1337. Login by USERNAME
(not email): `Testing`/`password`. Source of truth for original behavior. Key files:
`browser/js/{home,mainMenu,chooseSong}/` and `browser/js/common/factories/`.

## Debug tooling

`debug/` holds Playwright diagnostics (gitignored / kept local):
- `input-test.mjs` — logs in, enters a game, fires arrow keys, reports receptor flashes +
  worker hit/miss messages + score. Proved in-game input works end-to-end.
- `repro-keyconfig.mjs` — reproduces the keyConfig-invert bug (0 flashes → 120 after fix).
- `diagnose.mjs` / `diagnose-legacy.mjs` — compare port vs legacy game view.
