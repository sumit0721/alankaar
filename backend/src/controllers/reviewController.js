import mongoose from "mongoose";

import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
  }
};

export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id.");
  }

  const reviews = await Review.find({ product: productId })
    .populate("user", "name profilePicture")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id.");
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5.");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  // Check if user has a delivered order containing this product (by ID or exact name)
  const hasDeliveredOrder = await Order.findOne({
    user: req.user._id,
    isDelivered: true,
    $or: [
      { "orderItems.product": productId },
      { "orderItems.name": product.name },
    ],
  });

  if (!hasDeliveredOrder) {
    throw new ApiError(403, "You can only review products from delivered orders.");
  }

  try {
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment: comment || "",
    });

    await recalculateProductRating(productId);

    res.status(201).json({
      success: true,
      message: "Review added successfully.",
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "You have already reviewed this product.");
    }
    throw error;
  }
});

export const checkReviewEligibility = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const hasDeliveredOrder = await Order.findOne({
    user: req.user._id,
    isDelivered: true,
    $or: [
      { "orderItems.product": productId },
      { "orderItems.name": product.name },
    ],
  });

  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    canReview: !!hasDeliveredOrder && !alreadyReviewed,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review id.");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully.",
  });
});
