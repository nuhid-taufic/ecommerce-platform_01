const User = require("../models/User");
const Order = require("../models/orderModel");

const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    const orders = await Order.find({});

    const customerStats = customers.map((customer) => {
      const customerOrders = orders.filter(
        (o) => o.customerEmail === customer.email,
      );
      const totalOrders = customerOrders.length;
      const totalSpent = customerOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );

      return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile || "N/A",
        totalOrders,
        totalSpent,
      };
    });

    res.status(200).json({ success: true, customers: customerStats });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });

    const orders = await Order.find({ customerEmail: customer.email });

    const currentOrders = [];
    const previousOrders = [];
    const productCount = {};

    orders.forEach((order) => {
      const mappedOrder = {
        _id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt.toISOString().split("T")[0],
        status: order.orderStatus || "Processing",
        total: order.totalAmount,
        products: order.items.map((p) => p.name),
        refundMsg: order.refundMessage || "",
      };

      if (
        mappedOrder.status === "Delivered" ||
        mappedOrder.status === "Cancelled"
      ) {
        previousOrders.push(mappedOrder);
      } else {
        currentOrders.push(mappedOrder);
      }

      order.items.forEach((p) => {
        if (productCount[p.name]) {
          productCount[p.name] += p.quantity;
        } else {
          productCount[p.name] = p.quantity;
        }
      });
    });

    const topProducts = Object.keys(productCount)
      .map((name) => ({ name, count: productCount[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      details: {
        registrationDate: customer.createdAt.toISOString().split("T")[0],
        customer: {
          ...customer.toObject(),
          password: null,
        },
        currentOrders,
        previousOrders,
        topProducts,
        stats: {
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
          avgOrderValue: orders.length > 0 ? (orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length).toFixed(2) : 0,
        }
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { refundMsg } = req.body;
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.orderStatus = "Cancelled";
    order.paymentStatus = "Refunded";
    order.refundMessage = refundMsg;

    order.trackingHistory.push({
      location: "System / Admin",
      message: `Order Cancelled. Refund instructions: ${refundMsg}`,
    });

    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = { getCustomers, getCustomerDetails, cancelOrder };
