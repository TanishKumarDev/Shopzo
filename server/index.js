import express from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/database.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

connectDB();

// Using routes
app.use('/api', userRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});