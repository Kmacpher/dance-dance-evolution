import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { PlayerState, HighScore } from '../types';
import { isHighScore, insertHighScore } from '../game/ScoreEngine';

interface LocationState {
  player: PlayerState & { percent: number };
}

export default function Results() {
  const { songId } = useParams<{ songId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const score = state?.player.realScore ?? 0;
  const percent = state?.player.percent ?? 0;
  const player = state?.player;

  useEffect(() => {
    if (!songId) return;
    api.getHighScores(songId).then((scores) => {
      setHighScores(scores);
      if (isHighScore(score, scores)) setShowModal(true);
    });
  }, [songId, score]);

  const handleSubmitScore = async () => {
    if (!songId || !name.trim()) return;
    const updated = insertHighScore(highScores, name.trim(), score);
    await api.putHighScores(songId, updated);
    setHighScores(updated);
    setSubmitted(true);
    setShowModal(false);
  };

  return (
    <div className="resultsContainer" style={{ width: '80%', margin: 'auto', paddingTop: '3%', maxHeight: '100%', overflow: 'auto' }}>
      <h1
        style={{ fontFamily: 'EchoDeco', fontSize: '12vh', fontWeight: 100, color: '#ea4c88', textAlign: 'center', marginTop: '-3%' }}
      >
        Results
      </h1>

      {player && (
        <div style={{ display: 'flex', gap: '0', width: '100%' }}>
          {/* Hit breakdown */}
          <div className="hitBreakdown" style={{ display: 'inline-block', color: 'white', float: 'left', paddingTop: '2%', width: '50.5%', marginLeft: '-0.5%' }}>
            <h2 style={{ fontFamily: 'petit', fontSize: '4.5vh', fontWeight: 'lighter', marginLeft: '2%' }}>
              Hit Breakdown
            </h2>
            <p style={{ fontFamily: 'petit', fontSize: '3vh', marginLeft: '2%' }}>
              <span style={{ color: '#40C7DF' }}>Flawless:</span> {player.accuracyCount.Flawless}
            </p>
            <p style={{ fontFamily: 'petit', fontSize: '3vh', marginLeft: '2%' }}>
              <span style={{ color: '#E8E374' }}>Marvelous:</span> {player.accuracyCount.Marvelous}
            </p>
            <p style={{ fontFamily: 'petit', fontSize: '3vh', marginLeft: '2%' }}>
              <span style={{ color: '#8EED44' }}>Great:</span> {player.accuracyCount.Great}
            </p>
            <p style={{ fontFamily: 'petit', fontSize: '3vh', marginLeft: '2%', color: '#E9A92E' }}>
              Max Combo: {player.maxCombo}
            </p>
            <p style={{ fontFamily: 'petit', fontSize: '3vh', marginLeft: '2%', color: '#2DDEFF' }}>
              Accuracy: {(percent * 100).toFixed(1)}%
            </p>
          </div>

          {/* Score */}
          <div className="scoreBreakdown" style={{ display: 'inline-block', color: 'white', float: 'right', paddingTop: '2%', width: '50%', textAlign: 'center' }}>
            <p className="accuracyDesc">Final Score</p>
            <h1 style={{ fontFamily: 'EchoDeco', fontSize: '12vh', fontWeight: 100, color: 'white', margin: 0 }}>
              {score.toLocaleString()}
            </h1>

            <h3 style={{ fontFamily: 'EchoDeco', color: '#ea4c88', fontSize: '25px', marginTop: '16px' }}>
              Top Scores
            </h3>
            {highScores.slice(0, 5).map((hs, i) => (
              <p key={i} className="score-item" style={{ fontSize: '20px' }}>
                {i + 1}. {hs.name} — {hs.score.toLocaleString()}
              </p>
            ))}
          </div>
        </div>
      )}

      <div style={{ clear: 'both', paddingTop: '24px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/menu')} className="btn-dde">
          Main Menu
        </button>
        <button onClick={() => navigate(`/highscores/${songId}`)} className="btn-dde-pink">
          Leaderboard
        </button>
      </div>

      {/* High score modal */}
      {showModal && !submitted && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            background: '#2c3338', border: '2px solid #2DDEFF',
            padding: '40px', maxWidth: '400px', width: '90%', textAlign: 'center'
          }}>
            <h2 style={{ fontFamily: 'EchoDeco', color: '#2DDEFF', fontSize: '30px' }}>
              New High Score!
            </h2>
            <p style={{ fontFamily: 'petit', fontSize: '4vh', color: 'white' }}>
              {score.toLocaleString()}
            </p>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitScore();
              }}
              autoFocus
              maxLength={20}
              className="form-input"
              style={{ marginBottom: '16px', width: '100%', textAlign: 'center', fontSize: '18px', color: '#f0f0f0' }}
            />
            <p style={{ fontFamily: 'petit', fontSize: '2.4vh', color: '#9aa0a6', margin: 0 }}>
              Press Enter to submit
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
