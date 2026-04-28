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

const createManualOrder = async (req, res) => {
  try {
    const { customerEmail, items, shippingInfo, paymentMethod, orderNote } = req.body;

    // Basic validation
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided" });
    }
    if (!shippingInfo || !shippingInfo.phone || !shippingInfo.name) {
      return res.status(400).json({ success: false, message: "Customer name and phone are required" });
    }

    // Calculate total amount
    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Generate unique transaction and order IDs
    const tran_id = `MANUAL-${Date.now()}`;
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = new Order({
      tran_id,
      orderNumber,
      customerEmail,
      items,
      totalAmount,
      shippingInfo,
      paymentMethod: paymentMethod || "Manual",
      paymentStatus: "Paid", // Assuming manual orders are already paid or handled offline
      orderStatus: "Processing", // Start at processing for manual orders
      orderNote,
    });

    await newOrder.save();

    // Reduce stock for each product
    for (const item of items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    res.status(201).json({ success: true, message: "Manual order created", order: newOrder });
  } catch (error) {
    console.error("Manual Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserOrders,
  getAllOrders,
  updateOrderTracking,
  updateOrderStatus,
  createManualOrder,
};
