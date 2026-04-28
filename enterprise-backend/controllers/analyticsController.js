const Order = require("../models/orderModel");
const Product = require("../models/Product");
const User = require("../models/User");
const VisitorLog = require("../models/VisitorLog");

const trackVisit = async (req, res) => {
  try {
    const { identifier, deviceType, platform } = req.body;
    const today = new Date().toISOString().split("T")[0];

    let log = await VisitorLog.findOne({ date: today });

    if (!log) {
      log = new VisitorLog({ date: today, uniqueVisitors: [], totalVisits: 0 });
    }

    log.totalVisits += 1;

    if (identifier && !log.uniqueVisitors.includes(identifier)) {
      log.uniqueVisitors.push(identifier);
    }

    // Update device stats
    if (deviceType) {
      log.devices[deviceType] = (log.devices[deviceType] || 0) + 1;
    }
    
    // Update platform stats
    if (platform) {
      log.platforms[platform] = (log.platforms[platform] || 0) + 1;
    }

    await log.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Traffic Logging Error:", error);
    res.status(500).json({ success: false });
  }
};

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

    // Traffic Analytics
    const trafficLogs = await VisitorLog.find().sort({ date: -1 }).limit(30);
    
    const lifetimeTraffic = await VisitorLog.aggregate([
      { $group: { _id: null, totalVisits: { $sum: "$totalVisits" }, totalUnique: { $sum: { $size: "$uniqueVisitors" } } } }
    ]);

    const dailyTraffic = trafficLogs.slice(0, 7).map(log => ({
      date: log.date,
      visits: log.totalVisits,
      unique: log.uniqueVisitors.length
    })).reverse();

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

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySales = monthlySalesRaw.map((item) => ({
      name: monthNames[item._id.month - 1],
      revenue: item.revenue,
      orders: item.orders,
    }));

    // Device & Platform Stats
    const totalVisitsCount = lifetimeTraffic[0]?.totalVisits || 1;
    const deviceStats = await VisitorLog.aggregate([
      { $group: { _id: null, mobile: { $sum: "$devices.mobile" }, desktop: { $sum: "$devices.desktop" }, tablet: { $sum: "$devices.tablet" } } }
    ]);
    const platformStats = await VisitorLog.aggregate([
      { $group: { _id: null, direct: { $sum: "$platforms.direct" }, social: { $sum: "$platforms.social" }, search: { $sum: "$platforms.search" } } }
    ]);

    const getPercent = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: { 
        totalRevenue, 
        totalOrders, 
        totalProducts, 
        totalCustomers,
        totalVisits: lifetimeTraffic[0]?.totalVisits || 0,
        uniqueVisitors: lifetimeTraffic[0]?.totalUnique || 0
      },
      trafficData: {
        daily: dailyTraffic,
        all: trafficLogs,
        devices: {
          desktop: getPercent(deviceStats[0]?.desktop || 0, totalVisitsCount),
          mobile: getPercent(deviceStats[0]?.mobile || 0, totalVisitsCount),
          tablet: getPercent(deviceStats[0]?.tablet || 0, totalVisitsCount),
        },
        platforms: {
          direct: getPercent(platformStats[0]?.direct || 0, totalVisitsCount),
          social: getPercent(platformStats[0]?.social || 0, totalVisitsCount),
          search: getPercent(platformStats[0]?.search || 0, totalVisitsCount),
        }
      },
      categoryData,
      monthlySales,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = { getDashboardAnalytics, trackVisit };
