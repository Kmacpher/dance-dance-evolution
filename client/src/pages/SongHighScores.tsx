import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { HighScore } from '../types';

export default function SongHighScores() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const [scores, setScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!songId) return;
    api.getHighScores(songId)
      .then(setScores)
      .finally(() => setLoading(false));
  }, [songId]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-black flex flex-col items-center justify-center px-4 space-y-6">
      <h2 className="font-game text-dde-cyan text-lg">LEADERBOARD</h2>

      {loading ? (
        <p className="font-game text-xs text-gray-500">Loading...</p>
      ) : scores.length === 0 ? (
        <p className="font-game text-xs text-gray-500">No scores yet. Be the first!</p>
      ) : (
        <div className="w-72 space-y-3">
          {scores.map((hs, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-4 py-2 bg-gray-900 rounded border border-gray-800"
            >
              <div className="flex items-center gap-3">
                <span className="font-game text-xs text-gray-500">{i + 1}</span>
                <span className="font-game text-sm text-white">{hs.name}</span>
              </div>
              <span className="font-game text-sm text-dde-yellow">{hs.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="font-game text-xs text-gray-500 hover:text-dde-cyan transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate('/choose-song')}
          className="font-game text-xs px-4 py-2 bg-dde-purple hover:bg-dde-pink transition-colors rounded"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
