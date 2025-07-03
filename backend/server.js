import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

// Load environment variables
dotenv.config();

// Create an Express app
const app = express();

// Define the port
const PORT = process.env.PORT || 3000;

// Routes
app.use('/api/auth', authRoutes);

// Define a simple route
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
})