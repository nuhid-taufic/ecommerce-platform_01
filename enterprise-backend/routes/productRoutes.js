const express = require("express");
const router = express.Router();
const { uploadBulkProducts } = require("../controllers/productController");
const { semanticSearch } = require("../controllers/productController");

const {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { upload } = require("../config/cloudinary");

router.get("/search", semanticSearch);
router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);

router.get("/:id", getSingleProduct);

router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

router.post("/bulk", uploadBulkProducts);

module.exports = router;
