const Review = require("../models/Review");

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true },
    );

    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    res
      .status(200)
      .json({
        success: true,
        message: isApproved ? "Review Approved" : "Review Hidden",
        review,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const addAdminReply = async (req, res) => {
  try {
    const { adminReply } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { adminReply },
      { new: true },
    );

    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    res
      .status(200)
      .json({ success: true, message: "Reply added successfully", review });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!productId || !rating || !comment) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all fields" });
    }

    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name email",
    );

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {
  getReviews,
  updateReviewStatus,
  addAdminReply,
  deleteReview,
  createReview,
  getProductReviews,
};
