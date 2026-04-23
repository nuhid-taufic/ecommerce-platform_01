const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    password: { type: String },
    mobile: { type: String },

    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },

    addresses: { type: Array, default: [] },

    role: { type: String, default: "customer" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
