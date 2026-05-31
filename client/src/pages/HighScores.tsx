import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Song } from '../types';

export default function HighScores() {
  const [songs, setSongs] = useState<Song[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getSongs().then(setSongs).catch(console.error);
  }, []);

  return (
    <div id="highScoreContainer" style={{ width: '70%', margin: '2% auto' }}>
      <h2 style={{ fontFamily: 'EchoDeco', color: '#ea4c88', textAlign: 'center', fontSize: '50px', marginTop: 0 }}>
        High Scores
      </h2>

      {songs.map((song) => (
        <div
          key={song._id}
          onClick={() => navigate(`/highscores/${song._id}`)}
          style={{ cursor: 'pointer', marginBottom: '16px' }}
        >
          <h3 style={{ fontFamily: 'EchoDeco', color: '#ea4c88', textAlign: 'center', fontSize: '35px' }}>
            {song.title}
          </h3>
          <hr style={{ width: '70%', margin: '10px auto', borderColor: '#606468' }} />
          {song.highScores.slice(0, 3).map((hs, i) => (
            <div key={i} className="score-item">
              <h4 style={{ fontSize: '25px', margin: '4px 0' }}>
                {i + 1}. {hs.name} — {hs.score.toLocaleString()}
              </h4>
            </div>
          ))}
          {song.highScores.length === 0 && (
            <p className="score-item" style={{ fontSize: '16px' }}>No scores yet</p>
          )}
        </div>
      ))}

      <button
        onClick={() => navigate('/menu')}
        className="btn-dde mt-6"
        style={{ display: 'block', margin: '24px auto 0' }}
      >
        Back to Menu
      </button>
    </div>
  );
}
