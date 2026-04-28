const mongoose = require("mongoose");
const Order = require("./models/orderModel");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(3);
    console.log("Recent Orders:");
    orders.forEach(o => console.log(o.orderNumber, o.totalAmount, o.paymentMethod));
    process.exit(0);
  });
