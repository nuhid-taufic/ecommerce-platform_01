const express = require("express");
const router = express.Router();
const {
  getCustomers,
  getCustomerDetails,
  cancelOrder,
} = require("../controllers/customerController");

router.get("/", getCustomers);
router.get("/:id/details", getCustomerDetails);
router.put("/orders/:orderId/cancel", cancelOrder);

module.exports = router;
