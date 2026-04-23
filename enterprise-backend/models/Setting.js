const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Enterprise Store" },
    browserTitle: { type: String, default: "Enterprise Store | Home" }, // Menubar/Tab Name

    // Branding Images
    logoUrl: { type: String },
    faviconUrl: { type: String },

    // Theme Colors
    colors: {
      primary: { type: String, default: "#2563eb" }, // Default Blue
      secondary: { type: String, default: "#475569" }, // Default Slate
      optional: { type: String, default: "#f59e0b" }, // Default Amber
    },

    contactEmail: { type: String },
    contactPhone: { type: String },
    shippingInsideCity: { type: Number, default: 60 },
    shippingOutsideCity: { type: Number, default: 120 },
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);
