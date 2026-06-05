import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Song, GameConfig, PlayerState } from '../types';
import { ArrowEngine, Direction } from '../game/ArrowEngine';
import { AudioEngine } from '../game/AudioEngine';
import {
  makePlayerState, addScore, addCombo, resetCombo,
  setTotalArrows, finalScore, getPercent, getAccuracy,
  TIMING_WINDOWS, ACCURACY_COLORS,
} from '../game/ScoreEngine';
import { useKeyConfig } from '../hooks/useKeyConfig';
import { getCalibrationMs } from '../game/calibration';

const DIRS: Direction[] = ['left', 'down', 'up', 'right'];

interface WorkerMsg {
  hit?: boolean; dir?: Direction; index?: number; freeze?: boolean; diff?: number;
  freezeUp?: boolean; brokeFreeze?: boolean; endSong?: boolean;
  chartCounts?: Record<Direction, number>;
}

function ArrowLane({ player, dir }: { player: 1 | 2; dir: Direction }) {
  return (
    <div className={`${dir}-arrow-col arrow-col flex-1 relative overflow-hidden`}>
      <div className="fader" />
      <div className={`chute${dir === 'left' ? ' chute-left' : dir === 'right' ? ' chute-right' : ''}`} />
      <div className={`under-chute${dir === 'left' ? ' chute-left' : dir === 'right' ? ' chute-right' : ''}`} />
      <div className={`arrowPlace arrowP${player}`}>
        <img src={`/img/arrows/${dir}-blank.png`} alt={dir} />
      </div>
    </div>
  );
}

export default function Game() {
  const { songId, difficulty } = useParams<{ songId: string; difficulty: string }>();
  const [searchParams] = useSearchParams();
  const speedMod = Number(searchParams.get('mod') ?? 1);
  // Calibration offset (ms) added to each press before judging, to cancel the
  // perceptual early/late bias from audio/display latency. Comes from the user's
  // saved calibration (Calibrate screen); `?offset=<ms>` overrides it for testing.
  const judgmentOffsetMs = searchParams.has('offset')
    ? Number(searchParams.get('offset'))
    : getCalibrationMs();
  const navigate = useNavigate();
  const { getButton } = useKeyConfig();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [accuracy, setAccuracy] = useState<string | null>(null);
  const [accuracyColor, setAccuracyColor] = useState('#fff');
  const [imageSrc, setImageSrc] = useState('');
  const [videoSrc, setVideoSrc] = useState('');

  const arrowEngineRef = useRef<ArrowEngine | null>(null);
  const audioRef = useRef<AudioEngine | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const playerRef = useRef<PlayerState>(makePlayerState());
  const startTimeRef = useRef(0);
  const songRef = useRef<Song | null>(null);
  const accTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chartCountsRef = useRef<Record<Direction, number> | null>(null);

  const showAcc = useCallback((label: string, color: string) => {
    setAccuracy(label);
    setAccuracyColor(color);
    if (accTimerRef.current) clearTimeout(accTimerRef.current);
    accTimerRef.current = setTimeout(() => setAccuracy(null), 1000);
  }, []);

  const cleanup = useCallback(() => {
    audioRef.current?.stop();
    workerRef.current?.terminate();
    arrowEngineRef.current?.kill();
  }, []);

  useEffect(() => {
    if (!songId || !difficulty) return;
    let cancelled = false;

    async function load() {
      const song = await api.getSong(songId!);
      const chartEntry = song.Charts[difficulty as keyof typeof song.Charts];
      if (!chartEntry) return;
      const stepChart = await api.getStepChart(chartEntry.stepChart);
      if (cancelled) return;

      songRef.current = song;
      const bpm = song.bpms[0].bpm;
      const arrowTime = (100 / speedMod) * 4 / bpm;
      const beatTime = 1 / (bpm / 60 / 4) / 4;

      const config: GameConfig = {
        TIMING_WINDOW: TIMING_WINDOWS.Great,
        ARROW_TIME: arrowTime,
        BEAT_TIME: beatTime,
        SPEED_MOD: speedMod,
        BEAT_VH: 100 / (arrowTime / beatTime),
      };

      const ps = makePlayerState();
      setTotalArrows(ps, stepChart.chart);
      playerRef.current = ps;

      audioRef.current = new AudioEngine(`/audio/${song.music}`, bpm, song.offset, arrowTime);
      arrowEngineRef.current = new ArrowEngine(1);

      const worker = new Worker(new URL('../game/gameWorker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent<WorkerMsg>) => {
        const d = e.data;

        if (d.endSong) {
          setTimeout(() => {
            const fs = finalScore(playerRef.current);
            const pct = getPercent(playerRef.current);
            cleanup();
            navigate(`/results/${songId}`, {
              state: { player: { ...playerRef.current, realScore: fs, percent: pct } },
            });
          }, 3000);
          return;
        }

        if (d.chartCounts) {
          chartCountsRef.current = d.chartCounts;
          return;
        }

        const arrows = arrowEngineRef.current!;
        const ps = playerRef.current;

        if (d.hit && d.dir !== undefined && d.index !== undefined) {
          if (d.freeze) arrows.showFreezeEater(d.dir, d.index);
          if (!arrows.hideArrowImage(d.dir, d.index)) {
            console.warn(`[arrows] hit not hidden: dir=${d.dir} index=${d.index} diff=${d.diff?.toFixed(3)}s`);
          }
          addScore(ps, d.diff!);
          addCombo(ps, d.diff!);
          setScore(ps.score);
          setCombo(ps.combo);
          setShowCombo(ps.combo > 1);
          const acc = getAccuracy(d.diff!);
          if (acc) showAcc(acc, ACCURACY_COLORS[acc]);
          return;
        }
        if (d.freezeUp && d.dir !== undefined && d.index !== undefined) {
          arrows.hideFreezeEater(d.dir);
          arrows.removeArrow(d.dir, d.index);
          return;
        }
        if (d.brokeFreeze && d.dir !== undefined) {
          arrows.hideFreezeEater(d.dir);
          resetCombo(ps);
          setCombo(0);
          setShowCombo(false);
          showAcc('Bad', ACCURACY_COLORS.Bad);
          return;
        }
        // Miss
        resetCombo(ps);
        setCombo(0);
        setShowCombo(false);
        showAcc('Boo', ACCURACY_COLORS.Boo);
      };

      worker.postMessage({
        type: 'preChart', chart: stepChart.chart, bpm,
        arrowOffset: config.ARROW_TIME + Number(song.offset),
        songOffset: Number(song.offset),
        timing: config.TIMING_WINDOW,
        bpms: song.bpms, stops: song.stops,
        judgmentOffset: (Number.isFinite(judgmentOffsetMs) ? judgmentOffsetMs : 0) / 1000,
      });

      setLoading(false);

      setTimeout(async () => {
        if (cancelled) return;
        arrowEngineRef.current!.makeArrows(stepChart.chart, bpm, config, song);

        // The worker's hit indices address arrowEls positionally; if the DOM lane
        // count differs from the worker's chart count the mapping is off and hits
        // will hide the wrong arrow. Surface that immediately.
        const wc = chartCountsRef.current;
        if (wc) {
          const ac = arrowEngineRef.current!.counts();
          for (const dir of DIRS) {
            if (ac[dir] !== wc[dir]) {
              console.warn(
                `[arrows] COUNT MISMATCH "${dir}": worker chart=${wc[dir]} vs DOM arrows=${ac[dir]} — ` +
                `hit→arrow indices are misaligned; hits past the divergence will hide the wrong arrow`
              );
            }
          }
        }

        await audioRef.current!.waitForLoad();
        if (cancelled) return;

        // One wall-clock origin shared by the judgment worker and the visual
        // engine so the two never drift relative to each other.
        const startWall = Date.now();
        const startTime = startWall - Number(song.offset) * 1000;
        startTimeRef.current = startTime;

        audioRef.current!.start();
        arrowEngineRef.current!.start(startWall);

        worker.postMessage({ type: 'startTime', startTime });

        // Background media
        const videoOffset = (config.ARROW_TIME + Number(song.offset)) * 1000;
        if (song.title === 'Caramelldansen') {
          setVideoSrc('/video/Caramelldansen.mp4');
          setTimeout(() => {
            (document.getElementById('bg-video') as HTMLVideoElement)?.play();
          }, videoOffset + 1000);
        } else if (song.title === 'Sandstorm') {
          setVideoSrc('/video/Darude - Sandstorm.mp4');
          setTimeout(() => {
            (document.getElementById('bg-video') as HTMLVideoElement)?.play();
          }, videoOffset);
        } else if (song.background) {
          setImageSrc(`/img/background/${song.background}`);
        }

        setReady(true);
      }, 2000);
    }

    load().catch(console.error);
    return () => { cancelled = true; cleanup(); };
  }, [songId, difficulty, speedMod, navigate, cleanup, showAcc, judgmentOffsetMs]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const button = getButton(e);
      if (!button) return;
      if (button.name === 'escape') { cleanup(); navigate('/choose-song'); return; }
      if (button.name === 'enter' || button.player !== 0) return;
      const dir = button.name as Direction;
      workerRef.current?.postMessage({
        type: 'keyDown', dir, timeStamp: (Date.now() - startTimeRef.current) / 1000,
      });
      document.querySelectorAll(`.player-1 .${dir}-arrow-col .arrowPlace`).forEach((el) =>
        el.classList.add('arrowPlacePressed')
      );
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const button = getButton(e);
      if (!button || button.name === 'enter' || button.name === 'escape' || button.player !== 0) return;
      const dir = button.name as Direction;
      workerRef.current?.postMessage({ type: 'keyUp', dir });
      document.querySelectorAll(`.player-1 .${dir}-arrow-col .arrowPlace`).forEach((el) =>
        el.classList.remove('arrowPlacePressed')
      );
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [getButton, cleanup, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <p style={{ fontFamily: 'EchoDeco', fontSize: '40px', color: '#2DDEFF' }}>
          LOADING...
        </p>
      </div>
    );
  }

  return (
    <div id="animationJSContainer" className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      {videoSrc && <video id="bg-video" src={videoSrc} muted loop style={{ zIndex: 0 }} />}
      {imageSrc && <img id="bg-image" src={imageSrc} alt="background" />}

      {/* Loading / ready overlay */}
      {!ready && (
        <div className="loading-screen absolute inset-0 z-50">
          <p style={{ fontFamily: 'EchoDeco', fontSize: '40px', color: '#2DDEFF' }}>
            GET READY...
          </p>
        </div>
      )}

      {/* Arrow lane */}
      <div className="animContainer" style={{ display: ready ? 'block' : 'none' }}>
        <div className="flex justify-center h-full">
          <div id="player-1-arrowLane" className="arrow-lane flex player-1">
            {/* Score / combo / accuracy overlay */}
            <div
              className="accuracy-text"
              style={{ color: accuracyColor, visibility: accuracy ? 'visible' : 'hidden' }}
            >
              {accuracy}
            </div>
            {showCombo && (
              <div
                style={{
                  fontFamily: 'petit', fontSize: '4vh', color: '#E9A92E',
                  position: 'absolute', top: '58%', left: '40%', zIndex: 10,
                }}
              >
                {combo} combo
              </div>
            )}
            <div style={{
              fontFamily: 'petit', fontSize: '3vh', color: '#2DDEFF',
              position: 'absolute', top: '5%', left: '35%', zIndex: 10,
            }}>
              {score}
            </div>

            <div className="pusher" style={{ height: '5%' }} />
            {DIRS.map((dir) => <ArrowLane key={dir} dir={dir} player={1} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
