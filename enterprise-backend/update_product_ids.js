require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const products = await Product.find({ productId: { $exists: false } });
    console.log(`Found ${products.length} products without productId`);

    for (let p of products) {
      const num = Math.floor(1000 + Math.random() * 9000);
      p.productId = `PRD-${num}`;
      await p.save();
    }

    const products2 = await Product.find({ productId: "" });
    console.log(`Found ${products2.length} products with empty productId`);
    for (let p of products2) {
      const num = Math.floor(1000 + Math.random() * 9000);
      p.productId = `PRD-${num}`;
      await p.save();
    }

    console.log("Updated all products");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
