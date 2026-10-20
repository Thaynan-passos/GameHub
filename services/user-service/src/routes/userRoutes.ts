import { Router } from 'express';
import { register, login, getProfile, listUsers } from '../controllers/userController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', listUsers);
router.get('/:id', getProfile);

export default router;
