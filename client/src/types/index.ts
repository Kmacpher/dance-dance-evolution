export interface BPMEntry {
  beat: number;
  bpm: number;
}

export interface StopEntry {
  beat: number;
  duration: number;
}

export interface GrooveRadar {
  stream: number;
  voltage: number;
  air: number;
  freeze: number;
  chaos: number;
}

export interface ChartEntry {
  stepChart: string;
  level: number;
  grooveRadar: GrooveRadar;
}

export interface Song {
  _id: string;
  title: string;
  artist: string;
  bpms: BPMEntry[];
  stops: StopEntry[];
  displayBpm: string;
  offset: string;
  music: string;
  sampleStart?: number;
  sampleLength?: number;
  banner?: string;
  background?: string;
  highScores: HighScore[];
  Charts: Partial<Record<Difficulty, ChartEntry>>;
}

export interface StepChart {
  _id: string;
  title: string;
  difficulty: string;
  chart: string[][][];
}

export interface HighScore {
  name: string;
  score: number;
}

export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Challenge';

export interface PlayerState {
  score: number;
  combo: number;
  maxCombo: number;
  totalArrows: number;
  totalFreezes: number;
  accuracyCount: { Flawless: number; Marvelous: number; Great: number };
  realScore: number;
}

export type AccuracyLabel = 'Flawless' | 'Marvelous' | 'Great' | 'Bad' | 'Boo';

export interface GameConfig {
  TIMING_WINDOW: number;
  ARROW_TIME: number;
  BEAT_TIME: number;
  SPEED_MOD: number;
  BEAT_VH: number;
}
