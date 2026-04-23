const express = require("express");
const router = express.Router();
const {
  createJournal,
  getJournals,
  getJournalBySlug,
  updateJournal,
  deleteJournal,
} = require("../controllers/journalController");

// Journal Routes
router.post("/", createJournal);
router.get("/", getJournals);
router.get("/:slug", getJournalBySlug);
router.put("/:id", updateJournal);
router.delete("/:id", deleteJournal);

module.exports = router;
