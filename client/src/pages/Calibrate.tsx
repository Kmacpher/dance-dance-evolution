import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tone from 'tone';
import { getCalibrationMs, setCalibrationMs, clearCalibration } from '../game/calibration';

// Tap-to-the-beat audio calibration. A metronome plays clicks at known
// AudioContext times; the player taps along; we measure how far each tap lands
// from the nearest beat. The median is the player's end-to-end perceptual offset
// (audio output latency + display lag + personal anticipation), stored and
// applied to every press in-game so accurate play is judged as accurate.
//
// Because we read the tap time and the beat time from the SAME context clock the
// game uses to schedule audio, the measured offset transfers directly to play.

const BPM = 120;
const BEAT_SEC = 60 / BPM;       // 0.5s between clicks
const TOTAL_BEATS = 24;          // ~12s of metronome
const WARMUP_BEATS = 4;          // ignore taps before the player finds the groove
const MIN_TAPS = 6;              // need at least this many to trust the result
const TAP_KEYS = new Set([' ', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight']);

type Phase = 'idle' | 'running' | 'result';

interface Measurement { offsetMs: number; spreadMs: number; taps: number }

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default function Calibrate() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const [saved, setSaved] = useState(() => getCalibrationMs());
  const [tapCount, setTapCount] = useState(0);
  const [beatsLeft, setBeatsLeft] = useState(TOTAL_BEATS);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [slider, setSlider] = useState(0); // editable value on the result screen

  const beatTimesRef = useRef<number[]>([]);   // scheduled context times of clicks
  const tapTimesRef = useRef<number[]>([]);    // context times of player taps
  const synthRef = useRef<Tone.Synth | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const teardownAudio = useCallback(() => {
    const t = Tone.getTransport();
    t.stop();
    t.cancel();
    synthRef.current?.dispose();
    synthRef.current = null;
    if (endTimerRef.current) { clearTimeout(endTimerRef.current); endTimerRef.current = null; }
  }, []);

  const finish = useCallback(() => {
    teardownAudio();
    const beats = beatTimesRef.current;
    const warmupCutoff = beats[WARMUP_BEATS] ?? beats[0] ?? 0;
    const offsets: number[] = [];
    for (const tap of tapTimesRef.current) {
      if (tap < warmupCutoff) continue;
      // nearest scheduled beat to this tap
      let best = Infinity;
      let nearest = 0;
      for (const b of beats) {
        const d = Math.abs(b - tap);
        if (d < best) { best = d; nearest = b; }
      }
      const signed = nearest - tap; // > 0 => tapped early
      if (Math.abs(signed) < BEAT_SEC / 2) offsets.push(signed);
    }

    if (offsets.length < MIN_TAPS) {
      setMeasurement(null);
      setPhase('result');
      return;
    }
    const med = median(offsets);
    const mean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    const spread = Math.sqrt(offsets.reduce((a, b) => a + (b - mean) ** 2, 0) / offsets.length);
    const offsetMs = Math.round(med * 1000);
    setMeasurement({ offsetMs, spreadMs: Math.round(spread * 1000), taps: offsets.length });
    setSlider(offsetMs);
    setPhase('result');
  }, [teardownAudio]);

  const start = useCallback(async () => {
    await Tone.start();
    beatTimesRef.current = [];
    tapTimesRef.current = [];
    setTapCount(0);
    setBeatsLeft(TOTAL_BEATS);
    setMeasurement(null);

    const synth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
      volume: -8,
    }).toDestination();
    synthRef.current = synth;

    const transport = Tone.getTransport();
    transport.bpm.value = BPM;
    let count = 0;
    transport.scheduleRepeat((time) => {
      // Accent the downbeat (every 4th click) so it's easy to lock onto.
      const accent = count % 4 === 0;
      synth.triggerAttackRelease(accent ? 'C6' : 'C5', '32n', time);
      beatTimesRef.current.push(time);
      count++;
      setBeatsLeft(Math.max(0, TOTAL_BEATS - count));
    }, '4n');
    transport.start();
    setPhase('running');

    // End a beat after the last click is heard, then compute.
    endTimerRef.current = setTimeout(finish, (TOTAL_BEATS + 1) * BEAT_SEC * 1000);
  }, [finish]);

  // Capture taps while the metronome runs.
  useEffect(() => {
    if (phase !== 'running') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || !TAP_KEYS.has(e.key)) return;
      e.preventDefault();
      // currentTime (no lookAhead) is the live context clock — the same clock the
      // scheduleRepeat callback's `time` is expressed in.
      tapTimesRef.current.push(Tone.getContext().currentTime);
      setTapCount((c) => c + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  // Stop audio if the user leaves mid-run.
  useEffect(() => () => teardownAudio(), [teardownAudio]);

  const save = (ms: number) => {
    setCalibrationMs(ms);
    setSaved(ms);
    AudioEngineSafePlaySfx();
    navigate('/menu');
  };

  const describe = (ms: number) =>
    ms === 0 ? 'no offset' : `${Math.abs(ms)} ms ${ms > 0 ? 'early' : 'late'}`;

  return (
    <div className="min-h-[100vh] bg-black flex flex-col items-center justify-center px-4 space-y-8 text-center">
      <h2 className="font-game text-dde-cyan text-lg">AUDIO CALIBRATION</h2>

      {phase === 'idle' && (
        <>
          <p className="font-game text-xs text-gray-400 max-w-md leading-relaxed">
            Press <span className="text-dde-yellow">Start</span>, then tap any arrow key (or the
            space bar) in time with the metronome. We&apos;ll measure how early or late you play and
            line the game up to you.
          </p>
          <p className="font-game text-xs text-gray-600">
            Current calibration: <span className="text-white">{describe(saved)}</span>
          </p>
          <button
            onClick={start}
            className="font-game text-sm px-8 py-3 bg-dde-purple hover:bg-dde-pink transition-colors rounded"
          >
            START
          </button>

          <div className="flex flex-col items-center gap-2 pt-4">
            <p className="font-game text-[10px] text-gray-600">or set it manually</p>
            <div className="flex items-center gap-3">
              <input
                type="range" min={-150} max={150} step={1} value={saved}
                onChange={(e) => setSaved(Number(e.target.value))}
                className="w-64"
              />
              <span className="font-game text-xs text-white w-20 text-left">{saved} ms</span>
            </div>
            <button
              onClick={() => save(saved)}
              className="font-game text-[10px] px-3 py-1 border border-gray-700 hover:border-dde-cyan text-gray-400 hover:text-dde-cyan transition-colors rounded"
            >
              SAVE MANUAL VALUE
            </button>
          </div>
        </>
      )}

      {phase === 'running' && (
        <>
          <p className="font-game text-sm text-gray-300">Tap to the beat you HEAR 🥁</p>
          <div
            key={tapCount}
            className="font-game text-5xl text-dde-cyan"
            style={{ animation: 'none' }}
          >
            {tapCount}
          </div>
          <p className="font-game text-xs text-gray-600">{beatsLeft} beats left</p>
          <button
            onClick={() => { teardownAudio(); setPhase('idle'); }}
            className="font-game text-[10px] px-3 py-1 border border-gray-700 text-gray-500 hover:text-dde-pink hover:border-dde-pink transition-colors rounded"
          >
            CANCEL
          </button>
        </>
      )}

      {phase === 'result' && (
        <>
          {measurement ? (
            <>
              <p className="font-game text-xs text-gray-400">
                You play <span className="text-dde-yellow">{describe(measurement.offsetMs)}</span>
                {' '}({measurement.taps} taps, ±{measurement.spreadMs} ms spread)
              </p>
              {measurement.spreadMs > 45 && (
                <p className="font-game text-[10px] text-dde-pink">
                  inconsistent taps — consider retrying for a cleaner reading
                </p>
              )}
              <div className="flex items-center gap-3">
                <input
                  type="range" min={-150} max={150} step={1} value={slider}
                  onChange={(e) => setSlider(Number(e.target.value))}
                  className="w-64"
                />
                <span className="font-game text-xs text-white w-20 text-left">{slider} ms</span>
              </div>
            </>
          ) : (
            <p className="font-game text-xs text-dde-pink max-w-md">
              Not enough clean taps to measure. Tap once per click, in time with the metronome.
            </p>
          )}

          <div className="flex gap-4">
            <button
              onClick={start}
              className="font-game text-xs px-4 py-2 border border-gray-700 hover:border-dde-cyan text-gray-300 hover:text-dde-cyan transition-colors rounded"
            >
              RETRY
            </button>
            {measurement && (
              <button
                onClick={() => save(slider)}
                className="font-game text-xs px-4 py-2 bg-dde-purple hover:bg-dde-pink transition-colors rounded"
              >
                SAVE
              </button>
            )}
          </div>
        </>
      )}

      <div className="flex gap-4 pt-2">
        <button
          onClick={() => { clearCalibration(); setSaved(0); }}
          className="font-game text-[10px] px-3 py-1 border border-gray-800 text-gray-600 hover:text-dde-pink hover:border-dde-pink transition-colors rounded"
        >
          RESET TO 0
        </button>
        <button
          onClick={() => { teardownAudio(); navigate('/menu'); }}
          className="font-game text-[10px] px-3 py-1 border border-gray-800 text-gray-600 hover:text-dde-cyan hover:border-dde-cyan transition-colors rounded"
        >
          BACK
        </button>
      </div>
    </div>
  );
}

// Small SFX ping on save, mirroring the menu's feedback. Wrapped so a missing
// asset never blocks navigation.
function AudioEngineSafePlaySfx() {
  try {
    void new Audio('/audio/soundEffects/start.mp3').play().catch(() => {});
  } catch {
    /* ignore */
  }
}
