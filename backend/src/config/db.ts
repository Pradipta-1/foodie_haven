import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodie_haven');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    console.log('ℹ️ Server will continue running (ensure MongoDB is started if using live DB).');
  }
};
