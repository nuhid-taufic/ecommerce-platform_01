const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");
const nodemailer = require("nodemailer");

// @route POST /api/newsletter/subscribe
// @desc Add email to newsletter list
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.status === "unsubscribed") {
        existingSubscriber.status = "subscribed";
        await existingSubscriber.save();
        return res
          .status(200)
          .json({ success: true, message: "Successfully re-subscribed!" });
      }
      return res
        .status(400)
        .json({ success: false, message: "You are already subscribed!" });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Successfully subscribed to the newsletter!",
      });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route GET /api/newsletter/subscribers
// @desc Get all subscribers (Admin only ideally, but keeping simple for now)
router.get("/subscribers", async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// @route POST /api/newsletter/broadcast
// @desc Send email blast to all active subscribers
router.post("/broadcast", async (req, res) => {
  try {
    const { subject, htmlBody } = req.body;

    if (!subject || !htmlBody) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Subject and HTML body are required",
        });
    }

    const activeSubscribers = await Subscriber.find({ status: "subscribed" });
    if (activeSubscribers.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No active subscribers found." });
    }

    const emails = activeSubscribers.map((sub) => sub.email);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      // Send to everyone via BCC so they don't see each other's emails
      await transporter.sendMail({
        from: `"STUDIO. Updates" <${process.env.EMAIL_USER}>`,
        bcc: emails,
        subject: subject,
        html: htmlBody,
      });
    } else {
      console.log(
        `\n\n[DEV MODE] SENDING BROADCAST EMAIL TO ${emails.length} SUBSCRIBERS:`,
      );
      console.log(`SUBJECT: ${subject}`);
      console.log(`BCC: ${emails.join(", ")}`);
      console.log(`BODY (HTML):\n${htmlBody}\n\n`);
    }

    res
      .status(200)
      .json({
        success: true,
        message: `Broadcast successfully sent to ${emails.length} subscribers!`,
      });
  } catch (error) {
    console.error("Newsletter Broadcast Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
});

module.exports = router;
