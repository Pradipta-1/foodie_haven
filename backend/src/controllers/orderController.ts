import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public / Optional Auth
export const createOrder = async (req: any, res: Response): Promise<void> => {
  try {
    const {
      orderNumber: clientOrderNumber,
      items,
      subtotal,
      deliveryFee,
      tax,
      discount,
      couponApplied,
      grandTotal,
      deliveryAddress,
      deliveryType = 'standard',
      paymentMethod = 'cod',
      paymentStatus,
      estimatedDeliveryTime,
      userId: clientUserId,
      customer: clientCustomer,
    } = req.body;

    const orderNumber = clientOrderNumber || generateOrderNumber();

    // 1. Resolve Customer info & MongoDB User
    let userId = req.user?._id;
    let customerFullName = req.user?.fullName || clientCustomer?.fullName || deliveryAddress?.fullName || 'Valued Customer';
    let customerEmail = req.user?.email || clientCustomer?.email || deliveryAddress?.email || 'customer@example.com';
    let customerPhone = req.user?.phone || clientCustomer?.phone || deliveryAddress?.phone || '+91 98765 00000';

    // If no authenticated user, check if user exists with this email or auto-create in MongoDB users collection
    if (!userId && customerEmail) {
      try {
        let existingUser = await User.findOne({ email: customerEmail.toLowerCase() });
        if (!existingUser) {
          // Auto-create customer in MongoDB Atlas users collection so user section is populated!
          existingUser = await User.create({
            fullName: customerFullName,
            email: customerEmail.toLowerCase(),
            phone: customerPhone,
            password: 'Customer123!',
            role: 'customer',
          });
        }
        userId = existingUser._id;
      } catch (userErr) {
        // Fallback to client user id or null if DB user creation fails
        userId = clientUserId || null;
      }
    }

    const order = await Order.create({
      orderNumber,
      userId,
      customer: {
        fullName: customerFullName,
        email: customerEmail,
        phone: customerPhone,
      },
      items: items || [],
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      tax: Number(tax) || 0,
      discount: Number(discount) || 0,
      couponApplied,
      grandTotal: Number(grandTotal) || 0,
      deliveryAddress: deliveryAddress || {},
      deliveryType,
      paymentMethod,
      paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'Pending' : 'Paid'),
      estimatedDeliveryTime:
        estimatedDeliveryTime ||
        (deliveryType === 'express' ? '15-25 mins' : deliveryType === 'pickup' ? '10-15 mins' : '30-45 mins'),
      status: 'Order Placed',
      statusTimestamps: {
        placed: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Error creating order in MongoDB:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Public / Optional Auth
export const getUserOrders = async (req: any, res: Response): Promise<void> => {
  try {
    const email = (req.query.email || req.user?.email || '').trim().toLowerCase();
    const userId = req.user?._id || req.query.userId;

    // If neither email nor userId provided, return empty list for customer privacy (unless admin)
    if (!email && !userId) {
      if (req.user?.role === 'admin') {
        const allOrders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: allOrders.length, data: allOrders });
        return;
      }
      res.status(200).json({ success: true, count: 0, data: [] });
      return;
    }

    const conditions: any[] = [];
    if (userId) {
      conditions.push({ userId });
    }
    if (email) {
      const emailRegex = new RegExp(`^${email}$`, 'i');
      conditions.push({ 'customer.email': emailRegex });
      conditions.push({ 'deliveryAddress.email': emailRegex });
    }

    const orders = await Order.find({ $or: conditions }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public / Optional Auth
export const getOrderById = async (req: any, res: Response): Promise<void> => {
  try {
    const param = String(req.params.id);
    let order = null;
    
    // Check by MongoDB _id or orderNumber
    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(param);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: param });
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin / General)
// @route   GET /api/orders
// @access  Public / Admin
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Public / Admin
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const param = String(req.params.id);

    let order = null;
    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(param);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: param });
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    order.status = status;
    const now = new Date();

    if (!order.statusTimestamps) {
      order.statusTimestamps = { placed: order.createdAt || now };
    }

    if (status === 'Confirmed') order.statusTimestamps.confirmed = now;
    if (status === 'Preparing') order.statusTimestamps.preparing = now;
    if (status === 'Out for Delivery') order.statusTimestamps.outForDelivery = now;
    if (status === 'Delivered') {
      order.statusTimestamps.delivered = now;
      order.paymentStatus = 'Paid';
    }
    if (status === 'Cancelled') order.statusTimestamps.cancelled = now;

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Public / Private
export const cancelOrder = async (req: any, res: Response): Promise<void> => {
  try {
    const param = String(req.params.id);
    let order = null;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(param);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: param });
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.status === 'Delivered' || order.status === 'Out for Delivery') {
      res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
      return;
    }

    order.status = 'Cancelled';
    if (!order.statusTimestamps) {
      order.statusTimestamps = { placed: order.createdAt || new Date() };
    }
    order.statusTimestamps.cancelled = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


