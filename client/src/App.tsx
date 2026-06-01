import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainMenu from './pages/MainMenu';
import ChooseSong from './pages/ChooseSong';
import Game from './pages/Game';
import Versus from './pages/Versus';
import Results from './pages/Results';
import ResultsVersus from './pages/ResultsVersus';
import Upload from './pages/Upload';
import HighScores from './pages/HighScores';
import SongHighScores from './pages/SongHighScores';
import Keybinding from './pages/Keybinding';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/menu"
              element={
                <ProtectedRoute>
                  <MainMenu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/choose-song"
              element={
                <ProtectedRoute>
                  <ChooseSong />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/:songId/:difficulty"
              element={
                <ProtectedRoute>
                  <Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/versus/:songId/:difficulty/:difficultyP2"
              element={
                <ProtectedRoute>
                  <Versus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:songId"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results-versus"
              element={
                <ProtectedRoute>
                  <ResultsVersus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route path="/highscores" element={<HighScores />} />
            <Route path="/highscores/:songId" element={<SongHighScores />} />
            <Route
              path="/keybinding"
              element={
                <ProtectedRoute>
                  <Keybinding />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
