const Product = require("../models/Product");
const Category = require("../models/Category");
const HomeSettings = require("../models/HomeSettings");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("AI Embedding Error:", error);
    return [];
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image, images, benefits, productId, currency } =
      req.body;
    const imageUrl = image || (req.file ? req.file.path : "");

    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Product image is required" });
    }

    const textToEmbed = `${name} ${category || ""} ${description || ""}`;
    const embeddingData = await generateEmbedding(textToEmbed);

    const product = new Product({
      name,
      description,
      price,
      currency: currency || "USD",
      image: imageUrl,
      images: images || [],
      category,
      stock,
      benefits: benefits || [],
      productId: productId || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      embedding: embeddingData.length > 0 ? embeddingData : undefined,
    });

    await product.save();

    // Ensure category exists in Category collection
    if (category) {
      const categoryExists = await Category.findOne({ name: category });
      if (!categoryExists) {
        await Category.create({ name: category });
      }
    }

    res
      .status(201)
      .json({
        success: true,
        message: "Product created successfully",
        product,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .select("-embedding")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("-embedding");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updatedData = { ...req.body };

    if (req.file) {
      updatedData.image = req.file.path;
    }

    if (updatedData.name || updatedData.description || updatedData.category) {
      const productToUpdate = await Product.findById(id);
      const textToEmbed = `${updatedData.name || productToUpdate.name} ${updatedData.category || productToUpdate.category || ""} ${updatedData.description || productToUpdate.description || ""}`;
      updatedData.embedding = await generateEmbedding(textToEmbed);
    }

    const product = await Product.findByIdAndUpdate(id, updatedData, {
      returnDocument: "after",
      runValidators: true,
    });

    // Ensure category exists in Category collection
    if (updatedData.category) {
      const categoryExists = await Category.findOne({ name: updatedData.category });
      if (!categoryExists) {
        await Category.create({ name: updatedData.category });
      }
    }

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Product updated successfully",
        product,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const uploadBulkProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products provided!" });
    }

    for (let p of products) {
      const textToEmbed = `${p.name} ${p.category || ""} ${p.description || ""}`;
      p.embedding = await generateEmbedding(textToEmbed);
    }

    const insertedProducts = await Product.insertMany(products);

    res.status(201).json({
      success: true,
      message: `${insertedProducts.length} products uploaded & AI indexed successfully!`,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 🚀 AI Semantic Search API
// ==========================================
const semanticSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });

    let products = [];
    
    try {
      // 1. Try MongoDB Atlas Vector Search
      const queryVector = await generateEmbedding(query);
      if (queryVector && queryVector.length > 0) {
        products = await Product.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryVector,
              numCandidates: 50,
              limit: 5,
            },
          },
          {
            $project: {
              name: 1,
              description: 1,
              price: 1,
              category: 1,
              image: 1,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ]);
      }
    } catch (vectorError) {
      console.warn("Vector search failed or not configured, falling back to regex search.");
    }

    // 2. Fallback to normal text search if no products found or vector search failed
    if (products.length === 0) {
      products = await Product.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } }
        ]
      }).limit(5).select("name description price category image");
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("AI Search Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Search failed", error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    // Fetch all categories from the managed Category collection
    const categoriesList = await Category.find().sort({ name: 1 });
    
    // Extract just the names for the array-based frontend logic
    let categories = categoriesList.map(c => c.name);

    // Fallback: If no categories exist in the collection, check products
    if (categories.length === 0) {
      categories = await Product.distinct("category");
    }

    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadBulkProducts,
  semanticSearch,
  getCategories,
};
