const express = require("express");
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

router.get("/", getCoupons);
router.post("/", createCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
