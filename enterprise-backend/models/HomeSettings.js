const mongoose = require("mongoose");

const homeSettingsSchema = new mongoose.Schema(
  {
    bentoBox: [
      {
        title: { type: String, required: true },
        imageUrls: [{ type: String }],
        linkTo: { type: String, default: "/shop" },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("HomeSettings", homeSettingsSchema);
