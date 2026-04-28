const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    try {
      const p = await Product.findOne({ name: "JHF Soap" });
      console.log("found product");
      await Product.findByIdAndUpdate(p._id, {
          $inc: { stock: -1 },
      });
      console.log("updated product");
    } catch (err) {
      console.error("Error:", err);
    }
    process.exit(0);
  });
