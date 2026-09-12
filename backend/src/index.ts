import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
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

// CORS Configuration for Render / Production / Localhost
const rawClientUrls = process.env.CLIENT_URL || '';
const clientOrigins = rawClientUrls
  ? rawClientUrls.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : [];

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
];

const allowedOrigins = [...new Set([...clientOrigins, ...defaultOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stats', statsRoutes);

// Health check route (used by Render health checks & frontend online detection)
app.get('/api/health', (_req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    message: '✅ Foodie Haven API is running!',
    database: isDbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Root API welcome endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'Foodie Haven Restaurant API',
    version: '1.0.0',
    status: 'online',
    docs: {
      health: '/api/health',
      food: '/api/food',
      auth: '/api/auth',
      orders: '/api/orders',
      coupons: '/api/coupons',
      stats: '/api/stats',
    },
  });
});

// Serve frontend static assets if built dist exists (Single Fullstack Service deployment on Render)
const frontendDistPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // SPA fallback: any non-API route serves the frontend index.html
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

// 404 handler for unmatched API requests
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

