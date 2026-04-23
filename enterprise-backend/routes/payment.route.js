const express = require("express");
const router = express.Router();
const {
  createOrder,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} = require("../controllers/payment.controller");

router.post("/create-order", createOrder);
router.post("/success/:tran_id", paymentSuccess);
router.post("/fail/:tran_id", paymentFail);
router.post("/cancel/:tran_id", paymentCancel);

module.exports = router;
