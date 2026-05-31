import { useCallback } from 'react';

export type Direction = 'left' | 'down' | 'up' | 'right';

// Stored format is direction -> keyboard key, matching what Keybinding.tsx writes.
const DEFAULT_P1: Record<Direction, string> = {
  left: 'ArrowLeft',
  down: 'ArrowDown',
  up: 'ArrowUp',
  right: 'ArrowRight',
};

const DEFAULT_P2: Record<Direction, string> = {
  left: 'a',
  down: 's',
  up: 'w',
  right: 'd',
};

function loadConfig(key: string, defaults: Record<Direction, string>): Record<Direction, string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

// Build a key -> direction lookup from the direction -> key config.
function reverse(config: Record<Direction, string>): Record<string, Direction> {
  const out: Record<string, Direction> = {};
  (Object.keys(config) as Direction[]).forEach((dir) => {
    out[config[dir]] = dir;
  });
  return out;
}

export function useKeyConfig() {
  const p1 = loadConfig('keyConfig.p1', DEFAULT_P1);
  const p2 = loadConfig('keyConfig.p2', DEFAULT_P2);

  const getButton = useCallback(
    (e: KeyboardEvent): { player: 0 | 1; name: Direction | 'enter' | 'escape' } | null => {
      if (e.key === 'Enter') return { player: 0, name: 'enter' };
      if (e.key === 'Escape') return { player: 0, name: 'escape' };

      const p1Lookup = reverse(p1);
      const p2Lookup = reverse(p2);
      if (p1Lookup[e.key]) return { player: 0, name: p1Lookup[e.key] };
      if (p2Lookup[e.key]) return { player: 1, name: p2Lookup[e.key] };
      return null;
    },
    [p1, p2]
  );

  return { getButton, p1, p2 };
}
