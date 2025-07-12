import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";

// Middleware: Protect Route (Login Required)
// Checks accessToken in cookies → verifies JWT → fetches user
// Used to protect routes like /api/cart, /api/orders, etc.
export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized - No access token" });
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("protectRoute error:", error.message);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

// Utility: Generate Access & Refresh Tokens
// Creates both accessToken (15m) and refreshToken (7d)
// accessToken: Short-lived (15m)
// refreshToken: Long-lived (7d) to re-authenticate silently
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Utility: Save Refresh Token in DB
// Saves refresh token to DB (for logout and validation)
// Helps in: Invalidating token on logout, Validating token during refresh
const storeRefreshToken = async (userId, refreshToken) => {
  await RefreshToken.create({ user: userId, token: refreshToken });
};

// Utility: Set Access & Refresh Tokens as HTTP-only Cookies
// Sends both tokens as HTTP-only secure cookies
// httpOnly + secure + sameSite = Prevents token theft from JS
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Controller: Signup a New User
// Checks if user exists → creates new user → generates & stores tokens → sends response
export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Controller: Login User
// Checks credentials → generates tokens → stores refresh → sets cookies
// Both login and signup reuse the same token logic
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const isPasswordCorrect = user && (await user.comparePassword(password));

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Controller: Logout User
// Deletes refresh token from DB → clears both cookies
// You can’t just clear the frontend cookie — you also need to remove the token from DB so it can't be reused.
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller: Refresh Access Token using Refresh Token
// Validates refresh token → issues new access token → sends it
// Called silently when accessToken expires
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller: Get Authenticated User Profile
// Returns req.user set by protectRoute
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

