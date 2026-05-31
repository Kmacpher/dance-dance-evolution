import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { AudioEngine } from '../game/AudioEngine';

type ArrowDir = 'left' | 'up' | 'down' | 'right';

const ARROW_KEYS: { dir: ArrowDir; keys: string[] }[] = [
  { dir: 'left',  keys: ['ArrowLeft'] },
  { dir: 'down',  keys: ['ArrowDown', 's'] },
  { dir: 'up',    keys: ['ArrowUp', 'w'] },
  { dir: 'right', keys: ['ArrowRight'] },
];

const ROTATION: Record<ArrowDir, string> = {
  up: 'rotate(0deg)',
  right: 'rotate(90deg)',
  down: 'rotate(180deg)',
  left: 'rotate(-90deg)',
};

export default function Home() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const pressedRef = useRef<Set<ArrowDir>>(new Set());
  const imgRefs = useRef<Partial<Record<ArrowDir, HTMLImageElement>>>({});

  const handleStart = () => {
    AudioEngine.playSfx('start');
    navigate(user ? '/menu' : '/login');
  };

  // Animate arrow keys on keypress to match original
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      for (const { dir, keys } of ARROW_KEYS) {
        if (keys.includes(e.key)) {
          pressedRef.current.add(dir);
          const el = imgRefs.current[dir];
          if (el) el.style.filter = 'brightness(2) drop-shadow(0 0 8px #2DDEFF)';
        }
      }
      if (e.key === 'Enter') handleStart();
    };
    const onUp = (e: KeyboardEvent) => {
      for (const { dir, keys } of ARROW_KEYS) {
        if (keys.includes(e.key)) {
          pressedRef.current.delete(dir);
          const el = imgRefs.current[dir];
          if (el) el.style.filter = '';
        }
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  });

  return (
    <div
      id="home"
      className="relative h-[calc(100vh-56px)] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="wrap z-10 text-center">
        <h1
          className="text-[#2DDEFF] mt-[3%]"
          style={{ fontFamily: 'EchoDeco', fontSize: '8vh' }}
        >
          Dance Dance Evolution
        </h1>

        {/* Arrow key display */}
        <div className="arrow-keys flex justify-center gap-4 mt-[3%] mb-8">
          {(['left', 'up-down', 'right'] as const).map((slot) => {
            if (slot === 'up-down') {
              return (
                <div key="up-down" className="flex flex-col items-center gap-1">
                  {(['up', 'down'] as ArrowDir[]).map((dir) => (
                    <img
                      key={dir}
                      ref={(el) => { if (el) imgRefs.current[dir] = el; }}
                      src="/img/arrowKey.png"
                      alt={dir}
                      style={{ width: '60px', transform: ROTATION[dir], transition: 'filter 0.1s' }}
                    />
                  ))}
                </div>
              );
            }
            const dir = slot as ArrowDir;
            return (
              <div key={dir} className="flex items-center">
                <img
                  ref={(el) => { if (el) imgRefs.current[dir] = el; }}
                  src="/img/arrowKey.png"
                  alt={dir}
                  style={{ width: '60px', transform: ROTATION[dir], transition: 'filter 0.1s' }}
                />
              </div>
            );
          })}
        </div>
        <p className="text-[#2DDEFF] text-sm mb-6">to move</p>

        <div className="flex items-center justify-center gap-3">
          <img src="/img/enterKey.png" alt="enter" style={{ height: '60px' }} />
          <span className="text-[#2DDEFF] text-base"> to start</span>
        </div>

        <button
          onClick={handleStart}
          className="btn-dde mt-8 block mx-auto"
        >
          {user ? 'MAIN MENU' : 'LOGIN TO PLAY'}
        </button>
      </div>
    </div>
  );
}
