import express from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import {
  getAnalyticsData,
  getDailySalesData,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, async (req, res) => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Include full current day

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // Last 7 days including today
    startDate.setHours(0, 0, 0, 0); // Start of day in IST range

    const analyticsData = await getAnalyticsData();
    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.json({
      analyticsData,
      dailySalesData,
    });
  } catch (error) {
    console.log("Error in analytics route", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;
