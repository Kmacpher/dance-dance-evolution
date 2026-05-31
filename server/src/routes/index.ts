import { Router } from 'express';
import songsRouter from './songs';
import stepChartsRouter from './stepCharts';

const router = Router();

router.use('/songs', songsRouter);
router.use('/stepCharts', stepChartsRouter);

export default router;
