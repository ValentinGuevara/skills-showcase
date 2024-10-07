import { Router } from 'express';
import { startNew, suggestSolution } from '../controllers/guesserController';

const router = Router();

router.put('/startNew', startNew);
router.post('/suggestSolution', suggestSolution);

export default router;