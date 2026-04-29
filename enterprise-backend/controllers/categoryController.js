const Category = require("../models/Category");
const Product = require("../models/Product");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, image, isFeaturedOnHome } = req.body;
    const category = new Category({ name, image, isFeaturedOnHome });
    await category.save();
    res.status(201).json({ success: true, message: "Category created", category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const oldCategory = await Category.findById(id);
    if (!oldCategory) return res.status(404).json({ success: false, message: "Category not found" });

    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
    
    // If name changed, update all products using the old name
    if (name && name !== oldCategory.name) {
      await Product.updateMany({ category: oldCategory.name }, { category: name });
    }

    res.status(200).json({ success: true, message: "Category updated", category: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    // Move products to 'Uncategorized' before deleting
    await Product.updateMany({ category: category.name }, { category: "Uncategorized" });

    await Category.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Category deleted and products moved to Uncategorized" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
