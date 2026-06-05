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
// only ever miss early. Comes from the Calibrate screen; 0 = off.
let JUDGMENT_OFFSET = 0;
const timeouts: (() => void)[] = [];
// Latest moment (ms after start) any arrow is checked — used to fire endSong.
let lastFireMs = 0;

function checkArrow(arrowTime: ArrowTime) {
  if (!arrowTime.hit && !arrowTime.freezeUp) {
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
  judgmentOffset = 0
) {
  TIMING_WINDOW = timing;
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

function respondToKey(time: number, dir: Direction) {
  const thisChart = chart[dir];
  if (!thisChart) return;
  // Re-center the press onto the player's perceived timing before judging.
  time += JUDGMENT_OFFSET;
  if (thisChart.pointer >= thisChart.list.length) return;

  let nextOne = thisChart.list[thisChart.pointer];
  while (nextOne && nextOne.time < time - TIMING_WINDOW) {
    thisChart.pointer++;
    nextOne = thisChart.list[thisChart.pointer];
  }

  if (!nextOne) return;

  const diff = Math.abs(nextOne.time - time);
  if (diff < TIMING_WINDOW) {
    nextOne.hit = true;
    postMessage({ dir, index: thisChart.pointer, hit: true, freeze: nextOne.freeze, diff });
    if (nextOne.freeze) inFreeze[dir].freeze = true;
    thisChart.pointer++;
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
      e.data.judgmentOffset
    );
  } else if (type === 'startTime') {
    timeouts.forEach((fn) => fn());
    // Fire endSong just after the last arrow has been checked, regardless of
    // whether that last note is a tap or a freeze release.
    setTimeout(() => {
      postMessage({ endSong: true });
    }, lastFireMs + 100);
  } else if (type === 'keyDown') {
    respondToKey(e.data.timeStamp, e.data.dir as Direction);
  } else if (type === 'keyUp') {
    checkIfFreeze(e.data.dir as Direction);
  }
};
