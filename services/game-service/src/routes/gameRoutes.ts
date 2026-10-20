import { Router } from 'express';
import { listGames, getGameById, createGame, incrementPlayCount } from '../controllers/gameController.js';

const router = Router();

router.get('/', listGames);
router.post('/', createGame);
router.get('/:id', getGameById);
router.post('/:id/play', incrementPlayCount);

export default router;
