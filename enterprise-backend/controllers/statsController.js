const Order = require("../models/orderModel"); // Apnar order model er thik nam diben
const User = require("../models/User");
const Product = require("../models/Product");

const getDashboardStats = async (req, res) => {
  try {
    // --- Lifetime Stats ---
    const totalOrders = await Order.countDocuments({ orderStatus: "Delivered" });
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // --- Chart Data (Last 6 Months) ---
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      chartData.push({
        name: d.toLocaleString("en-US", { month: "short" }),
        total: 0,
        monthNum: d.getMonth(),
      });
    }

    const allOrders = await Order.find({ orderStatus: "Delivered" }, "totalAmount createdAt");
    allOrders.forEach((order) => {
      const orderMonth = new Date(order.createdAt).getMonth();
      const index = chartData.findIndex((c) => c.monthNum === orderMonth);
      if (index !== -1) {
        chartData[index].total += order.totalAmount;
      }
    });

    const finalChartData = chartData.map((c) => ({
      name: c.name,
      total: c.total,
    }));

    // --- NEW: Last 7 Days Stats ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Last 7 days orders & revenue
    const recentOrders = await Order.find({
      orderStatus: "Delivered",
      createdAt: { $gte: sevenDaysAgo },
    });
    const last7DaysOrders = recentOrders.length;
    const last7DaysRevenue = recentOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // 2. New customers in last 7 days
    const newCustomers7Days = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: sevenDaysAgo },
    });

    // 3. Top 10 Trending Products
    const topProductsResult = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $unwind: "$items" }, // Changed from products to items to match new model
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalSold: -1 } }, // Beshi theke kom e sajano
      { $limit: 10 }, // Sudhu Top 10 ta nibe
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        chartData: finalChartData,
        // Notun data gulo frontend e pathano hocche
        last7DaysOrders,
        last7DaysRevenue,
        newCustomers7Days,
        topProducts: topProductsResult,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
