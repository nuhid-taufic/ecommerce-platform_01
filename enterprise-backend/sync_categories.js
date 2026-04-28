require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Category = require("./models/Category");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const categories = await Product.distinct("category");
    console.log(`Found ${categories.length} unique categories in products`);

    for (let catName of categories) {
      if (!catName) continue;
      const exists = await Category.findOne({ name: catName });
      if (!exists) {
        await Category.create({ name: catName });
        console.log(`Created category: ${catName}`);
      }
    }

    console.log("Category sync complete");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
