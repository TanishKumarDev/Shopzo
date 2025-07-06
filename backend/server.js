// Core Imports
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';

// Config & Database
import connectDB from './lib/db.js'
dotenv.config()

// Initialize Express App
const app = express()
const port = process.env.PORT || 3000

// Middleware Setup
app.use(express.json());         // Parse JSON payloads
app.use(cookieParser());         // Parse cookies

// Route Imports
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js';
import couponRoutes from './routes/coupon.route.js';
import paymentRoutes from './routes/payment.route.js';
import analyticsRoutes from './routes/analytics.route.js';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.send('Shopzo Backend is running');
});

// Connect to MongoDB and Start Server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
  });