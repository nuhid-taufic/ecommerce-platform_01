const express = require("express");
const router = express.Router();
const {
  getReviews,
  updateReviewStatus,
  addAdminReply,
  deleteReview,
  getProductReviews,
  createReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/auth");

router.get("/", getReviews);
router.get("/product/:productId", getProductReviews);
router.post("/", protect, createReview);
router.put("/:id/status", updateReviewStatus);
router.put("/:id/reply", addAdminReply);
router.delete("/:id", deleteReview);

module.exports = router;
