const express = require("express");
const router = express.Router();
const {
  getShipments,
  updateShipment,
} = require("../controllers/shippingController");

router.get("/", getShipments);
router.put("/:id", updateShipment);

module.exports = router;
