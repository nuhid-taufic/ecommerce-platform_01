const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    // user ke optional (required: false) kora hoyeche, jate login charao msg deya jay
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Ei duto notun field Contact Page er jonno add kora holo
    guestName: { type: String },
    guestEmail: { type: String },

    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    messages: [
      {
        sender: { type: String, enum: ["customer", "admin"], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
