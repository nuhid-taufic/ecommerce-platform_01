const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    stripeSessionId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },

    paymentStatus: { type: String, default: "Paid" },
    orderStatus: { type: String, default: "Processing" }, // Processing, Delivered, Cancelled
    refundMessage: { type: String },

    trackingHistory: [
      {
        location: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    customerEmail: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
