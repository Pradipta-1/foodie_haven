import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodItem extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
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
  customizations?: any[];
  addOns?: any[];
  reviews?: any[];
}

const foodItemSchema = new Schema<IFoodItem>(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: Number,
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Burgers', 'Pizza', 'Pasta', 'Biryani', 'Starters', 'Main Course', 'Desserts', 'Beverages'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isPopular: Boolean,
    isChefSpecial: Boolean,
    prepTimeMinutes: {
      type: Number,
      min: 1,
      default: 20,
    },
    calories: Number,
    ingredients: [String],
    customizations: [Schema.Types.Mixed],
    addOns: [Schema.Types.Mixed],
    reviews: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

export const FoodItem = mongoose.model<IFoodItem>('FoodItem', foodItemSchema);
