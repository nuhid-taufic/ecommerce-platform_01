const express = require("express");
const router = express.Router();
const { getDashboardAnalytics, trackVisit } = require("../controllers/analyticsController");

router.get("/", getDashboardAnalytics);
router.post("/track", trackVisit);

module.exports = router;
