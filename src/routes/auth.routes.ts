import { Router } from 'express';
import {
    register,
    login,
    logout,
    getMe,
    getSession,
} from '../controllers/auth.controller';
import { isAuthenticated, isGuest } from '../middleware/auth';

const router = Router();

router.post('/register', isGuest, register);
router.post('/login', isGuest, login);
router.post('/logout', isAuthenticated, logout);

router.get('/', getSession);
router.get('/me', getMe);

export default router;