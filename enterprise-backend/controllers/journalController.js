const Journal = require("../models/Journal");

// Create a new Journal entry
const createJournal = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      image,
      excerpt,
      content,
      readTime,
      isFeatured,
      status,
    } = req.body;

    const existingJournal = await Journal.findOne({ slug });
    if (existingJournal) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A journal with this slug already exists.",
        });
    }

    const newJournal = new Journal({
      title,
      slug,
      category,
      image,
      excerpt,
      content,
      readTime,
      isFeatured,
      status,
    });

    await newJournal.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Journal created successfully",
        journal: newJournal,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get all Journals (Admin sees all, Storefront might filter)
const getJournals = async (req, res) => {
  try {
    const { status } = req.query; // optional filter
    const query = status ? { status } : {};

    const journals = await Journal.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, journals });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get a single Journal by slug
const getJournalBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const journal = await Journal.findOne({ slug });

    if (!journal) {
      return res
        .status(404)
        .json({ success: false, message: "Journal not found" });
    }
    res.status(200).json({ success: true, journal });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Update a Journal
const updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedJournal = await Journal.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedJournal) {
      return res
        .status(404)
        .json({ success: false, message: "Journal not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Journal updated successfully",
        journal: updatedJournal,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Delete a Journal
const deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedJournal = await Journal.findByIdAndDelete(id);

    if (!deletedJournal) {
      return res
        .status(404)
        .json({ success: false, message: "Journal not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Journal deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {
  createJournal,
  getJournals,
  getJournalBySlug,
  updateJournal,
  deleteJournal,
};
