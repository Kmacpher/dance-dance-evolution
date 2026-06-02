import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AudioEngine } from '../game/AudioEngine';
import { homeAudio } from '../game/homeAudio';
import Visualizer from '../components/Visualizer';
import { useKeyConfig, type Direction } from '../hooks/useKeyConfig';

// Each arrow image is rotated to point in its direction.
const ROTATION: Record<Direction, string> = {
  up: 'rotate(0deg)',
  right: 'rotate(90deg)',
  down: 'rotate(180deg)',
  left: 'rotate(-90deg)',
};

// Legacy home.js physically shifts each arrow ~20px in its own *screen* direction
// on press. Because the img is rotated, the translate is listed first in the
// transform list so it applies in screen space (after the rotate), not the
// rotated frame.
const NUDGE: Record<Direction, string> = {
  left: 'translateX(-20px)',
  right: 'translateX(20px)',
  up: 'translateY(-20px)',
  down: 'translateY(20px)',
};

// Matches legacy home.js: grayscale(1) brightness(200%).
const PRESSED_FILTER = 'grayscale(1) brightness(2)';

export default function Home() {
  const navigate = useNavigate();
  const { getButton } = useKeyConfig();
  const imgRefs = useRef<Partial<Record<Direction, HTMLImageElement>>>({});
  const [playing, setPlaying] = useState(homeAudio.isPlaying);

  const handleStart = () => {
    AudioEngine.playSfx('start');
    navigate('/menu');
  };

  // 'P' starts/stops Sandstorm (and, via homeAudio.isPlaying, the visualizer).
  const togglePlay = () => setPlaying(homeAudio.toggle());

  const setArrow = (dir: Direction, pressed: boolean) => {
    const el = imgRefs.current[dir];
    if (!el) return;
    el.style.transform = pressed ? `${NUDGE[dir]} ${ROTATION[dir]}` : ROTATION[dir];
    el.style.filter = pressed ? PRESSED_FILTER : '';
  };

  // Stop the music when leaving the home screen.
  useEffect(() => () => homeAudio.stop(), []);

  // Nudge the arrow images on keypress (and reset on release) to match the
  // legacy home screen. Routed through useKeyConfig so rebinds + WASD work.
  // 'P' starts/stops the music and visualizer together.
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') {
        togglePlay();
        return;
      }
      const btn = getButton(e);
      if (!btn) return;
      if (btn.name === 'enter') {
        handleStart();
      } else if (btn.name !== 'escape') {
        setArrow(btn.name, true);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const btn = getButton(e);
      if (btn && btn.name !== 'enter' && btn.name !== 'escape') setArrow(btn.name, false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getButton]);

  return (
    <div
      id="home"
      className="relative h-[100vh] flex flex-col items-center justify-top overflow-hidden"
    >
      {/* Audio-reactive pink wireframe blob, behind the menu content. */}
      <Visualizer />

      <div className="wrap z-10 text-center">
        <h1
          className="text-[#2DDEFF] mt-[3%]"
          style={{ fontFamily: 'EchoDeco', fontSize: '8vh' }}
        >
          Dance Dance Evolution
        </h1>
      </div>

      {/* Controls column, on the right (vertically centered, not flush to edge). */}
      <div className="absolute right-[10vw] bottom-[10vw] z-10 flex flex-col items-center gap-3">
        {/* Arrow key display */}
        <div className="arrow-keys flex justify-center gap-1">
          {(['left', 'up-down', 'right'] as const).map((slot) => {
            if (slot === 'up-down') {
              return (
                <div key="up-down" className="flex flex-col items-center gap-12">
                  {(['up', 'down'] as Direction[]).map((dir) => (
                    <img
                      key={dir}
                      ref={(el) => { if (el) imgRefs.current[dir] = el; }}
                      src="/img/arrowKey.png"
                      alt={dir}
                      style={{ width: '60px', transform: ROTATION[dir], transition: 'transform 0.08s, filter 0.08s' }}
                    />
                  ))}
                </div>
              );
            }
            const dir = slot as Direction;
            return (
              <div key={dir} className="flex items-center">
                <img
                  ref={(el) => { if (el) imgRefs.current[dir] = el; }}
                  src="/img/arrowKey.png"
                  alt={dir}
                  style={{ width: '60px', transform: ROTATION[dir], transition: 'transform 0.08s, filter 0.08s' }}
                />
              </div>
            );
          })}
        </div>
        <p className="text-[#2DDEFF] text-sm mb-4">to move</p>

        <div className="flex items-center gap-3">
          <img src="/img/enterKey.png" alt="enter" style={{ height: '60px' }} />
          <span className="text-[#2DDEFF] text-base"> to start</span>
        </div>

        {/* Play/pause toggle — keyed to 'p', styled to match the arrow keys.
            The button's appearance stays constant; only the label changes. */}
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={togglePlay}
            aria-pressed={playing}
            className="flex items-center justify-center w-[50px] h-[50px] rounded-[8px] border text-base"
            style={{ borderColor: '#2DDEFF', color: '#2DDEFF', background: 'transparent' }}
          >
            p
          </button>
          <span className="text-[#2DDEFF] text-base">{playing ? 'to pause' : 'to play'}</span>
        </div>
      </div>
    </div>
  );
}
