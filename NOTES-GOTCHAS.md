# DDE Port — Gotchas

Non-obvious things that cost real debugging time. Read before touching audio, input, or CSS.

## Audio: Tone.js double-encodes URLs with spaces

`new Tone.Player(url)` / Tone's buffer loader sets an `<a>`'s `href` then reads back
`anchor.pathname` (which yields `%20` for a space) and runs `encodeURIComponent` over it →
`%2520`. **No input string avoids this** — pre-encoding or not changes nothing, because the
anchor round-trip re-introduces `%20` before Tone encodes again.

**Fix in place:** `AudioEngine` (`client/src/game/AudioEngine.ts`) bypasses Tone's URL
loader entirely — `fetch(encodeURI(path))` → Web Audio `decodeAudioData` → hand Tone a ready
`ToneAudioBuffer`. Players are built lazily in `waitForLoad()` / `startPreview()` so the
AudioContext is resumed by a user gesture first. **Don't** go back to passing a URL string
straight into a Tone player for song files with spaces.

## Input: keyConfig schema contract (key→dir vs dir→key)

`localStorage.keyConfig.p1` / `.p2` are stored as **direction → keyboard key**
(`{ left: "ArrowLeft", ... }`), the format `Keybinding.tsx` writes. `useKeyConfig.ts` builds
the reverse (key → direction) lookup internally. Earlier the reader assumed the opposite
shape, so any rebind made every lookup `undefined` → all arrow presses ignored in-game.

**Rule:** all key handling goes through `useKeyConfig().getButton(e)`. If you add a writer of
`keyConfig.*`, it must use the direction→key shape.

## CSS: Tailwind/PostCSS emitted ZERO utilities

Root cause of most early layout breakage: Tailwind ran from the wrong cwd relative to the
config path and generated no utility classes at all, so `overflow-hidden`, `flex-1`, etc. did
nothing. Once that was fixed, several latent layout bugs surfaced (see below). If utilities
mysteriously have no effect, check the Tailwind/PostCSS config resolution first.

## CSS: game layout sizing (each fixed one specific symptom)

- Arrow animation travels **1000vh** total (from `100vh` to `-900vh`) so an arrow reaches the
  target at exactly `arrowTime` seconds. `-110vh` was wrong.
- `.arrowPlace` (target/receptor) sits at `top: 0` — the chute is at the top of the column,
  not the bottom.
- `.animContainer` needs `position:absolute; width:100%; height:100%; z-index:0`.
- `.arrow-lane` needs an explicit width (e.g. `60vw`): receptors/arrows are absolutely
  positioned (0 in-flow width), so the four `flex-1` columns otherwise collapse to 0 and
  stack at center.
- `#animationJSContainer` height must be viewport-based (`calc(100vh - 56px)`, 56px navbar) —
  `height:100%` resolved to 0 because `<main>` has no explicit height, and once
  `overflow-hidden` actually generated, the 0-height clipped the whole play area to empty.

## GSAP in headless browsers

GSAP's rAF ticker doesn't paint in headless Chromium, so arrows look static in screenshots
even though the animation is correct. Verify timing via `tl.seek()` / numeric checks, not
pixels. (Real browsers animate fine.)

## Legacy app on modern Node (worktree only)

The legacy worktree (`/home/sean/Coding/dde-legacy`) needs
`NODE_OPTIONS=--openssl-legacy-provider` (old mongodb driver uses a hash OpenSSL 3 rejects),
a trimmed `package.json` (no gulp3/node-sass/babel5), and bumped HTTP middleware (the
2012-era versions read the removed `res._headers` and crash on 304s on Node 24). All baked
into that worktree's npm scripts — not relevant to the port itself, but noted so it isn't
re-debugged.
