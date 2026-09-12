import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';

// @desc    Verify and apply a coupon
// @route   POST /api/coupons/verify
// @access  Public
export const verifyCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required' });
      return;
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
      return;
    }

    if (orderAmount < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`,
      });
      return;
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: discount,
        description: coupon.description,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
