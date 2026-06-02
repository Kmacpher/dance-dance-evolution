import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { connectDb } from './db';
import Song from './db/models/Song';
import StepChart from './db/models/StepChart';
import { readSM, ParsedSM } from './smParser';

const DEFAULT_HIGH_SCORES = [
  { name: 'Complete n00b',  score: 500000 },
  { name: 'An Okay Player', score: 700000 },
  { name: 'Pretty Awesome', score: 900000 },
  { name: 'The One To Beat', score: 950000 },
];

async function seedSong(parsed: ParsedSM): Promise<void> {
  const charts = await Promise.all(
    Object.values(parsed.charts).map((chartData) =>
      StepChart.create({
        title: parsed.metadata.TITLE,
        difficulty: chartData.difficulty,
        chart: chartData.stepchart,
      })
    )
  );

  const chartsObj: Record<string, { stepChart: unknown; level: number; grooveRadar: unknown }> = {};
  charts.forEach((chart) => {
    const key = chart.difficulty;
    chartsObj[key] = {
      stepChart: chart._id,
      level: parsed.charts[key].level,
      grooveRadar: parsed.charts[key].grooveRadar,
    };
  });

  await Song.create({
    title: parsed.metadata.TITLE,
    artist: parsed.metadata.ARTIST,
    bpms: parsed.metadata.BPMS,
    stops: parsed.metadata.STOPS,
    displayBpm: parsed.metadata.DISPLAYBPM,
    offset: parsed.metadata.OFFSET,
    music: parsed.metadata.MUSIC,
    sampleStart: parsed.metadata.SAMPLESTART,
    sampleLength: parsed.metadata.SAMPLELENGTH,
    banner: parsed.metadata.BANNER,
    background: parsed.metadata.BACKGROUND,
    Charts: chartsObj,
    highScores: DEFAULT_HIGH_SCORES,
  });

  console.log(`  ✓ ${parsed.metadata.TITLE}`);
}

async function seedSongs(): Promise<void> {
  const smDir = path.join(process.cwd(), 'browser', 'sm');
  const files = fs.readdirSync(smDir).filter((f) => f !== '.DS_Store' && f.endsWith('.sm'));

  if (files.length === 0) {
    console.log('No .sm files found in browser/sm/ — skipping song seed.');
    return;
  }

  for (const file of files) {
    try {
      const parsed = readSM(file);
      await seedSong(parsed);
    } catch (err) {
      console.warn(`  ✗ ${file}: ${(err as Error).message}`);
    }
  }
}

async function main() {
  await connectDb();

  console.log('Clearing existing data...');
  await Promise.all([
    Song.deleteMany({}),
    StepChart.deleteMany({}),
  ]);

  console.log('\nSeeding songs...');
  await seedSongs();
  console.log('Songs seeded successfully!\n');

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
