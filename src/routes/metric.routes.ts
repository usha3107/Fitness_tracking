
import { Router } from 'express';
import { logMetric } from '../controllers/metric.controller';

const router = Router();

router.post('/:memberId/metrics', logMetric);

export default router;
