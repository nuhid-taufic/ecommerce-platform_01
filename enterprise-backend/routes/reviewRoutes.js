const express = require("express");
const router = express.Router();
const {
  getReviews,
  updateReviewStatus,
  addAdminReply,
  deleteReview,
} = require("../controllers/reviewController");

router.get("/", getReviews);
router.put("/:id/status", updateReviewStatus);
router.put("/:id/reply", addAdminReply);
router.delete("/:id", deleteReview);

module.exports = router;
