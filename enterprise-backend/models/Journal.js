const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: { type: String, required: true }, // Image URL
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    readTime: { type: String, default: "5 min read" },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Journal || mongoose.model("Journal", journalSchema);
