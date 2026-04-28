const mongoose = require("mongoose");

const visitorLogSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD for easy grouping
      required: true,
      index: true,
    },
    uniqueVisitors: [
      {
        type: String, // Hashed IP or unique session ID
      }
    ],
    devices: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    platforms: {
      direct: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisitorLog", visitorLogSchema);
