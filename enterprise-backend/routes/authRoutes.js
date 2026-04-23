const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  saveAddress,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

router.post("/address", saveAddress);

router.get("/google", (req, res, next) => {
  const action = req.query.action || "login";
  const returnTo = req.query.returnTo || "/";
  const stateStr = Buffer.from(JSON.stringify({ action, returnTo })).toString(
    "base64",
  );
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: stateStr,
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    let returnTo = "/";
    if (req.query.state) {
      try {
        const stateObj = JSON.parse(
          Buffer.from(req.query.state, "base64").toString("utf-8"),
        );
        returnTo = stateObj.returnTo || "/";
      } catch (e) {}
    }

    const storeUrl = process.env.STORE_URL || "http://localhost:3000";

    if (err) return next(err);
    if (!user) {
      return res.redirect(
        `${storeUrl}/login?error=auth_failed&redirect=${encodeURIComponent(returnTo)}`,
      );
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "enterprise_super_secret_key",
        { expiresIn: "7d" },
      );

      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
      };
      const userEncoded = encodeURIComponent(JSON.stringify(userData));

      // Append token and user to the return URL
      const separator = returnTo.includes("?") ? "&" : "?";
      return res.redirect(
        `${storeUrl}${returnTo}${separator}token=${token}&user=${userEncoded}`,
      );
    });
  })(req, res, next);
});

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
});

module.exports = router;
