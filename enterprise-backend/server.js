require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const orderRoutes = require("./routes/orderRoutes");
const statsRoutes = require("./routes/statsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const couponRoutes = require("./routes/couponRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const flashSaleRoutes = require("./routes/flashSaleRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const settingRoutes = require("./routes/settingRoutes");
const staffRoutes = require("./routes/staffRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const sslRoutes = require("./routes/payment.route");
const homeRoutes = require("./routes/homeRoutes");
const journalRoutes = require("./routes/journalRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

const stripeRoutes = require("./routes/paymentRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");

require("./config/passport");

const app = express();

// Middleware Setup
app.use(express.json());

app.use(
  cors({
    origin: true,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Passport Initialize
app.use(passport.initialize());
app.use(passport.session());

// Routes Setup
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/flash-sales", flashSaleRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/payment", sslRoutes);
app.use("/api/home-settings", homeRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Enterprise Backend is running smoothly!");
});

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5003;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    app.listen(PORT, () => {
      console.log(`🚀 Enterprise Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });
