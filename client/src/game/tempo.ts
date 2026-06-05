// Shared tempo-map helpers, used by BOTH the judgment worker (gameWorker.ts) and
// the visual engine (ArrowEngine.ts) so the two share one notion of song time.
// Keeping these in one place is what stops the visuals from drifting away from
// the worker's judgment across BPM changes and stops.

export interface Bpm { beat: number; bpm: number }
export interface Stop { beat: number; duration: number }

/** Extra seconds added to a note's time by all stops that occur before `thisBeat`. */
export function getStopTime(thisBeat: number, stops: Stop[]): number {
  return stops.reduce((t, s) => (thisBeat > s.beat ? t + s.duration : t), 0);
}

/** Time correction (seconds) at `thisBeat` from BPM changes, relative to a base
 *  laid out at bpms[0]. Positive or negative depending on speed-ups/slow-downs. */
export function getBPMTime(thisBeat: number, bpms: Bpm[]): number {
  let addedTime = 0;
  for (let i = 1; i < bpms.length && thisBeat > bpms[i].beat; i++) {
    const oldBeat = 60 / bpms[i - 1].bpm;
    const newBeat = 60 / bpms[i].bpm;
    addedTime += (thisBeat - bpms[i].beat) * (newBeat - oldBeat);
  }
  return addedTime;
}
