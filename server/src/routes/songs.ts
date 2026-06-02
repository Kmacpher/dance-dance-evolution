import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import Song from '../db/models/Song';
import StepChart from '../db/models/StepChart';
import { readSM, ParsedSM } from '../smParser';

const upload = multer({ dest: '/tmp/dde-uploads/' });
const router = Router();

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    res.json(await Song.find({}));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ error: 'Not found' });
    res.json(song);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/highScores', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const song = await Song.findById(req.params.id).select('highScores');
    if (!song) return res.status(404).json({ error: 'Not found' });
    res.json(song.highScores);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/highScores', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { highScores } = req.body as { highScores: { name: string; score: number }[] };
    await Song.updateOne({ _id: req.params.id }, { $set: { highScores } });
    res.status(201).end();
  } catch (err) {
    next(err);
  }
});

router.post(
  '/upload',
  upload.fields([
    { name: 'sm', maxCount: 1 },
    { name: 'song', maxCount: 1 },
    { name: 'bg', maxCount: 1 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;
      if (!files.sm || !files.song) {
        return res.status(400).json({ error: 'Missing sm or song file' });
      }

      const smFile = files.sm[0];
      const songFile = files.song[0];
      const bgFile = files.bg?.[0];

      const smDest = path.join(process.cwd(), 'browser', 'sm', smFile.originalname);
      const songDest = path.join(process.cwd(), 'browser', 'audio', songFile.originalname);

      await fs.copyFile(smFile.path, smDest);
      await fs.copyFile(songFile.path, songDest);
      if (bgFile) {
        const bgDest = path.join(process.cwd(), 'browser', 'img', 'background', bgFile.originalname);
        await fs.copyFile(bgFile.path, bgDest);
      }

      const parsed: ParsedSM = readSM(smFile.originalname);
      await createSongFromParsed(parsed);

      await Promise.all([
        fs.unlink(smFile.path),
        fs.unlink(songFile.path),
        bgFile ? fs.unlink(bgFile.path) : Promise.resolve(),
      ]);

      res.status(201).json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

async function createSongFromParsed(parsed: ParsedSM) {
  const charts = await Promise.all(
    Object.entries(parsed.charts).map(([, chartData]) =>
      StepChart.create({
        title: parsed.metadata.TITLE,
        difficulty: chartData.difficulty,
        chart: chartData.stepchart,
      })
    )
  );

  const chartsObj: Record<string, { stepChart: unknown; level: number; grooveRadar: unknown }> = {};
  charts.forEach((chart, i) => {
    const difficulty = Object.keys(parsed.charts)[i];
    chartsObj[difficulty] = {
      stepChart: chart._id,
      level: parsed.charts[difficulty].level,
      grooveRadar: parsed.charts[difficulty].grooveRadar,
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
  });
}

export default router;
