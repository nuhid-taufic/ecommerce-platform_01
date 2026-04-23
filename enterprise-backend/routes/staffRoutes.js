const express = require("express");
const router = express.Router();
const { getStaff, updateStaffRole } = require("../controllers/staffController");

router.get("/", getStaff);
router.put("/:id/role", updateStaffRole);
module.exports = router;
