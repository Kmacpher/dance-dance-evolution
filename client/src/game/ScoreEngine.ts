import { PlayerState, AccuracyLabel } from '../types';

export const TIMING_WINDOWS = {
  Flawless: 0.03,
  Marvelous: 0.07,
  Great: 0.10,
} as const;

const POINTS = { Flawless: 10, Marvelous: 7, Great: 5 } as const;

export const ACCURACY_COLORS: Record<AccuracyLabel, string> = {
  Flawless: '#40C7DF',
  Marvelous: '#E8E374',
  Great: '#8EED44',
  Bad: '#FFD700',
  Boo: '#ED3DED',
};

export function makePlayerState(): PlayerState {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    totalArrows: 0,
    totalFreezes: 0,
    accuracyCount: { Flawless: 0, Marvelous: 0, Great: 0 },
    realScore: 0,
  };
}

export function addScore(player: PlayerState, diff: number): number {
  if (diff <= TIMING_WINDOWS.Flawless) {
    player.score += POINTS.Flawless;
    player.accuracyCount.Flawless++;
  } else if (diff <= TIMING_WINDOWS.Marvelous) {
    player.score += POINTS.Marvelous;
    player.accuracyCount.Marvelous++;
  } else if (diff <= TIMING_WINDOWS.Great) {
    player.score += POINTS.Great;
    player.accuracyCount.Great++;
  }
  return player.score;
}

export function addCombo(player: PlayerState, diff: number): number {
  if (diff <= TIMING_WINDOWS.Great) {
    player.combo++;
    if (player.combo > player.maxCombo) player.maxCombo = player.combo;
  }
  return player.combo;
}

export function resetCombo(player: PlayerState): void {
  player.combo = 0;
}

export function setTotalArrows(player: PlayerState, chart: string[][][]): void {
  player.totalArrows = 0;
  player.totalFreezes = 0;
  for (const measure of chart) {
    for (const line of measure) {
      for (const arrow of line) {
        if (arrow === '1' || arrow === '2' || arrow === '3') {
          player.totalArrows++;
          if (arrow === '3') player.totalFreezes++;
        }
      }
    }
  }
}

export function finalScore(player: PlayerState): number {
  const maxPossible = (player.totalArrows - player.totalFreezes) * POINTS.Flawless;
  const raw = player.score + player.maxCombo;
  const ratio = raw > maxPossible ? 1 : raw / maxPossible;
  player.realScore = Math.floor((ratio + 1) * 1000000 / 2);
  return player.realScore;
}

export function getPercent(player: PlayerState): number {
  const hits = player.accuracyCount.Flawless + player.accuracyCount.Marvelous + player.accuracyCount.Great;
  return hits / (player.totalArrows - player.totalFreezes);
}

export function getAccuracy(diff: number): AccuracyLabel | null {
  for (const [label, window] of Object.entries(TIMING_WINDOWS) as [AccuracyLabel, number][]) {
    if (window >= diff) return label;
  }
  return null;
}

export function isHighScore(score: number, highScores: { score: number }[]): boolean {
  return highScores.length < 5 || score > highScores[highScores.length - 1].score;
}

export function insertHighScore(
  highScores: { name: string; score: number }[],
  name: string,
  score: number
): { name: string; score: number }[] {
  const updated = highScores.length < 5
    ? [...highScores, { name, score }]
    : [...highScores.slice(0, -1), { name, score }];
  return updated.sort((a, b) => b.score - a.score);
}
