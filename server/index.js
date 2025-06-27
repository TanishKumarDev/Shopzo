import express from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import cartRoutes from './routes/cart.js';
import addressRoutes from './routes/address.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Parse JSON bodies
app.use('/api', userRoutes); // Mount user routes
app.use('/api', productRoutes); // Mount product routes
app.use('/api', cartRoutes);
app.use('/api', addressRoutes);
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});