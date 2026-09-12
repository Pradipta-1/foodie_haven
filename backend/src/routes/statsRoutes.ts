import express from 'express';
import { getAdminStats } from '../controllers/statsController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, adminOnly, getAdminStats);

export default router;
