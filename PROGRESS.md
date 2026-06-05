# DDE Port — Progress & TODO

Branch: `feature/update-dde-app` (off `master`). Last updated: 2026-06-04.

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

## Menu/navigation arrow-key support + carousel — DONE (2026-05-31)

All three pieces implemented in `client/src/pages/`; client `tsc --noEmit` passes clean.
Everything routes keyboard input through `useKeyConfig().getButton(e)` (rebind- and
WASD/P2-aware). GSAP animation doesn't paint in headless, so verify the carousel in a
real browser.

1. **MainMenu arrow-key nav** — DONE (`MainMenu.tsx`). up/down move `activeChoice`
   (wrapping) + `blop`, Enter confirms + `start`, Escape → home + `back`.

2. **ChooseSong 3D carousel** — DONE (`ChooseSong.tsx`). Replaced the plain list with a
   GSAP-rotated 3D cylinder (perspective + `rotateY(i·θ) translateZ(radius)`, θ = 360/N,
   unbounded index for infinite wrap). Carousel phase: ←→ rotate + `blop`, Enter zooms
   the front card forward + `start` → reveals the difficulty picker, Esc → menu + `back`.
   Difficulty phase: ↑↓ change difficulty + `blop`, ←→ change speed mod (1–4, 0.5 steps)
   + `blop`, Enter loads, Esc back to carousel. P1 = arrows, P2 = WASD (via `btn.player`).
   Audio preview is debounced (350 ms) so fast spinning doesn't load every song. The
   legacy groove-radar chart is still not ported (optional).

3. **Home arrow-key nudge** — DONE, now matches legacy (`Home.tsx`). Each arrow image
   translates ~20px in its own *screen* direction on press (translate listed before the
   rotate so it applies in screen space) + `grayscale(1) brightness(2)`, reset on keyup;
   Enter → main menu. Switched from hardcoded keys to `useKeyConfig`.

### Notes for the carousel work
- `useKeyConfig().getButton(e)` is the unified input entry point — use it everywhere
  (menus, carousel, home) instead of hardcoding keys, so rebinds + future gamepad work.
- Legacy supported **gamepads** (`gamepadbuttondown` events, `gamepad.js`). Not ported.
  Out of scope unless requested.
- SFX live at `/audio/soundEffects/` (`blop`, `start`, `back`, etc.); play via
  `AudioEngine.playSfx(name)`.
- Legacy `chooseSong` also drew a **groove radar** chart (d3 `radar-chart.js`) per
  difficulty. Not yet in the React port. Optional.

## Timing accuracy overhaul + audio calibration — DONE (2026-06-04)

Verified by hand in a real browser (Chromium): a song with BPM changes/stops plays
with arrows and judgment locked together, and calibration removes the early-press bias.
`tsc --noEmit` passes clean.

1. **Visual↔judgment desync fix** (the "arrow stays visible after a hit / arrows stop
   disappearing mid-song" bug). Root cause: the GSAP arrow timeline ran free
   (`tl.timeScale()` + `addPause()`) and accumulated its own time, drifting from the
   worker's judgment clock — worst where a BPM change and a stop share a beat. Fix:
   - New shared `client/src/game/tempo.ts` (`getStopTime`/`getBPMTime`), imported by
     **both** `gameWorker.ts` and `ArrowEngine.ts` so they share one notion of song time.
   - `ArrowEngine` no longer free-runs. `start(startWall)` scrubs `tl.time()` from the
     same wall clock the worker uses, via a tempo map (`receptorTime` and its bisection
     inverse `beatAtElapsed`). Stops show up as a plateau in the inverse (arrows freeze).
   - `Game.tsx` shares one `startWall = Date.now()` between `audio.start()`,
     `arrowEngine.start(startWall)`, and the worker `startTime` message.
   - Guardrails (always on): worker posts `chartCounts`; `Game.tsx` compares them to
     `ArrowEngine.counts()` and warns on mismatch; `hideArrowImage` returns `false` and
     warns if the hit arrow isn't near the receptor (drift detector).

2. **Per-user audio calibration** (the "I hit it but it didn't count / I always miss
   early" bug). Two parts:
   - Removed the `AudioContext.outputLatency` compensation in `AudioEngine.start()` — the
     reported value is unreliable (35–50ms and wobbling on Firefox/Linux while true HW
     latency ≈0), which injected a measured early bias. Still subtract `lookAhead`.
   - New `client/src/game/calibration.ts` (localStorage offset) + `Calibrate.tsx`
     tap-to-the-beat metronome screen (routed in `App.tsx`, linked from `MainMenu`). The
     measured median offset is applied in the worker as `JUDGMENT_OFFSET` (added to each
     press before judging). `Game.tsx` reads it via `getCalibrationMs()`; `?offset=<ms>`
     overrides for testing. Sign: **positive = player presses early**.

3. **Debug instrumentation** (separate commit, gated behind `?debug=1`): worker logs
   per-hit/miss offsets + a HIT-OFFSET/SUMMARY readout; `Game.tsx` logs frame jank /
   longtask / LoAF and keydown handler lag; `` ` `` jumps to Results. Left in on purpose —
   cheap and exactly what's wanted the next time timing drifts.

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
