import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodie_haven';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Automatically remove any duplicate food items in database
    try {
      const { FoodItem } = await import('../models/FoodItem');
      const allFoods = await FoodItem.find({});
      const seenNames = new Set<string>();
      for (const food of allFoods) {
        const norm = food.name.toLowerCase().trim();
        if (seenNames.has(norm)) {
          console.log(`🧹 Removing duplicate food item from DB: "${food.name}" (${food._id})`);
          await FoodItem.findByIdAndDelete(food._id);
        } else {
          seenNames.add(norm);
        }
      }
    } catch (cleanErr) {}
  } catch (error: any) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.warn('💡 Tip: For Render hosting, make sure MONGODB_URI is set in Render Environment Variables with your MongoDB Atlas connection string (and Network Access 0.0.0.0/0 allowed).');
    } else {
      console.log('ℹ️ Server will continue running (ensure local MongoDB is running or configure MONGODB_URI in .env).');
    }
  }
};

