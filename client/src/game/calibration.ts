// Per-user audio calibration offset (ms), measured on the Calibrate screen and
// applied to every press during gameplay (see gameWorker's JUDGMENT_OFFSET).
//
// Sign convention: POSITIVE = the player presses *early* relative to when the
// game judges the beat, so the worker adds this to each press timestamp to
// re-center it. This single number absorbs the whole chain — audio output
// latency, display latency, and personal anticipation — so we never have to
// trust the (unreliable) AudioContext.outputLatency reading.

const KEY = 'calibration.offsetMs';

export function getCalibrationMs(): number {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return 0;
    const v = Number(raw);
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

export function setCalibrationMs(ms: number): void {
  try {
    localStorage.setItem(KEY, String(Math.round(ms)));
  } catch {
    /* localStorage unavailable — calibration just won't persist */
  }
}

export function clearCalibration(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
