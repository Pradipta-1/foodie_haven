import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';
import { optionalProtect } from '../middleware/auth';

const router = express.Router();

router.post('/', optionalProtect, createOrder);
router.get('/my-orders', optionalProtect, getUserOrders);
router.get('/', optionalProtect, getAllOrders);
router.get('/:id', optionalProtect, getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', optionalProtect, cancelOrder);

export default router;

