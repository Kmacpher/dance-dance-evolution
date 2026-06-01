import { useLocation, useNavigate } from 'react-router-dom';
import { PlayerState } from '../types';

interface LocationState {
  p1: PlayerState & { percent: number };
  p2: PlayerState & { percent: number };
}

export default function ResultsVersus() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const p1 = state?.p1;
  const p2 = state?.p2;
  const winner = p1 && p2
    ? p1.realScore > p2.realScore ? 'P1' : p2.realScore > p1.realScore ? 'P2' : 'TIE'
    : null;

  return (
    <div className="min-h-[100vh] bg-black flex flex-col items-center justify-center space-y-8 px-4">
      <h2 className="font-game text-dde-cyan text-xl">RESULTS</h2>

      {winner && (
        <p className="font-game text-dde-yellow text-2xl">
          {winner === 'TIE' ? 'TIE GAME!' : `${winner} WINS!`}
        </p>
      )}

      <div className="flex gap-12">
        {[
          { label: 'P1', player: p1, color: 'text-dde-cyan' },
          { label: 'P2', player: p2, color: 'text-dde-pink' },
        ].map(({ label, player, color }) => (
          <div key={label} className="text-center space-y-2">
            <p className={`font-game text-sm ${color}`}>{label}</p>
            <p className="font-game text-white text-2xl">{player?.realScore.toLocaleString() ?? '-'}</p>
            <p className="font-game text-xs text-gray-400">
              {player ? `${(player.percent * 100).toFixed(1)}%` : ''}
            </p>
            <p className="font-game text-xs text-gray-500">
              MAX COMBO: {player?.maxCombo ?? '-'}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/menu')}
        className="font-game text-xs px-8 py-3 bg-dde-purple hover:bg-dde-pink transition-colors rounded"
      >
        MENU
      </button>
    </div>
  );
}
