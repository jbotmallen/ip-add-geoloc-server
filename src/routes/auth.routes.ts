import { Router } from 'express';
import {
    register,
    login,
    logout,
    getMe,
    getSession,
} from '../controllers/auth.controller';
import { isAuthenticated, isGuest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, isGuest, register);
router.post('/login', authLimiter, isGuest, login);
router.post('/logout', isAuthenticated, logout);

router.get('/', getSession);
router.get('/me', getMe);

export default router;