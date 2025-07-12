import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware: Protect Private Routes (Login Required)
export const protectRoute = async (req, res, next) => {
  try {
    // 1. Extract token from cookies
    const accessToken = req.cookies.accessToken;

    // 2. If token not found → Unauthorized
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized - No access token" });
    }

    // 3. Verify the token using secret key
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // 4. Find user in DB using ID from token payload (ignore password field)
    const user = await User.findById(decoded.userId).select("-password");

    // 5. If user doesn't exist anymore
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 6. Attach user to req for use in controllers
    req.user = user;

    // 7. Continue to next middleware
    next();
  } catch (error) {
    console.error("protectRoute error:", error.message);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

// Middleware: Only Allow Admins
export const adminRoute = (req, res, next) => {
  // Check if user exists and has admin role
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden - Admin only" });
  }
};

