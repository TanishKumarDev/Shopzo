// Core Imports
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Route Imports
import authRoute from "./routes/auth.route.js";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import couponRoute from "./routes/coupon.route.js";
import paymentRoute from "./routes/payment.route.js";
import analyticsRoute from "./routes/analytics.route.js";

// DB connection function
import connectDB from "./lib/db.js";

// Load env variables from .env
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Get absolute path to current directory(needed for serving frontned files later)
const __dirname = path.resolve();

// Security Middlewares
app.use(helmet()); // set secure headers
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
  })
)
// CPRS for Dev
const allowedOrigins = [ process.env.FRONTEND_URL || "http://localhost:3000"]; 

// Core Middlewares
app.use(express.json({ limit: "10mb" })); // Middleware to parse inccoming JSON playloads (limit to 10MB)
app.use(cookieParser()); // Middleware to parse cookies from client requests

// Route Mounted 
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/coupons", couponRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/analytics", analyticsRoute);


// Serve frontend in production
if(process.env.NODE_ENV == "production"){
  app.use(express.static(path.join(__dirname, "/frontend/dist"))); // serve the static files form frontend dist folder

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  }); // For any unknown routem server index.html(for react router support)
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.log("Global Error:",  err.stack);

  res.status(500).json({ 
    success: false,
    message: err.message || "internal server error",
   });
})

// Start the server and connect to the DB
app.listen(PORT, () => {
	console.log("✅ Server is running on http://localhost:" + PORT);
	connectDB(); // Connect to MongoDB
});

// Just for testing
app.get("/", (req, res) => {
  res.send("E-commerece backend is running");
});