import mongoose from "mongoose";

import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const calculateCartTotals = (cartItems) => {
  const itemsPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    itemsPrice,
    totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };
};

export const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("cartItems");

  const totals = calculateCartTotals(user.cartItems);

  res.status(200).json({
    success: true,
    data: {
      items: user.cartItems,
      ...totals,
    },
  });
});

export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "A valid product id is required.");
  }

  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (product.countInStock < quantity) {
    throw new ApiError(400, "Requested quantity is not available in stock.");
  }

  const user = await User.findById(req.user._id);
  const existingItem = user.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (product.countInStock < newQuantity) {
      throw new ApiError(400, "Requested quantity exceeds current stock.");
    }

    existingItem.quantity = newQuantity;
  } else {
    user.cartItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
    });
  }

  await user.save();

  const totals = calculateCartTotals(user.cartItems);

  res.status(200).json({
    success: true,
    message: "Item added to cart successfully",
    data: {
      items: user.cartItems,
      ...totals,
    },
  });
});

export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id.");
  }

  if (!quantity || quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (product.countInStock < quantity) {
    throw new ApiError(400, "Requested quantity exceeds current stock.");
  }

  const user = await User.findById(req.user._id);
  const cartItem = user.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found.");
  }

  cartItem.quantity = quantity;
  await user.save();

  const totals = calculateCartTotals(user.cartItems);

  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: {
      items: user.cartItems,
      ...totals,
    },
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id.");
  }

  const user = await User.findById(req.user._id);
  const originalLength = user.cartItems.length;

  user.cartItems = user.cartItems.filter(
    (item) => item.product.toString() !== productId
  );

  if (user.cartItems.length === originalLength) {
    throw new ApiError(404, "Cart item not found.");
  }

  await user.save();

  const totals = calculateCartTotals(user.cartItems);

  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: {
      items: user.cartItems,
      ...totals,
    },
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cartItems = [];
  await user.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: {
      items: [],
      itemsPrice: 0,
      totalQuantity: 0,
    },
  });
});
