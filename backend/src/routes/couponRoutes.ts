import express from 'express';
import { verifyCoupon, getCoupons } from '../controllers/couponController';

const router = express.Router();

router.get('/', getCoupons);
router.post('/verify', verifyCoupon);

export default router;
