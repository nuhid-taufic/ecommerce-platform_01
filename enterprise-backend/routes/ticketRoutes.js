const express = require("express");
const router = express.Router();
const {
  createTicket,
  getTickets,
  replyTicket,
  getUserTickets,
  createContactTicket,
} = require("../controllers/ticketController");

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/user/:userId", getUserTickets);
router.put("/:id", replyTicket);

router.post("/contact", createContactTicket);

module.exports = router;
