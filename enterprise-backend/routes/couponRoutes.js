const express = require("express");
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  deleteCoupon,
  verifyCoupon,
  getMyCoupons,
} = require("../controllers/couponController");

router.get("/", getCoupons);
router.get("/my-coupons/:email", getMyCoupons);
router.get("/verify/:code", verifyCoupon);
router.post("/", createCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
