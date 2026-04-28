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

    // Advanced Configurations
    isMaintenanceMode: { type: Boolean, default: false },
    currencySymbol: { type: String, default: "৳" },
    currencyCode: { type: String, default: "BDT" },
    
    // Announcement Bar
    showAnnouncement: { type: Boolean, default: false },
    announcementText: { type: String, default: "Welcome to our store!" },
    announcementLink: { type: String },

    // SEO Settings
    seoDescription: { type: String },
    seoKeywords: { type: String },
    
    // Store Policies
    storeAddress: { type: String },
    footerText: { type: String },
    refundPolicyUrl: { type: String },
    privacyPolicyUrl: { type: String },
    termsUrl: { type: String },
    
    // Tax & Fees
    taxRate: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);
