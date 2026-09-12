import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { FoodItem } from '../models/FoodItem';
import { User } from '../models/User';

// @desc    Get admin statistics and analytics
// @route   GET /api/stats
// @access  Private/Admin
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({
      status: { $in: ['Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery'] },
    });
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });
    const totalDishes = await FoodItem.countDocuments();
    const availableDishes = await FoodItem.countDocuments({ isAvailable: true });
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Total Revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Today's Orders
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrdersCount = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

    // Recent 5 orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        activeOrders,
        completedOrders,
        todayOrdersCount,
        totalDishes,
        availableDishes,
        totalCustomers,
        recentOrders,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
