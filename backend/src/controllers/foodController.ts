import { Request, Response } from 'express';
import { FoodItem } from '../models/FoodItem';

// @desc    Get all food items
// @route   GET /api/food
// @access  Public
export const getAllFoodItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isVeg, available, search, sort } = req.query;

    let query: any = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by vegetarian
    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }

    // Filter by availability
    if (available === 'true') {
      query.isAvailable = true;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let foodQuery = FoodItem.find(query);

    // Sort
    if (sort === 'price-asc') {
      foodQuery = foodQuery.sort({ price: 1 });
    } else if (sort === 'price-desc') {
      foodQuery = foodQuery.sort({ price: -1 });
    } else if (sort === 'rating') {
      foodQuery = foodQuery.sort({ rating: -1 });
    } else {
      foodQuery = foodQuery.sort({ ratingCount: -1 }); // Popular
    }

    const foodItems = await foodQuery;

    res.status(200).json({
      success: true,
      count: foodItems.length,
      data: foodItems,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single food item
// @route   GET /api/food/:id
// @access  Public
export const getFoodItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      res.status(404).json({ success: false, message: 'Food item not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: foodItem,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create food item (Admin only)
// @route   POST /api/food
// @access  Private/Admin
export const createFoodItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const foodItem = await FoodItem.create(req.body);

    res.status(201).json({
      success: true,
      data: foodItem,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update food item (Admin only)
// @route   PUT /api/food/:id
// @access  Private/Admin
export const updateFoodItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const foodItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!foodItem) {
      res.status(404).json({ success: false, message: 'Food item not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: foodItem,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete food item (Admin only)
// @route   DELETE /api/food/:id
// @access  Private/Admin
export const deleteFoodItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);

    if (!foodItem) {
      res.status(404).json({ success: false, message: 'Food item not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle food item availability (Admin only)
// @route   PATCH /api/food/:id/availability
// @access  Private/Admin
export const toggleAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      res.status(404).json({ success: false, message: 'Food item not found' });
      return;
    }

    foodItem.isAvailable = !foodItem.isAvailable;
    await foodItem.save();

    res.status(200).json({
      success: true,
      data: foodItem,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
