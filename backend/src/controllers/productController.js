import mongoose from "mongoose";

import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

export const getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};
  const featuredFilter =
    req.query.featured === "true" ? { featured: true } : {};

  const products = await Product.find({
    ...keyword,
    ...category,
    ...featuredFilter,
  }).sort({ createdAt: -1 });

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
