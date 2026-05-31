// Web Worker — runs timing logic off the main thread
// Ported faithfully from animationWorker.js

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
const timeouts: ((last?: boolean) => void)[] = [];

function getStopTime(thisBeat: number, stops: { beat: number; duration: number }[]): number {
  return stops.reduce((t, s) => (thisBeat > s.beat ? t + s.duration : t), 0);
}

function getBPMTime(thisBeat: number, bpms: { beat: number; bpm: number }[]): number {
  let addedTime = 0;
  for (let i = 1; i < bpms.length && thisBeat > bpms[i].beat; i++) {
    const oldBeat = 60 / bpms[i - 1].bpm;
    const newBeat = 60 / bpms[i].bpm;
    addedTime += (thisBeat - bpms[i].beat) * (newBeat - oldBeat);
  }
  return addedTime;
}

function checkArrow(arrowTime: ArrowTime, last?: boolean) {
  if (last) {
    postMessage({ endSong: true });
  }
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
  stops: { beat: number; duration: number }[]
) {
  TIMING_WINDOW = timing;
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

          timeouts.push((last?: boolean) => {
            setTimeout(() => checkArrow(arrowTime, last), (timeStamp + TIMING_WINDOW - songOffset) * 1000);
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

          timeouts.push((_last?: boolean) => {
            setTimeout(() => checkArrow(freezeUpArrow), (timeStamp - TIMING_WINDOW - songOffset) * 1000);
          });
          timeouts.push((_last?: boolean) => {
            setTimeout(() => {
              freezeUpArrow.animate = true;
              checkArrow(freezeUpArrow);
            }, (timeStamp + TIMING_WINDOW - songOffset) * 1000);
          });
        }
      });
    });
  });
}

function respondToKey(time: number, dir: Direction) {
  const thisChart = chart[dir];
  if (!thisChart) return;
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
      e.data.stops
    );
  } else if (type === 'startTime') {
    if (timeouts.length > 0) {
      timeouts[timeouts.length - 1]((true));
      timeouts.slice(0, -1).forEach((fn) => fn());
    }
  } else if (type === 'keyDown') {
    respondToKey(e.data.timeStamp, e.data.dir as Direction);
  } else if (type === 'keyUp') {
    checkIfFreeze(e.data.dir as Direction);
  }
};
