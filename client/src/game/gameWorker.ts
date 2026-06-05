// Web Worker — runs timing logic off the main thread
// Ported faithfully from animationWorker.js

import { getStopTime, getBPMTime } from './tempo';

type Direction = 'left' | 'down' | 'up' | 'right';

const indexToDir: Record<string, Direction> = {
  '0': 'left', '1': 'down', '2': 'up', '3': 'right',
};

interface ArrowTime {
  dir: Direction;
  time: number;
  attempted: boolean;
  hit: boolean;
  freeze: boolean;
  freezeUp?: boolean;
  animate?: boolean;
  index: number;
}

interface DirectionChart {
  list: ArrowTime[];
  pointer: number;
}

type Chart = Record<Direction, DirectionChart>;

const chart: Chart = {
  right: { list: [], pointer: 0 },
  left: { list: [], pointer: 0 },
  up: { list: [], pointer: 0 },
  down: { list: [], pointer: 0 },
};

const inFreeze: Record<Direction, { freeze: boolean; fromArrow: number | null }> = {
  left: { freeze: false, fromArrow: null },
  down: { freeze: false, fromArrow: null },
  up: { freeze: false, fromArrow: null },
  right: { freeze: false, fromArrow: null },
};

let TIMING_WINDOW = 0.1;
// Calibration: seconds added to each press timestamp before judging it. Players
// perceive the cue (audio at the speaker / arrow at the receptor) ahead of the
// worker's raw wall clock, so without this they press systematically early and
// only ever miss early. Set via the `offset` query param (ms); 0 = off.
let JUDGMENT_OFFSET = 0;
const timeouts: (() => void)[] = [];
// Latest moment (ms after start) any arrow is checked — used to fire endSong.
let lastFireMs = 0;

// --- Debug instrumentation (enabled via ?debug=1) ---------------------------
let DEBUG = false;
let dbgPresses = 0;   // total keyDown messages processed
let dbgHits = 0;      // presses that registered a hit
let dbgNoHit = 0;     // presses with a candidate arrow but outside the window
let dbgMissTimeouts = 0; // arrows that expired unhit
let dbgHitOffSum = 0; // sum of signed hit offsets (press - arrow.time), seconds
const dbgHitOffs: number[] = []; // signed hit offsets, for mean/median
let dbgEarlyMiss = 0; // genuine early presses (skipped=0: candidate not yet due)
let dbgCascadeMiss = 0; // no-hits after a prior missed note (skipped>0 cascade)

function checkArrow(arrowTime: ArrowTime) {
  if (!arrowTime.hit && !arrowTime.freezeUp) {
    if (DEBUG) {
      dbgMissTimeouts++;
      console.log(
        `[worker] MISS-timeout ${arrowTime.dir} idx=${arrowTime.index} arrow.time=${arrowTime.time.toFixed(3)}s`
      );
    }
    postMessage({ hit: false, index: arrowTime.index, dir: arrowTime.dir });
  } else if (arrowTime.animate) {
    postMessage({ freezeUp: true, dir: arrowTime.dir, index: arrowTime.index });
  } else if (arrowTime.freezeUp) {
    inFreeze[arrowTime.dir].freeze = false;
  }
}

function preChart(
  stepChart: string[][][],
  bpm: number,
  arrowOffset: number,
  songOffset: number,
  timing: number,
  bpms: { beat: number; bpm: number }[],
  stops: { beat: number; duration: number }[],
  debug = false,
  judgmentOffset = 0
) {
  TIMING_WINDOW = timing;
  DEBUG = debug;
  JUDGMENT_OFFSET = judgmentOffset;
  const measureTime = 1 / (bpm / 60 / 4);

  stepChart.forEach((measure, mIdx) => {
    const notes = measure.length;
    const noteTime = measureTime / notes;

    measure.forEach((line, lIdx) => {
      const timeStamp =
        measureTime * mIdx +
        noteTime * lIdx +
        arrowOffset +
        getStopTime(mIdx * 4 + (lIdx / notes) * 4, stops) +
        getBPMTime(mIdx * 4 + (lIdx / notes) * 4, bpms);

      line.forEach((maybeArrow, colIdx) => {
        const dir = indexToDir[String(colIdx)];
        if (!dir) return;

        if (maybeArrow === '1' || maybeArrow === '2') {
          const arrowTime: ArrowTime = {
            dir,
            time: timeStamp,
            attempted: false,
            hit: false,
            freeze: maybeArrow === '2',
            index: 0,
          };
          const idx = chart[dir].list.push(arrowTime) - 1;
          arrowTime.index = idx;

          if (maybeArrow === '2') inFreeze[dir].fromArrow = idx;

          const fireMs = (timeStamp + TIMING_WINDOW - songOffset) * 1000;
          if (fireMs > lastFireMs) lastFireMs = fireMs;
          timeouts.push(() => {
            setTimeout(() => checkArrow(arrowTime), fireMs);
          });
        } else if (maybeArrow === '3') {
          const freezeUpArrow: ArrowTime = {
            dir,
            time: timeStamp,
            attempted: false,
            hit: true,
            freeze: false,
            freezeUp: true,
            index: inFreeze[dir].fromArrow ?? 0,
          };

          timeouts.push(() => {
            setTimeout(() => checkArrow(freezeUpArrow), (timeStamp - TIMING_WINDOW - songOffset) * 1000);
          });
          const animateMs = (timeStamp + TIMING_WINDOW - songOffset) * 1000;
          if (animateMs > lastFireMs) lastFireMs = animateMs;
          timeouts.push(() => {
            setTimeout(() => {
              freezeUpArrow.animate = true;
              checkArrow(freezeUpArrow);
            }, animateMs);
          });
        }
      });
    });
  });

  // Report how many tappable arrows landed in each lane so the main thread can
  // check it matches the DOM arrows — a mismatch means hit indices are misaligned
  // and hits will hide the wrong arrow (arrows "stop disappearing" mid-song).
  postMessage({
    chartCounts: {
      left: chart.left.list.length,
      down: chart.down.list.length,
      up: chart.up.list.length,
      right: chart.right.list.length,
    },
  });
}

function respondToKey(time: number, dir: Direction, lagMs = 0) {
  const thisChart = chart[dir];
  if (!thisChart) return;
  if (DEBUG) dbgPresses++;
  // Re-center the press onto the player's perceived timing before judging.
  time += JUDGMENT_OFFSET;
  if (thisChart.pointer >= thisChart.list.length) {
    if (DEBUG) {
      console.log(`[worker] press ${dir} @${time.toFixed(3)}s — no arrows left in this lane`);
    }
    return;
  }

  // What the press time would have been without input-handler lag.
  const correctedTime = time - lagMs / 1000;
  // Closest any arrow (incl. ones the stale-loop skips) comes to that corrected
  // time — lets us detect hits lost purely because lag arrived > one window late.
  let bestCorrected = Infinity;

  let nextOne = thisChart.list[thisChart.pointer];
  let skipped = 0;
  while (nextOne && nextOne.time < time - TIMING_WINDOW) {
    if (DEBUG) bestCorrected = Math.min(bestCorrected, Math.abs(nextOne.time - correctedTime));
    thisChart.pointer++;
    nextOne = thisChart.list[thisChart.pointer];
    skipped++;
  }

  if (!nextOne) {
    if (DEBUG) {
      console.log(`[worker] press ${dir} @${time.toFixed(3)}s — skipped ${skipped} stale arrow(s), none left`);
    }
    return;
  }

  const diff = Math.abs(nextOne.time - time);
  if (diff < TIMING_WINDOW) {
    nextOne.hit = true;
    if (DEBUG) {
      dbgHits++;
      const signed = time - nextOne.time; // <0 = pressed early, >0 = pressed late
      dbgHitOffSum += signed;
      dbgHitOffs.push(signed);
      console.log(
        `[worker] HIT  ${dir} idx=${thisChart.pointer} off=${signed >= 0 ? '+' : ''}${(signed * 1000).toFixed(0)}ms` +
        ` skipped=${skipped} lag=${lagMs.toFixed(0)}ms`
      );
    }
    postMessage({ dir, index: thisChart.pointer, hit: true, freeze: nextOne.freeze, diff });
    if (nextOne.freeze) inFreeze[dir].freeze = true;
    thisChart.pointer++;
  } else if (DEBUG) {
    // Pressed, but the nearest unhit arrow is outside the timing window: this is
    // the "I hit it but it didn't count" case. Compare against the corrected
    // (lag-removed) time, including any arrow the stale-loop already skipped —
    // when lag > one window the intended arrow is skipped before we get here.
    dbgNoHit++;
    const signed = time - nextOne.time; // <0 = pressed early, >0 = pressed late
    // skipped=0 ⇒ candidate is the genuine next arrow and (given no-hit) the
    // press is before it: a real early press. skipped>0 ⇒ a prior note was
    // missed and this press cascaded onto a future arrow — not a timing read.
    if (skipped === 0) dbgEarlyMiss++; else dbgCascadeMiss++;
    bestCorrected = Math.min(bestCorrected, Math.abs(nextOne.time - correctedTime));
    const verdict = bestCorrected < TIMING_WINDOW ? '  <-- WOULD HIT without input lag' : '';
    console.log(
      `[worker] no-hit ${dir} idx=${thisChart.pointer} off=${signed >= 0 ? '+' : ''}${(signed * 1000).toFixed(0)}ms` +
      ` (window=±${(TIMING_WINDOW * 1000).toFixed(0)}ms) arrow.time=${nextOne.time.toFixed(3)}s` +
      ` press=${time.toFixed(3)}s lag=${lagMs.toFixed(0)}ms skipped=${skipped}` +
      ` bestCorrectedDiff=${(bestCorrected * 1000).toFixed(0)}ms${verdict}`
    );
  }
}

function checkIfFreeze(dir: Direction) {
  if (!inFreeze[dir]) return;
  if (inFreeze[dir].freeze) {
    postMessage({ dir, brokeFreeze: true });
  }
}

self.onmessage = (e: MessageEvent) => {
  const { type } = e.data as { type: string };

  if (type === 'preChart') {
    preChart(
      e.data.chart,
      e.data.bpm,
      e.data.arrowOffset,
      e.data.songOffset,
      e.data.timing,
      e.data.bpms,
      e.data.stops,
      e.data.debug,
      e.data.judgmentOffset
    );
  } else if (type === 'startTime') {
    timeouts.forEach((fn) => fn());
    // Fire endSong just after the last arrow has been checked, regardless of
    // whether that last note is a tap or a freeze release.
    setTimeout(() => {
      if (DEBUG) {
        const meanOff = dbgHits ? (dbgHitOffSum / dbgHits) * 1000 : 0;
        const sorted = [...dbgHitOffs].sort((a, b) => a - b);
        const medianOff = sorted.length ? sorted[Math.floor(sorted.length / 2)] * 1000 : 0;
        console.log(
          `[worker] SUMMARY presses=${dbgPresses} hits=${dbgHits}` +
          ` no-hit(outside-window)=${dbgNoHit} (genuine-early=${dbgEarlyMiss} cascade=${dbgCascadeMiss})` +
          ` miss-timeouts=${dbgMissTimeouts}`
        );
        // Mean/median hit offset: a consistently negative value = you press
        // earlier than the worker expects, i.e. an audio/visual calibration bias
        // (not skill). Near 0 = well calibrated; the misses are timing spread.
        console.log(
          `[worker] HIT-OFFSET mean=${meanOff >= 0 ? '+' : ''}${meanOff.toFixed(0)}ms` +
          ` median=${medianOff >= 0 ? '+' : ''}${medianOff.toFixed(0)}ms` +
          ` (negative = pressing early; |value|>~40ms suggests a calibration offset)`
        );
      }
      postMessage({ endSong: true });
    }, lastFireMs + 100);
  } else if (type === 'keyDown') {
    respondToKey(e.data.timeStamp, e.data.dir as Direction, e.data.lagMs ?? 0);
  } else if (type === 'keyUp') {
    checkIfFreeze(e.data.dir as Direction);
  }
};
