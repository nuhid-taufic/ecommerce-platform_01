const express = require("express");
const router = express.Router();

const {
  getUserOrders,
  getAllOrders,
  updateOrderTracking,
  updateOrderStatus,
  createManualOrder,
} = require("../controllers/orderController");

router.get("/", getAllOrders);
router.post("/manual-order", createManualOrder);

router.get("/my-orders/:email", getUserOrders);

router.put("/update-tracking/:orderId", updateOrderTracking);

router.put("/:id/status", updateOrderStatus);

module.exports = router;
