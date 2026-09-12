export type FoodCategory =
  | 'All'
  | 'Burgers'
  | 'Pizza'
  | 'Pasta'
  | 'Biryani'
  | 'Starters'
  | 'Main Course'
  | 'Desserts'
  | 'Beverages';

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface CustomizationGroup {
  id: string;
  title: string;
  required: boolean;
  type: 'single' | 'multiple';
  options: CustomizationOption[];
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: FoodCategory;
  image: string;
  isVeg: boolean;
  rating: number;
  ratingCount: number;
  isAvailable: boolean;
  isPopular?: boolean;
  isChefSpecial?: boolean;
  prepTimeMinutes: number;
  calories?: number;
  ingredients: string[];
  customizations?: CustomizationGroup[];
  addOns?: AddOn[];
  reviews?: Review[];
}

export interface CartItemAddOn {
  id: string;
  name: string;
  price: number;
}

export interface SelectedCustomization {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart item instance ID (item.id + serialized options)
  foodItem: FoodItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  selectedAddOns: CartItemAddOn[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  description: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type DeliveryType = 'standard' | 'express' | 'pickup';

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking';

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  email: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  couponApplied?: Coupon;
  grandTotal: number;
  status: OrderStatus;
  deliveryAddress: DeliveryAddress;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  estimatedDeliveryTime: string;
  createdAt: string;
  statusTimestamps: {
    placed: string;
    confirmed?: string;
    preparing?: string;
    outForDelivery?: string;
    delivered?: string;
    cancelled?: string;
  };
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'customer' | 'admin';
  savedAddresses?: DeliveryAddress[];
  createdAt: string;
}

export interface DealOffer {
  id: string;
  title: string;
  subtitle: string;
  discountCode: string;
  discountBadge: string;
  image: string;
  bgGradient: string;
}
