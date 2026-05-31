import { useCallback } from 'react';

export type Direction = 'left' | 'down' | 'up' | 'right';

const DEFAULT_P1: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowDown: 'down',
  ArrowUp: 'up',
  ArrowRight: 'right',
};

const DEFAULT_P2: Record<string, Direction> = {
  a: 'left',
  s: 'down',
  w: 'up',
  d: 'right',
};

function loadConfig(key: string, defaults: Record<string, Direction>): Record<string, Direction> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaults;
  } catch {
    return defaults;
  }
}

export function useKeyConfig() {
  const p1 = loadConfig('keyConfig.p1', DEFAULT_P1);
  const p2 = loadConfig('keyConfig.p2', DEFAULT_P2);

  const getButton = useCallback(
    (e: KeyboardEvent): { player: 0 | 1; name: Direction | 'enter' | 'escape' } | null => {
      if (e.key === 'Enter') return { player: 0, name: 'enter' };
      if (e.key === 'Escape') return { player: 0, name: 'escape' };

      if (p1[e.key]) return { player: 0, name: p1[e.key] };
      if (p2[e.key]) return { player: 1, name: p2[e.key] };
      return null;
    },
    [p1, p2]
  );

  return { getButton, p1, p2 };
}
