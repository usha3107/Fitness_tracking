
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import gymRouter from './routes/gym.routes';
import memberRouter from './routes/member.routes';
import trainerRouter from './routes/trainer.routes';
import sessionRouter from './routes/session.routes';
import metricRouter from './routes/metric.routes';

const app = express();

app.use(express.json());

app.use('/api/gyms', gymRouter);
app.use('/api/members', memberRouter); // includes /:memberId/enrollments, /:memberId/metrics
app.use('/api/trainers', trainerRouter);
app.use('/api/sessions', sessionRouter);
// Metrics is under members: /api/members/:memberId/metrics.
// Logic: memberRouter currently handles `/:memberId/enrollments`.
// I should add `/:memberId/metrics` to memberRouter!
// I created `metric.routes.ts` which uses `/:memberId/metrics`.
// If I use `app.use('/api/members', metricRouter)`, it will match `/:memberId/metrics`.
// But memberRouter uses `/:memberId/enrollments`.
// I can merge them or use them sequentially.
// Express allows multiple routers on same path.
app.use('/api/members', metricRouter); // This works alongside memberRouter


app.use(errorHandler);

export default app;
