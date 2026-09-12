import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CartItem, FoodItem, SelectedCustomization, CartItemAddOn, Coupon } from '../types';
import { MOCK_COUPONS } from '../data/mockData';
import { calculateCartItemPrice } from '../lib/utils';
import { useToast } from './ToastContext';

interface AddToCartOptions {
  foodItem: FoodItem;
  quantity?: number;
  customizations?: SelectedCustomization[];
  addOns?: CartItemAddOn[];
  specialInstructions?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (options: AddToCartOptions) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('foodie_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('foodie_coupon');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { showSuccess, showWarning, showError } = useToast();

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('foodie_cart', JSON.stringify(cart));
  }, [cart]);

  // Save coupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('foodie_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('foodie_coupon');
    }
  }, [appliedCoupon]);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);
  const toggleCartDrawer = () => setIsCartDrawerOpen((prev) => !prev);

  // Helper to generate a unique key for an item with specific options
  const generateCartItemId = (
    foodId: string,
    customizations: SelectedCustomization[] = [],
    addOns: CartItemAddOn[] = []
  ): string => {
    const sortedCust = [...customizations].sort((a, b) => a.optionId.localeCompare(b.optionId));
    const sortedAdd = [...addOns].sort((a, b) => a.id.localeCompare(b.id));
    const custKey = sortedCust.map((c) => `${c.groupId}:${c.optionId}`).join('|');
    const addKey = sortedAdd.map((a) => a.id).join('|');
    return `${foodId}-${custKey}-${addKey}`;
  };

  const addToCart = ({
    foodItem,
    quantity = 1,
    customizations = [],
    addOns = [],
    specialInstructions = '',
  }: AddToCartOptions) => {
    if (foodItem.isAvailable === false) {
      showWarning(`"${foodItem.name}" is currently out of stock.`);
      return;
    }

    const cartItemId = generateCartItemId(foodItem.id, customizations, addOns);

    const customizationsTotal = customizations.reduce((sum, c) => sum + c.price, 0);
    const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = foodItem.price + customizationsTotal + addOnsTotal;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === cartItemId);

      if (existingItemIndex > -1) {
        // Item already in cart with same options, update quantity
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: unitPrice * newQuantity,
          specialInstructions: specialInstructions || existingItem.specialInstructions,
        };
        return updatedCart;
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: cartItemId,
          foodItem,
          quantity,
          selectedCustomizations: customizations,
          selectedAddOns: addOns,
          specialInstructions,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
        return [...prevCart, newItem];
      }
    });

    showSuccess(`Added ${foodItem.name} to cart!`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.id === cartItemId);
      if (item) {
        showWarning(`Removed ${item.foodItem.name} from cart`);
      }
      return prevCart.filter((item) => item.id !== cartItemId);
    });
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const itemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  }, [cart]);

  // Delivery fee: Free over $40, otherwise $3.99
  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (appliedCoupon?.code === 'FREESHIP' && subtotal >= appliedCoupon.minOrderAmount) return 0;
    return subtotal >= 400 ? 0 : 39;
  }, [subtotal, appliedCoupon]);

  // Tax: 8% estimated standard restaurant tax
  const tax = useMemo(() => {
    return Number((subtotal * 0.08).toFixed(2));
  }, [subtotal]);

  // Discount calculation
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minOrderAmount) return 0;

    let calculatedDiscount = 0;
    if (appliedCoupon.discountType === 'percentage') {
      calculatedDiscount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && calculatedDiscount > appliedCoupon.maxDiscount) {
        calculatedDiscount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountType === 'fixed') {
      calculatedDiscount = appliedCoupon.discountValue;
    }

    return Math.min(calculatedDiscount, subtotal);
  }, [subtotal, appliedCoupon]);

  const grandTotal = useMemo(() => {
    if (subtotal === 0) return 0;
    const total = subtotal + deliveryFee + tax - discount;
    return Math.max(0, Number(total.toFixed(2)));
  }, [subtotal, deliveryFee, tax, discount]);

  // Coupon handling
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = MOCK_COUPONS.find((c) => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      showError('Invalid coupon code. Try WELCOME50 or SAVE15');
      return { success: false, message: 'Invalid coupon code' };
    }

    if (subtotal < coupon.minOrderAmount) {
      const msg = `Minimum order value of ₹${coupon.minOrderAmount} required for this coupon`;
      showWarning(msg);
      return { success: false, message: msg };
    }

    setAppliedCoupon(coupon);
    showSuccess(`Coupon ${coupon.code} applied successfully!`);
    return { success: true, message: 'Coupon applied successfully' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showWarning('Coupon removed');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        deliveryFee,
        tax,
        grandTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        toggleCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
