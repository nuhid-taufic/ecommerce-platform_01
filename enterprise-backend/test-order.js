const mongoose = require("mongoose");
const Order = require("./models/orderModel");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    try {
      const newOrder = new Order({
        tran_id: "TEST_ORD_" + Date.now(),
        customerEmail: "test@example.com",
        items: [{
          quantity: 1,
          price: 10
        }],
        totalAmount: 10,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
        orderStatus: "Pending",
        orderNumber: "ORD_TEST_" + Date.now(),
      });
      console.log("saving newOrder...");
      await newOrder.save();
      console.log("newOrder saved!");
    } catch (err) {
      console.error("Error:", err);
    }
    process.exit(0);
  });
