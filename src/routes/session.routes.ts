
import { Router } from 'express';
import { addExercise } from '../controllers/session.controller';

const router = Router();

router.post('/:sessionId/exercises', addExercise);

export default router;
