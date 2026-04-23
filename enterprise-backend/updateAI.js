require("dotenv").config();
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("./models/Product");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const updateOldProducts = async () => {
  try {
    console.log("⏳ Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database Connected!");

    const products = await Product.find({ embedding: { $exists: false } });

    if (products.length === 0) {
      console.log("🎉 All products already have AI embeddings!");
      process.exit(0);
    }

    console.log(
      `🤖 Found ${products.length} old products. Generating AI Embeddings...`,
    );

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const textToEmbed = `${p.name} ${p.category || ""} ${p.description || ""}`;

      const result = await model.embedContent(textToEmbed);
      p.embedding = result.embedding.values;

      await p.save();
      console.log(`✅ [${i + 1}/${products.length}] Indexed: ${p.name}`);

      await new Promise((res) => setTimeout(res, 1000));
    }

    console.log("🎉 All old products successfully updated with AI!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating products:", error);
    process.exit(1);
  }
};

updateOldProducts();
