import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  userId?: any;
  customer?: {
    fullName: string;
    email: string;
    phone: string;
  };
  items: any[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  couponApplied?: any;
  grandTotal: number;
  status: 'Order Placed' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliveryAddress?: any;
  deliveryType: 'standard' | 'express' | 'pickup';
  paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  estimatedDeliveryTime: string;
  statusTimestamps: {
    placed: Date;
    confirmed?: Date;
    preparing?: Date;
    outForDelivery?: Date;
    delivered?: Date;
    cancelled?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.Mixed,
      ref: 'User',
      required: false,
    },
    customer: {
      fullName: String,
      email: String,
      phone: String,
    },
    items: [Schema.Types.Mixed],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponApplied: Schema.Types.Mixed,
    grandTotal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Placed',
    },
    deliveryAddress: {
      type: Schema.Types.Mixed,
      required: false,
    },
    deliveryType: {
      type: String,
      enum: ['standard', 'express', 'pickup'],
      default: 'standard',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'card', 'netbanking'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed'],
      default: 'Pending',
    },
    estimatedDeliveryTime: {
      type: String,
      default: '30-45 mins',
    },
    statusTimestamps: {
      placed: { type: Date, default: Date.now },
      confirmed: Date,
      preparing: Date,
      outForDelivery: Date,
      delivered: Date,
      cancelled: Date,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
