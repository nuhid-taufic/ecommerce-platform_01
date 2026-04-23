const mongoose = require("mongoose");

const resetOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-delete after 10 minutes (600 seconds)
});

module.exports =
  mongoose.models.ResetOtp || mongoose.model("ResetOtp", resetOtpSchema);
