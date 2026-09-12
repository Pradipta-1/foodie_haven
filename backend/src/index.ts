import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import foodRoutes from './routes/foodRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import statsRoutes from './routes/statsRoutes';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stats', statsRoutes);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '✅ Foodie Haven API is running!',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health\n`);
});
