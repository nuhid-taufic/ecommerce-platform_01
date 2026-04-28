const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    tran_id: {
      type: String,
      required: true,
      unique: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerEmail: {
      type: String,
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: String,
      },
    ],
    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, default: "COD" }, // COD, SSL
    paymentStatus: { type: String, default: "Pending" },
    orderStatus: { type: String, default: "Pending" }, // Pending, Processing, Shipped, Delivered, Cancelled
    
    courierName: { type: String }, // For 'Shipped' stage
    
    shippingInfo: {
      name: String,
      phone: String,
      addressLine: String,
      district: String,
      thana: String,
      postalCode: String,
    },

    orderNote: { type: String },
    transactionId: { type: String },

    trackingHistory: [
      {
        location: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
