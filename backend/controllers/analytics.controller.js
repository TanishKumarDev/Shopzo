import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Fetch total users, products, sales, and revenue
export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments(); // Count total users
  const totalProducts = await Product.countDocuments(); // Count total products

  // Aggregate total sales and total revenue from orders
  const [salesData] = await Order.aggregate([
    {
      $group: {
        _id: null, // Group all documents together
        totalSales: { $sum: 1 }, // Count of orders
        totalRevenue: { $sum: "$totalAmount" }, // Sum of totalAmount field
      },
    },
  ]);

  // Use optional chaining to safely access data
  const totalSales = salesData?.totalSales || 0;
  const totalRevenue = salesData?.totalRevenue || 0;

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

// Fetch sales and revenue data grouped by date
export const getDailySalesData = async (startDate, endDate) => {
  const dailySalesData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate, // Filter orders on or after startDate
          $lte: endDate,   // Filter orders on or before endDate
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d", // Format createdAt into date string
            date: "$createdAt",
            timezone: "+05:30",
          },
        },
        sales: { $sum: 1 }, // Count of orders per date
        revenue: { $sum: "$totalAmount" }, // Total revenue per date
      },
    },
    { $sort: { _id: 1 } }, // Sort by date ascending
  ]);

  // Fill missing dates with zero sales and revenue
  return getDatesInRange(startDate, endDate).map((date) => {
    const foundData = dailySalesData.find((item) => item._id === date);
    return {
      date,
      sales: foundData?.sales || 0,
      revenue: foundData?.revenue || 0,
    };
  });
};

// Generate array of all dates from startDate to endDate in YYYY-MM-DD format
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]); // Extract date part only
    currentDate.setDate(currentDate.getDate() + 1); // Move to next day
  }

  return dates;
}
