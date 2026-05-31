import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Song, GameConfig, PlayerState, AccuracyLabel } from '../types';
import { ArrowEngine, Direction } from '../game/ArrowEngine';
import { AudioEngine } from '../game/AudioEngine';
import {
  makePlayerState, addScore, addCombo, resetCombo, setTotalArrows,
  finalScore, getPercent, getAccuracy, TIMING_WINDOWS, ACCURACY_COLORS,
} from '../game/ScoreEngine';
import { useKeyConfig } from '../hooks/useKeyConfig';

const DIRS: Direction[] = ['left', 'down', 'up', 'right'];

function PlayerLane({ player }: { player: 1 | 2 }) {
  return (
    <div className={`flex player-${player}`}>
      {DIRS.map((dir) => (
        <div
          key={dir}
          className={`${dir}-arrow-col arrow-col relative overflow-hidden`}
        >
          <div className="arrow-place fader absolute bottom-[10vh] w-16 h-16 opacity-40">
            <img src={`/img/arrows/${dir}-purple.png`} alt={dir} className="w-full h-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Versus() {
  const { songId, difficulty, difficultyP2 } = useParams<{
    songId: string; difficulty: string; difficultyP2: string;
  }>();
  const [params] = useSearchParams();
  const mod1 = Number(params.get('mod1') ?? 1);
  const mod2 = Number(params.get('mod2') ?? 1);
  const navigate = useNavigate();
  const { getButton } = useKeyConfig();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [p1State, setP1State] = useState<PlayerState>(makePlayerState());
  const [p2State, setP2State] = useState<PlayerState>(makePlayerState());
  const [p1Acc, setP1Acc] = useState<AccuracyLabel | null>(null);
  const [p2Acc, setP2Acc] = useState<AccuracyLabel | null>(null);

  const arrowsP1 = useRef<ArrowEngine | null>(null);
  const arrowsP2 = useRef<ArrowEngine | null>(null);
  const audioRef = useRef<AudioEngine | null>(null);
  const workerP1 = useRef<Worker | null>(null);
  const workerP2 = useRef<Worker | null>(null);
  const p1Ref = useRef<PlayerState>(makePlayerState());
  const p2Ref = useRef<PlayerState>(makePlayerState());
  const startTimeRef = useRef(0);
  const endedRef = useRef({ p1: false, p2: false });

  const cleanup = useCallback(() => {
    audioRef.current?.stop();
    workerP1.current?.terminate();
    workerP2.current?.terminate();
    arrowsP1.current?.kill();
    arrowsP2.current?.kill();
  }, []);

  const checkBothEnded = useCallback(() => {
    if (endedRef.current.p1 && endedRef.current.p2) {
      setTimeout(() => {
        cleanup();
        navigate('/results-versus', {
          state: {
            p1: { ...p1Ref.current, realScore: finalScore(p1Ref.current), percent: getPercent(p1Ref.current) },
            p2: { ...p2Ref.current, realScore: finalScore(p2Ref.current), percent: getPercent(p2Ref.current) },
          },
        });
      }, 3000);
    }
  }, [cleanup, navigate]);

  const makeWorkerHandler = useCallback(
    (
      playerNum: 1 | 2,
      arrows: React.MutableRefObject<ArrowEngine | null>,
      pRef: React.MutableRefObject<PlayerState>,
      setAcc: (a: AccuracyLabel | null) => void,
      setPs: (ps: PlayerState) => void
    ) => (e: MessageEvent) => {
      const data = e.data;
      if ('endSong' in data) {
        endedRef.current[playerNum === 1 ? 'p1' : 'p2'] = true;
        checkBothEnded();
        return;
      }
      const eng = arrows.current;
      if (!eng) return;

      if ('hit' in data && data.hit) {
        if (data.freeze) eng.showFreezeEater(data.dir, data.index);
        eng.hideArrowImage(data.dir, data.index);
        addScore(pRef.current, data.diff);
        addCombo(pRef.current, data.diff);
        setPs({ ...pRef.current });
        setAcc(getAccuracy(data.diff));
        return;
      }
      if ('freezeUp' in data) {
        eng.hideFreezeEater(data.dir);
        eng.removeArrow(data.dir, data.index);
        return;
      }
      if ('brokeFreeze' in data) {
        eng.hideFreezeEater(data.dir);
        resetCombo(pRef.current);
        setPs({ ...pRef.current });
        setAcc('Bad');
        return;
      }
      resetCombo(pRef.current);
      setPs({ ...pRef.current });
      setAcc('Boo');
    },
    [checkBothEnded]
  );

  useEffect(() => {
    if (!songId || !difficulty || !difficultyP2) return;
    let cancelled = false;

    async function load() {
      const [song, chart1, chart2] = await Promise.all([
        api.getSong(songId!),
        api.getStepChart(
          (await api.getSong(songId!)).Charts[difficulty as keyof Song['Charts']]?.stepChart ?? ''
        ),
        api.getStepChart(
          (await api.getSong(songId!)).Charts[difficultyP2 as keyof Song['Charts']]?.stepChart ?? ''
        ),
      ]);

      if (cancelled) return;
      const bpm = song.bpms[0].bpm;

      const makeConfig = (mod: number): GameConfig => {
        const SPEED_1X = 100;
        const arrowTime = (SPEED_1X / mod) * 4 / bpm;
        const beatTime = 1 / (bpm / 60 / 4) / 4;
        return {
          TIMING_WINDOW: TIMING_WINDOWS.Great,
          ARROW_TIME: arrowTime,
          BEAT_TIME: beatTime,
          SPEED_MOD: mod,
          BEAT_VH: 100 / (arrowTime / beatTime),
          animationOffset: 0,
        };
      };

      const config1 = makeConfig(mod1);
      const config2 = makeConfig(mod2);

      setTotalArrows(p1Ref.current, chart1.chart);
      setTotalArrows(p2Ref.current, chart2.chart);

      audioRef.current = new AudioEngine(`/audio/${encodeURIComponent(song.music)}`, bpm, song.offset, config1.ARROW_TIME);

      arrowsP1.current = new ArrowEngine(1);
      arrowsP2.current = new ArrowEngine(2);

      workerP1.current = new Worker(new URL('../game/gameWorker.ts', import.meta.url), { type: 'module' });
      workerP2.current = new Worker(new URL('../game/gameWorker.ts', import.meta.url), { type: 'module' });

      workerP1.current.onmessage = makeWorkerHandler(1, arrowsP1, p1Ref, setP1Acc, setP1State);
      workerP2.current.onmessage = makeWorkerHandler(2, arrowsP2, p2Ref, setP2Acc, setP2State);

      const sendPreChart = (worker: Worker, chart: typeof chart1, config: GameConfig) =>
        worker.postMessage({
          type: 'preChart',
          chart: chart.chart,
          bpm,
          arrowOffset: config.ARROW_TIME + Number(song.offset),
          songOffset: Number(song.offset),
          timing: config.TIMING_WINDOW,
          bpms: song.bpms,
          stops: song.stops,
        });

      sendPreChart(workerP1.current, chart1, config1);
      sendPreChart(workerP2.current, chart2, config2);

      setLoading(false);

      setTimeout(async () => {
        if (cancelled) return;
        arrowsP1.current!.makeArrows(chart1.chart, bpm, config1, song);
        arrowsP2.current!.makeArrows(chart2.chart, bpm, config2, song);

        await audioRef.current!.waitForLoad();
        if (cancelled) return;

        arrowsP1.current!.resume();
        arrowsP2.current!.resume();
        audioRef.current!.start();

        const startTime = Date.now() - Number(song.offset) * 1000;
        startTimeRef.current = startTime;
        workerP1.current!.postMessage({ type: 'startTime', startTime });
        workerP2.current!.postMessage({ type: 'startTime', startTime });
        setReady(true);
      }, 2000);
    }

    load().catch(console.error);
    return () => { cancelled = true; cleanup(); };
  }, [songId, difficulty, difficultyP2, mod1, mod2, cleanup, makeWorkerHandler]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const button = getButton(e);
      if (!button) return;
      if (button.name === 'escape') { cleanup(); navigate('/choose-song'); return; }
      if (button.name === 'enter') return;
      const dir = button.name as Direction;
      const timeStamp = (Date.now() - startTimeRef.current) / 1000;
      const worker = button.player === 0 ? workerP1.current : workerP2.current;
      worker?.postMessage({ type: 'keyDown', timeStamp, dir });
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const button = getButton(e);
      if (!button || button.name === 'enter' || button.name === 'escape') return;
      const dir = button.name as Direction;
      const worker = button.player === 0 ? workerP1.current : workerP2.current;
      worker?.postMessage({ type: 'keyUp', dir });
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [getButton, cleanup, navigate]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <p className="font-game text-dde-cyan animate-pulse">LOADING...</p>
    </div>
  );

  return (
    <div className="h-screen bg-black overflow-hidden flex">
      <div className="flex-1 relative">
        <PlayerLane player={1} />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="font-game text-white">{p1State.score}</p>
          {p1Acc && <p className="font-game text-sm" style={{ color: ACCURACY_COLORS[p1Acc] }}>{p1Acc}</p>}
        </div>
      </div>

      <div className="w-px bg-dde-purple/40" />

      <div className="flex-1 relative">
        <PlayerLane player={2} />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="font-game text-white">{p2State.score}</p>
          {p2Acc && <p className="font-game text-sm" style={{ color: ACCURACY_COLORS[p2Acc] }}>{p2Acc}</p>}
        </div>
      </div>

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <p className="font-game text-dde-cyan animate-pulse">GET READY...</p>
        </div>
      )}
    </div>
  );
}
