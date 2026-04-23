const express = require("express");
const router = express.Router();
const {
  getHomeSettings,
  updateBentoBox,
} = require("../controllers/homeController");

router.get("/", getHomeSettings);

router.put("/bento-box", updateBentoBox);

module.exports = router;
