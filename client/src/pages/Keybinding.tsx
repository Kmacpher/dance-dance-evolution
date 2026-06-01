import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Direction = 'left' | 'down' | 'up' | 'right';

const DIRECTIONS: Direction[] = ['left', 'down', 'up', 'right'];

const DEFAULT_P1: Record<Direction, string> = {
  left: 'ArrowLeft', down: 'ArrowDown', up: 'ArrowUp', right: 'ArrowRight',
};
const DEFAULT_P2: Record<Direction, string> = {
  left: 'a', down: 's', up: 'w', right: 'd',
};

function loadBindings(key: string, defaults: Record<Direction, string>): Record<Direction, string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

export default function Keybinding() {
  const navigate = useNavigate();
  const [p1, setP1] = useState<Record<Direction, string>>(() => loadBindings('keyConfig.p1', DEFAULT_P1));
  const [p2, setP2] = useState<Record<Direction, string>>(() => loadBindings('keyConfig.p2', DEFAULT_P2));
  const [listening, setListening] = useState<{ player: 1 | 2; dir: Direction } | null>(null);

  const startCapture = (player: 1 | 2, dir: Direction) => {
    setListening({ player, dir });

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = e.key;
      if (player === 1) {
        const next = { ...p1, [dir]: key };
        setP1(next);
        localStorage.setItem('keyConfig.p1', JSON.stringify(next));
      } else {
        const next = { ...p2, [dir]: key };
        setP2(next);
        localStorage.setItem('keyConfig.p2', JSON.stringify(next));
      }
      setListening(null);
      window.removeEventListener('keydown', handler);
    };

    window.addEventListener('keydown', handler, { once: true });
  };

  const reset = () => {
    setP1({ ...DEFAULT_P1 });
    setP2({ ...DEFAULT_P2 });
    localStorage.removeItem('keyConfig.p1');
    localStorage.removeItem('keyConfig.p2');
  };

  const dirLabel: Record<Direction, string> = {
    left: '←', down: '↓', up: '↑', right: '→',
  };

  return (
    <div className="min-h-[100vh] bg-black flex flex-col items-center justify-center px-4 space-y-8">
      <h2 className="font-game text-dde-cyan text-lg">KEYBINDING</h2>
      <p className="font-game text-xs text-gray-500">Click a button then press a key to rebind</p>

      <div className="flex gap-12">
        {[
          { label: 'PLAYER 1', bindings: p1, player: 1 as const },
          { label: 'PLAYER 2', bindings: p2, player: 2 as const },
        ].map(({ label, bindings, player }) => (
          <div key={player} className="space-y-3">
            <p className="font-game text-xs text-center" style={{ color: player === 1 ? '#00BBF9' : '#F15BB5' }}>
              {label}
            </p>
            {DIRECTIONS.map((dir) => {
              const isCapturing = listening?.player === player && listening?.dir === dir;
              return (
                <div key={dir} className="flex items-center gap-3">
                  <span className="font-game text-sm text-white w-6 text-center">{dirLabel[dir]}</span>
                  <button
                    onClick={() => startCapture(player, dir)}
                    className={`font-game text-xs px-4 py-2 rounded border w-32 transition-colors ${
                      isCapturing
                        ? 'border-dde-yellow text-dde-yellow animate-pulse'
                        : 'border-gray-600 text-gray-300 hover:border-dde-cyan hover:text-dde-cyan'
                    }`}
                  >
                    {isCapturing ? 'PRESS KEY...' : bindings[dir]}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="font-game text-xs px-4 py-2 border border-gray-700 hover:border-dde-pink text-gray-500 hover:text-dde-pink transition-colors rounded"
        >
          RESET DEFAULTS
        </button>
        <button
          onClick={() => navigate('/menu')}
          className="font-game text-xs px-4 py-2 bg-dde-purple hover:bg-dde-pink transition-colors rounded"
        >
          DONE
        </button>
      </div>
    </div>
  );
}
