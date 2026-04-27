const Order = require("../models/orderModel");
const Product = require("../models/Product");

const getUserOrders = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ customerEmail: email }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { location, message, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.trackingHistory.push({ location, message });

    if (status) {
      order.deliveryStatus = status;
    }

    await order.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Tracking updated successfully!",
        order,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, courierName } = req.body;

    const updateData = { orderStatus };
    if (courierName) {
      updateData.courierName = courierName;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).populate("items.product");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // If marked as Delivered, increment totalSold for each product
    if (orderStatus === "Delivered") {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product._id, {
            $inc: { totalSold: item.quantity },
          });
        }
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Status updated successfully", order });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getUserOrders,
  getAllOrders,
  updateOrderTracking,
  updateOrderStatus,
};
