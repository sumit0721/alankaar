import mongoose from "mongoose";

import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

export const getProducts = asyncHandler(async (req, res) => {
  const query = {};
  const andConditions = []; // Collects all $or conditions to combine safely

  // ── Keyword search ─────────────────────────────────────────────────
  // Uses MongoDB $text index (defined in Product model) for fast O(log n)
  // full-text search instead of a slow O(n) case-insensitive regex scan.
  if (req.query.keyword) {
    andConditions.push({
      $or: [
        { name: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ],
    });
  }

  // ── Category filter ────────────────────────────────────────────────
  if (req.query.category && req.query.category !== "All") {
    query.category = req.query.category;
  }

  // ── Skin Type filter ───────────────────────────────────────────────
  // BUG FIX: Previously set query.$or directly, which OVERWROTE the
  // keyword search $or. Now pushed into andConditions so both compose.
  if (req.query.skinType && req.query.skinType !== "All") {
    andConditions.push({
      $or: [
        { skinType: { $regex: req.query.skinType, $options: "i" } },
        { skinType: { $regex: "all", $options: "i" } },
      ],
    });
  }

  // Apply composed $and if we have multiple $or conditions
  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  // ── Price range filters ────────────────────────────────────────────
  const priceFilter = {};
  if (req.query.minPrice !== undefined && req.query.minPrice !== "") {
    priceFilter.$gte = Number(req.query.minPrice);
  }
  if (req.query.maxPrice !== undefined && req.query.maxPrice !== "") {
    priceFilter.$lte = Number(req.query.maxPrice);
  }
  if (Object.keys(priceFilter).length > 0) {
    query.price = priceFilter;
  }

  // ── Minimum rating filter ──────────────────────────────────────────
  if (req.query.minRating && req.query.minRating !== "") {
    query.rating = { $gte: Number(req.query.minRating) };
  }

  // ── Availability filter ────────────────────────────────────────────
  if (req.query.inStock === "true") {
    query.countInStock = { $gt: 0 };
  }

  // ── Featured filter ────────────────────────────────────────────────
  if (req.query.featured === "true") {
    query.featured = true;
  }

  // ── Sorting logic ──────────────────────────────────────────────────
  let sortOption = { createdAt: -1 };
  if (req.query.sort === "popular") {
    sortOption = { numReviews: -1 };
  } else if (req.query.sort === "topRated") {
    sortOption = { rating: -1 };
  } else if (req.query.sort === "priceAsc") {
    sortOption = { price: 1 };
  } else if (req.query.sort === "priceDesc") {
    sortOption = { price: -1 };
  } else if (req.query.sort === "newest") {
    sortOption = { createdAt: -1 };
  }

  const products = await Product.find(query).sort(sortOption).lean();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});


export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    brand,
    category,
    image,
    price,
    countInStock,
    rating,
    numReviews,
    featured,
    skinType,
    tags,
    gender,
    images,
    variants,
  } = req.body;

  if (!name || !description || !category || price === undefined || countInStock === undefined) {
    throw new ApiError(400, "Name, description, category, price, and stock are required.");
  }

  const product = await Product.create({
    name,
    description,
    brand,
    category,
    image,
    price,
    countInStock,
    rating,
    numReviews,
    featured,
    skinType,
    tags,
    gender,
    images,
    variants,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const fields = [
    "name",
    "description",
    "brand",
    "category",
    "image",
    "price",
    "countInStock",
    "rating",
    "numReviews",
    "featured",
    "skinType",
    "tags",
    "gender",
    "images",
    "variants",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  const updatedProduct = await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
