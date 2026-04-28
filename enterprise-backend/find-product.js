const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const p = await Product.findOne({ name: "JHF Soap" });
    if (!p) {
        console.log("No product found!");
        process.exit(0);
    }
    
    console.log("Product:", p._id);
    const fetch = require('node-fetch');
    console.log("Starting fetch...");
    const start = Date.now();
    try {
      const res = await fetch("http://localhost:5003/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: [{ _id: p._id, name: p.name, price: p.price, quantity: 1, image: p.images[0] }],
          customerEmail: "yousuf@example.com",
          shippingInfo: {
            name: "Md. Yousuf",
            phone: "01980837814",
            division: "Rajshahi",
            district: "Rajshahi",
            street: "Talaimari",
            label: "Shipping"
          },
          allAddresses: [],
          paymentMethod: "Cash on Delivery",
          totalAmount: 25,
          orderNote: "",
          transactionId: undefined
        })
      });
      console.log("Status:", res.status);
      const data = await res.json();
      console.log("Response:", data);
    } catch (err) {
      console.error("Error:", err);
    }
    console.log("Took", Date.now() - start, "ms");

    process.exit(0);
  });
