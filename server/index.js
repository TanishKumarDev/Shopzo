import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); // 👈 Must be at the top
import connectDB from './utils/database.js';
import userRoutes from './routes/user.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

connectDB();

// Using routes
app.use('/api', userRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});