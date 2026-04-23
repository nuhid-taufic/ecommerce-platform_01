const User = require("../models/User");

const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $ne: "customer" } }).select(
      "-password",
    );
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateStaffRole = async (req, res) => {
  try {
    const { role } = req.body;
    const staff = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");
    res
      .status(200)
      .json({ success: true, message: "Role updated successfully", staff });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = { getStaff, updateStaffRole };
