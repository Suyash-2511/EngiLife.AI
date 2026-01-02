import { Router } from 'express';
import { login, signup, verifyEmail, socialLogin, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/social-login', socialLogin);
router.post('/update', authenticate as any, updateProfile as any);

export default router;