import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { AudioEngine } from '../game/AudioEngine';

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
  const [activeIdx, setActiveIdx] = useState(0);

  const go = (path: string) => {
    AudioEngine.playSfx('start');
    navigate(path);
  };

  return (
    <div id="mainMenuPage" className="relative h-[calc(100vh-56px)] overflow-hidden">
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
