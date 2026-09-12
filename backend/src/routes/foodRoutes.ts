import express from 'express';
import {
  getAllFoodItems,
  getFoodItem,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  toggleAvailability,
} from '../controllers/foodController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllFoodItems);
router.get('/:id', getFoodItem);
router.post('/', protect, adminOnly, createFoodItem);
router.put('/:id', protect, adminOnly, updateFoodItem);
router.delete('/:id', protect, adminOnly, deleteFoodItem);
router.patch('/:id/availability', protect, adminOnly, toggleAvailability);

export default router;
