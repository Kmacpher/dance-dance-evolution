import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Song, Difficulty } from '../types';
import { AudioEngine } from '../game/AudioEngine';

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Easy', 'Medium', 'Hard', 'Challenge'];

export default function ChooseSong() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const players = Number(params.get('players') ?? 1) as 1 | 2;

  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [difficulty1, setDifficulty1] = useState<Difficulty>('Medium');
  const [difficulty2, setDifficulty2] = useState<Difficulty>('Medium');
  const [speed1, setSpeed1] = useState(1);
  const [speed2, setSpeed2] = useState(1);
  const previewRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    api.getSongs().then(setSongs).catch(console.error);
    return () => previewRef.current?.stopPreview();
  }, []);

  const selectSong = (song: Song) => {
    previewRef.current?.stopPreview();
    setSelectedSong(song);

    const bpm = song.bpms[0].bpm;
    const arrowTime = (100 / 1) * 4 / bpm;
    const engine = new AudioEngine(
      `/audio/${song.music}`, bpm, song.offset, arrowTime,
      song.sampleStart ?? 0, song.sampleLength ?? 12
    );
    engine.startPreview();
    previewRef.current = engine;

    const available = DIFFICULTIES.find((d) => song.Charts[d]);
    if (available) { setDifficulty1(available); setDifficulty2(available); }
  };

  const handleStart = () => {
    if (!selectedSong) return;
    previewRef.current?.stopPreview();
    AudioEngine.playSfx('start');
    if (players === 2) {
      navigate(`/versus/${selectedSong._id}/${difficulty1}/${difficulty2}?mod1=${speed1}&mod2=${speed2}`);
    } else {
      navigate(`/game/${selectedSong._id}/${difficulty1}?mod=${speed1}`);
    }
  };

  const availableDiffs = (song: Song | null) => DIFFICULTIES.filter((d) => song?.Charts[d]);

  const speedOptions = [1, 1.5, 2, 2.5, 3, 4];

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', overflow: 'hidden', position: 'relative' }}>

      {/* Song carousel list */}
      <div style={{
        width: '320px', flexShrink: 0, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '3.5%',
      }}>
        <h1 style={{ fontFamily: 'EchoDeco', color: '#ea4c88', fontSize: '11vh', textAlign: 'center', margin: '0 0 16px 0' }}>
          Choose
        </h1>
        {songs.map((song) => (
          <div
            key={song._id}
            onClick={() => selectSong(song)}
            style={{
              width: '280px', height: '90px', marginBottom: '8px',
              backgroundColor: selectedSong?._id === song._id ? '#E9A92E' : 'rgba(234, 76, 136, 0.75)',
              color: '#eee', fontSize: '20px', textAlign: 'center',
              paddingTop: '28px', cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontFamily: 'petit',
            }}
            onMouseEnter={(e) => { if (selectedSong?._id !== song._id) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(212,65,121,0.75)'; }}
            onMouseLeave={(e) => { if (selectedSong?._id !== song._id) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(234,76,136,0.75)'; }}
          >
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', padding: '0 8px' }}>
              {song.title}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{song.artist}</div>
          </div>
        ))}
      </div>

      {/* Song info + difficulty pickers */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', color: '#b2b2b2' }}>
        {selectedSong ? (
          <>
            {/* Difficulty selectors */}
            <div style={{ position: 'absolute', left: '77%', top: '80px', width: '25%' }}>
              <div style={{ fontFamily: 'petit', fontSize: '24px', color: '#b2b2b2', marginBottom: '8px' }}>
                P1 Difficulty
              </div>
              {availableDiffs(selectedSong).map((d) => (
                <div
                  key={d}
                  onClick={() => setDifficulty1(d)}
                  style={{
                    fontFamily: 'petit', fontSize: difficulty1 === d ? '32px' : '24px',
                    fontWeight: difficulty1 === d ? 'bold' : 'normal',
                    color: difficulty1 === d ? '#3E98DF' : '#b2b2b2',
                    cursor: 'pointer', maxHeight: '6vh', transition: 'all 0.1s',
                  }}
                >
                  {d} {selectedSong.Charts[d]?.level}
                </div>
              ))}

              {players === 2 && (
                <>
                  <div style={{ fontFamily: 'petit', fontSize: '24px', color: '#b2b2b2', margin: '16px 0 8px' }}>
                    P2 Difficulty
                  </div>
                  {availableDiffs(selectedSong).map((d) => (
                    <div
                      key={d}
                      onClick={() => setDifficulty2(d)}
                      style={{
                        fontFamily: 'petit', fontSize: difficulty2 === d ? '32px' : '24px',
                        fontWeight: difficulty2 === d ? 'bold' : 'normal',
                        color: difficulty2 === d ? '#22BD6B' : '#b2b2b2',
                        cursor: 'pointer', maxHeight: '6vh', transition: 'all 0.1s',
                      }}
                    >
                      {d} {selectedSong.Charts[d]?.level}
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Chart info */}
            <div id="chart-info" style={{ fontSize: '5vh', color: '#b2b2b2', position: 'absolute', top: '14%', left: '35%', width: '25%' }}>
              <div style={{ fontFamily: 'EchoDeco', color: '#ea4c88', fontSize: '6vh' }}>
                {selectedSong.title}
              </div>
              <div style={{ fontFamily: 'petit', fontSize: '3vh' }}>{selectedSong.artist}</div>
              <div style={{ fontFamily: 'petit', fontSize: '2.5vh', color: '#2DDEFF', marginTop: '8px' }}>
                BPM: {selectedSong.displayBpm || selectedSong.bpms[0]?.bpm}
              </div>

              {/* Speed mod */}
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontFamily: 'petit', fontSize: '2vh' }}>P1 Speed: </span>
                {speedOptions.map((s) => (
                  <span
                    key={s}
                    onClick={() => setSpeed1(s)}
                    style={{
                      fontFamily: 'petit', fontSize: speed1 === s ? '2.5vh' : '2vh',
                      color: speed1 === s ? '#E9A92E' : '#606468',
                      marginRight: '8px', cursor: 'pointer',
                    }}
                  >
                    {s}x
                  </span>
                ))}
              </div>

              {players === 2 && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontFamily: 'petit', fontSize: '2vh' }}>P2 Speed: </span>
                  {speedOptions.map((s) => (
                    <span
                      key={s}
                      onClick={() => setSpeed2(s)}
                      style={{
                        fontFamily: 'petit', fontSize: speed2 === s ? '2.5vh' : '2vh',
                        color: speed2 === s ? '#22BD6B' : '#606468',
                        marginRight: '8px', cursor: 'pointer',
                      }}
                    >
                      {s}x
                    </span>
                  ))}
                </div>
              )}

              {selectedSong.background && (
                <div style={{ marginTop: '16px' }}>
                  <img
                    src={`/img/background/${selectedSong.background}`}
                    alt="background"
                    style={{ width: '180px', height: '100px', objectFit: 'cover', opacity: 0.8 }}
                  />
                </div>
              )}

              <button
                onClick={handleStart}
                className="btn-dde-pink"
                style={{ marginTop: '24px', fontSize: '20px', padding: '12px 32px' }}
              >
                START
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ fontFamily: 'petit', fontSize: '30px', color: '#606468' }}>
              Select a song
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
