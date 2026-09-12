import express from 'express';
import { register, login, getMe, updateProfile, getAllUsers } from '../controllers/authController';
import { protect, optionalProtect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', optionalProtect, getAllUsers);

export default router;

