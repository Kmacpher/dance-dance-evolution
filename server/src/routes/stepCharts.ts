import { Router, Request, Response, NextFunction } from 'express';
import StepChart from '../db/models/StepChart';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const charts = await StepChart.find({});
    res.json(charts);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chart = await StepChart.findById(req.params.id);
    if (!chart) return res.status(404).json({ error: 'Not found' });
    res.json(chart);
  } catch (err) {
    next(err);
  }
});

export default router;
