const express = require("express");
const router = express.Router();
const {
  getFlashSales,
  createFlashSale,
  deleteFlashSale,
  getActiveFlashSale,
} = require("../controllers/flashSaleController");

router.get("/active", getActiveFlashSale);
router.get("/", getFlashSales);
router.post("/", createFlashSale);
router.delete("/:id", deleteFlashSale);
module.exports = router;
