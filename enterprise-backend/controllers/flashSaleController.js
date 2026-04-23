const FlashSale = require("../models/FlashSale");

const getFlashSales = async (req, res) => {
  try {
    const sales = await FlashSale.find()
      .populate("products.productId", "name image price")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, sales });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const createFlashSale = async (req, res) => {
  try {
    const sale = new FlashSale(req.body);
    await sale.save();
    res
      .status(201)
      .json({ success: true, message: "Flash sale created", sale });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const deleteFlashSale = async (req, res) => {
  try {
    await FlashSale.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Flash sale deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getActiveFlashSale = async (req, res) => {
  try {
    const now = new Date();
    const activeSale = await FlashSale.findOne({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).populate("products.productId", "name image price stock");

    if (!activeSale) {
      return res
        .status(200)
        .json({ success: true, message: "No active flash sale", sale: null });
    }

    res.status(200).json({ success: true, sale: activeSale });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {
  getFlashSales,
  createFlashSale,
  deleteFlashSale,
  getActiveFlashSale,
};
