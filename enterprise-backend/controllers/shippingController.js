const Order = require("../models/orderModel");

const getShipments = async (req, res) => {
  try {
    const shipments = await Order.find({ orderStatus: { $ne: "Cancelled" } })
      .populate("products.productId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, shipments });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateShipment = async (req, res) => {
  try {
    const { orderStatus, courierName, trackingId, locationMessage } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.orderStatus = orderStatus; // Status Update (e.g. In Transit)

    order.trackingHistory.push({
      location: courierName || "Central Hub",
      message: trackingId
        ? `Tracking ID: ${trackingId} - ${locationMessage}`
        : locationMessage,
    });

    await order.save();
    res
      .status(200)
      .json({ success: true, message: "Shipment updated successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = { getShipments, updateShipment };
