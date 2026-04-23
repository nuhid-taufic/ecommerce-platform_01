// controllers/homeController.js
const HomeSettings = require("../models/HomeSettings");

const getHomeSettings = async (req, res) => {
  try {
    const settings = await HomeSettings.findOne();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateBentoBox = async (req, res) => {
  try {
    const { bentoBox } = req.body;

    const settings = await HomeSettings.findOneAndUpdate(
      {},
      { bentoBox },
      { new: true, upsert: true },
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Bento Box updated successfully",
        settings,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = { getHomeSettings, updateBentoBox };
