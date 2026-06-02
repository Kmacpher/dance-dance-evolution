import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { api } from '../api';
import { Song, Difficulty } from '../types';
import { AudioEngine } from '../game/AudioEngine';
import { useKeyConfig } from '../hooks/useKeyConfig';

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Easy', 'Medium', 'Hard', 'Challenge'];
// Legacy speed mod: 1–4 in 0.5 steps.
const SPEED_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4];

const CARD_W = 240;
const CARD_H = 150;

const mod = (n: number, m: number) => ((n % m) + m) % m;

type Phase = 'carousel' | 'difficulty';

export default function ChooseSong() {
  const navigate = useNavigate();
  const { getButton } = useKeyConfig();

  const [songs, setSongs] = useState<Song[]>([]);
  // `index` is unbounded so left/right rotate the cylinder infinitely; the
  // displayed song is songs[mod(index, songs.length)].
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('carousel');
  const [difficulty1, setDifficulty1] = useState<Difficulty>('Medium');
  const [speed1, setSpeed1] = useState(1);

  const stageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<AudioEngine | null>(null);
  const previewTimer = useRef<number>();

  // Mirror live state into refs so the (stable) keydown handler reads current values.
  const songsRef = useRef(songs); songsRef.current = songs;
  const indexRef = useRef(index); indexRef.current = index;
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const diff1Ref = useRef(difficulty1); diff1Ref.current = difficulty1;
  const speed1Ref = useRef(speed1); speed1Ref.current = speed1;

  const availableDiffs = (song: Song | null) =>
    song ? DIFFICULTIES.filter((d) => song.Charts[d]) : [];

  useEffect(() => {
    api.getSongs().then(setSongs).catch(console.error);
    return () => {
      window.clearTimeout(previewTimer.current);
      previewRef.current?.stopPreview();
    };
  }, []);

  // Rotate the 3D cylinder to the current song (GSAP) and preview its audio.
  useEffect(() => {
    const n = songs.length;
    if (!n) return;

    const theta = 360 / n;
    const r = n > 1 ? Math.round((CARD_W / 2) / Math.tan(Math.PI / n) * 1.3) : 0;
    if (stageRef.current) {
      // Push the whole cylinder back by its radius so the front card sits near the
      // viewer plane (z≈0) instead of popping oversized through the perspective.
      gsap.set(stageRef.current, { z: -r });
      gsap.to(stageRef.current, {
        rotationY: -index * theta,
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    // Debounce the preview so spinning quickly doesn't load every song.
    window.clearTimeout(previewTimer.current);
    previewRef.current?.stopPreview();
    previewTimer.current = window.setTimeout(() => {
      const song = songs[mod(index, n)];
      const bpm = song.bpms[0].bpm;
      const arrowTime = (100 / 1) * 4 / bpm;
      const engine = new AudioEngine(
        `/audio/${song.music}`, bpm, song.offset, arrowTime,
        song.sampleStart ?? 0, song.sampleLength ?? 12,
      );
      engine.startPreview();
      previewRef.current = engine;
    }, 350);

    return () => window.clearTimeout(previewTimer.current);
  }, [index, songs]);

  const handleStart = () => {
    const n = songsRef.current.length;
    if (!n) return;
    const song = songsRef.current[mod(indexRef.current, n)];
    previewRef.current?.stopPreview();
    AudioEngine.playSfx('start');
    navigate(`/game/${song._id}/${diff1Ref.current}?mod=${speed1Ref.current}`);
  };

  // Keyboard control. Carousel phase: ←→ rotate, Enter selects, Esc → menu.
  // Difficulty phase: ↑↓ change difficulty, ←→ change speed, Enter loads, Esc back.
  // Arrows or WASD both drive the single player.
  useEffect(() => {
    const cycleDiff = (delta: number) => {
      const song = songsRef.current[mod(indexRef.current, songsRef.current.length)];
      const avail = availableDiffs(song);
      if (!avail.length) return;
      const next = avail[mod(Math.max(avail.indexOf(diff1Ref.current), 0) + delta, avail.length)];
      setDifficulty1(next);
      AudioEngine.playSfx('blop');
    };

    const cycleSpeed = (delta: number) => {
      const i = Math.min(Math.max(Math.max(SPEED_OPTIONS.indexOf(speed1Ref.current), 0) + delta, 0), SPEED_OPTIONS.length - 1);
      setSpeed1(SPEED_OPTIONS[i]);
      AudioEngine.playSfx('blop');
    };

    const selectSong = () => {
      const song = songsRef.current[mod(indexRef.current, songsRef.current.length)];
      const avail = availableDiffs(song);
      if (!avail.length) return;
      AudioEngine.playSfx('start');
      setDifficulty1(avail[0]);
      setPhase('difficulty');
    };

    const onKey = (e: KeyboardEvent) => {
      const btn = getButton(e);
      if (!btn) return;

      if (phaseRef.current === 'carousel') {
        switch (btn.name) {
          case 'left':
            e.preventDefault(); setIndex((i) => i - 1); AudioEngine.playSfx('blop'); break;
          case 'right':
            e.preventDefault(); setIndex((i) => i + 1); AudioEngine.playSfx('blop'); break;
          case 'enter':
            e.preventDefault(); selectSong(); break;
          case 'escape':
            AudioEngine.playSfx('back'); navigate('/menu'); break;
        }
        return;
      }

      // difficulty phase
      switch (btn.name) {
        case 'up': e.preventDefault(); cycleDiff(-1); break;
        case 'down': e.preventDefault(); cycleDiff(1); break;
        case 'left': e.preventDefault(); cycleSpeed(-1); break;
        case 'right': e.preventDefault(); cycleSpeed(1); break;
        case 'enter': e.preventDefault(); handleStart(); break;
        case 'escape': AudioEngine.playSfx('back'); setPhase('carousel'); break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getButton]);

  const n = songs.length;
  const theta = n ? 360 / n : 0;
  // Cylinder radius so neighbouring cards don't overlap (with a little breathing room).
  const radius = n > 1 ? Math.round((CARD_W / 2) / Math.tan(Math.PI / n) * 1.3) : 0;
  const frontI = n ? mod(index, n) : 0;
  const selectedSong = n ? songs[frontI] : null;
  const zoomed = phase === 'difficulty';

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontFamily: 'EchoDeco', color: '#ea4c88', fontSize: '14vh', textAlign: 'center', margin: '12px 0 0' }}>
        Choose Your Song
      </h1>

      {/* 3D carousel */}
      <div style={{ perspective: '1200px', width: '100%', flex: 1, minHeight: 0, position: 'relative' }}>
        <div
          ref={stageRef}
          style={{
            position: 'absolute',
            top: '42%', left: '50%',
            width: CARD_W, height: CARD_H,
            transformStyle: 'preserve-3d',
            // transform is owned by GSAP; only the centering offset lives here.
            marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2,
          }}
        >
          {songs.map((song, i) => {
            const isFront = i === frontI;
            const front = `rotateY(${i * theta}deg) translateZ(${radius}px)`;
            const transform = isFront && zoomed
              ? `${front} translateZ(140px) scale(1.25)`
              : front;
            return (
              <div
                key={song._id}
                onClick={() => {
                  if (i !== frontI) { setIndex(index + (i - frontI)); return; }
                  if (phase !== 'carousel') return;
                  const avail = availableDiffs(song);
                  if (!avail.length) return;
                  AudioEngine.playSfx('start');
                  setDifficulty1(avail[0]);
                  setPhase('difficulty');
                }}
                style={{
                  position: 'absolute', width: CARD_W, height: CARD_H,
                  transform, transition: 'transform 0.4s ease, opacity 0.4s ease',
                  backfaceVisibility: 'hidden', cursor: 'pointer',
                  opacity: isFront ? 1 : 0.4,
                  backgroundColor: isFront ? '#E9A92E' : 'rgba(234,76,136,0.85)',
                  border: isFront ? '3px solid #2DDEFF' : '3px solid transparent',
                  borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                  color: '#fff', fontFamily: 'petit', padding: '0 12px',
                }}
              >
                {song.background && (
                  <img
                    src={`/img/background/${song.background}`}
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25, borderRadius: 5 }}
                  />
                )}
                <div style={{ position: 'relative', fontSize: 44, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  {song.title}
                </div>
                <div style={{ position: 'relative', fontSize: 28, opacity: 0.85 }}>{song.artist}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Now-playing info */}
      {selectedSong && (
        <div style={{ flexShrink: 0, textAlign: 'center', color: '#b2b2b2', fontFamily: 'petit', marginBottom: 6 }}>
          <div style={{ fontFamily: 'EchoDeco', color: '#ea4c88', fontSize: '6.4vh' }}>{selectedSong.title}</div>
          <div style={{ fontSize: '3.8vh' }}>{selectedSong.artist}</div>
          <div style={{ fontSize: '3.4vh', color: '#2DDEFF' }}>
            BPM: {selectedSong.displayBpm || selectedSong.bpms[0]?.bpm}
          </div>
        </div>
      )}

      {/* Difficulty / speed picker */}
      {phase === 'difficulty' && selectedSong ? (
        <div style={{ flexShrink: 0, display: 'flex', gap: 64, justifyContent: 'center', paddingBottom: 28, color: '#b2b2b2' }}>
          <div style={{ minWidth: 360 }}>
            <div style={{ fontFamily: 'petit', fontSize: 40, marginBottom: 4 }}>
              Difficulty (↑↓)
            </div>
            {availableDiffs(selectedSong).map((d) => (
              <div
                key={d}
                onClick={() => setDifficulty1(d)}
                style={{
                  fontFamily: 'petit', cursor: 'pointer', lineHeight: 1.3,
                  fontSize: difficulty1 === d ? 52 : 40,
                  fontWeight: difficulty1 === d ? 'bold' : 'normal',
                  color: difficulty1 === d ? '#3E98DF' : '#b2b2b2',
                }}
              >
                {d} {selectedSong.Charts[d]?.level}
              </div>
            ))}
            <div style={{ marginTop: 12, fontFamily: 'petit', fontSize: 36 }}>
              Speed (←→):{' '}
              {SPEED_OPTIONS.map((s) => (
                <span
                  key={s}
                  onClick={() => setSpeed1(s)}
                  style={{
                    cursor: 'pointer', marginRight: 12,
                    color: speed1 === s ? '#E9A92E' : '#606468',
                    fontSize: speed1 === s ? 40 : 32,
                  }}
                >
                  {s}x
                </span>
              ))}
            </div>
          </div>
          <div style={{ alignSelf: 'center' }}>
            <button onClick={handleStart} className="btn-dde-pink" style={{ fontSize: 40, padding: '20px 56px' }}>
              START ⏎
            </button>
            <div style={{ marginTop: 8, fontSize: 28, color: '#606468' }}>Esc to go back</div>
          </div>
        </div>
      ) : (
        <div style={{ flexShrink: 0, paddingBottom: 28, color: '#8a8f94', fontFamily: 'petit', fontSize: 48 }}>
          ← → to browse · Enter to choose · Esc for menu
        </div>
      )}
    </div>
  );
}
