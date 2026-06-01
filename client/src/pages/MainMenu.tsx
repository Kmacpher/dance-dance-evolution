import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { AudioEngine } from '../game/AudioEngine';
import { useKeyConfig } from '../hooks/useKeyConfig';

const MENU_ITEMS = [
  { id: 'option1', label: '1P Game Start', path: '/choose-song?players=1' },
  { id: 'option2', label: 'VS Game Start', path: '/choose-song?players=2' },
  { id: 'option3', label: 'Set Keybindings', path: '/keybinding' },
  { id: 'option4', label: 'Upload Song', path: '/upload' },
  { id: 'option5', label: 'Exit', path: '/' },
];

export default function MainMenu() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { getButton } = useKeyConfig();
  const [activeIdx, setActiveIdx] = useState(0);
  // Keep the current index reachable from the keydown closure without re-binding.
  const activeRef = useRef(0);
  activeRef.current = activeIdx;

  const go = (path: string) => {
    AudioEngine.playSfx('start');
    navigate(path);
  };

  // Arrow-key navigation, matching the legacy mainMenu: up/down wrap + blop,
  // Enter confirms + start sfx, Escape → home + back sfx.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const btn = getButton(e);
      if (!btn) return;
      switch (btn.name) {
        case 'up':
          e.preventDefault();
          AudioEngine.playSfx('blop');
          setActiveIdx((i) => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
          break;
        case 'down':
          e.preventDefault();
          AudioEngine.playSfx('blop');
          setActiveIdx((i) => (i + 1) % MENU_ITEMS.length);
          break;
        case 'enter':
          go(MENU_ITEMS[activeRef.current].path);
          break;
        case 'escape':
          AudioEngine.playSfx('back');
          navigate('/');
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getButton]);

  return (
    <div id="mainMenuPage" className="relative h-[100vh] overflow-hidden">
      <div
        id="mainMenuOptions"
        className="absolute w-full h-full flex flex-col items-center justify-center menuXParent"
      >
        {user && (
          <p
            className="text-center mb-4 text-[#2DDEFF]"
            style={{ fontFamily: 'Open Sans', fontSize: '14px' }}
          >
            Welcome, {user.username}
          </p>
        )}
        {MENU_ITEMS.map((item, i) => (
          <div
            key={item.id}
            className={`menuX${i === activeIdx ? ' activeChoice' : ''}`}
            onClick={() => go(item.path)}
            onMouseEnter={() => setActiveIdx(i)}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
