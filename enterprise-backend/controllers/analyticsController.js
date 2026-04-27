const Order = require("../models/orderModel");
const Product = require("../models/Product");
const User = require("../models/User");

const getDashboardAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ orderStatus: "Delivered" });
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });

    const categoryData = await Product.aggregate([
      { $group: { _id: "$category", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
    ]);

    const monthlySalesRaw = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlySales = monthlySalesRaw.map((item) => ({
      name: monthNames[item._id.month - 1],
      revenue: item.revenue,
      orders: item.orders,
    }));

    res.status(200).json({
      success: true,
      stats: { totalRevenue, totalOrders, totalProducts, totalCustomers },
      categoryData,
      monthlySales,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = { getDashboardAnalytics };
