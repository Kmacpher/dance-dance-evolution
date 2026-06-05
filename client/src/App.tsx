import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MainMenu from './pages/MainMenu';
import ChooseSong from './pages/ChooseSong';
import Game from './pages/Game';
import Results from './pages/Results';
import Upload from './pages/Upload';
import HighScores from './pages/HighScores';
import SongHighScores from './pages/SongHighScores';
import Keybinding from './pages/Keybinding';
import Calibrate from './pages/Calibrate';

export default function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MainMenu />} />
          <Route path="/choose-song" element={<ChooseSong />} />
          <Route path="/game/:songId/:difficulty" element={<Game />} />
          <Route path="/results/:songId" element={<Results />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/highscores" element={<HighScores />} />
          <Route path="/highscores/:songId" element={<SongHighScores />} />
          <Route path="/keybinding" element={<Keybinding />} />
          <Route path="/calibrate" element={<Calibrate />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
