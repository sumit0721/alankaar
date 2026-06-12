import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const calculatePrices = (cartItems) => {
  const itemsPrice = Number(
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const shippingPrice = itemsPrice >= 75 ? 0 : 8;
  const taxPrice = Number((itemsPrice * 0.12).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    throw new ApiError(400, "Shipping address and payment method are required.");
  }

  const user = await User.findById(req.user._id);

  if (!user.cartItems.length) {
    throw new ApiError(400, "Cart is empty. Add items before placing an order.");
  }

  // ── Batch fetch all cart products in a single DB query ────────────
  // Old code ran N individual Product.findById() calls in a for-loop.
  // Now: 1 query regardless of cart size.
  const productIds = user.cartItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  // Build a lookup map: productId string → product document
  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  // Validate stock for every cart item
  for (const item of user.cartItems) {
    const product = productMap[item.product.toString()];
    if (!product) {
      throw new ApiError(404, `Product no longer exists: ${item.name}`);
    }
    if (product.countInStock < item.quantity) {
      throw new ApiError(400, `Not enough stock for ${item.name}.`);
    }
  }

  const prices = calculatePrices(user.cartItems);

  const order = await Order.create({
    user: user._id,
    orderItems: user.cartItems.map((item) => ({
      product: item.product,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress,
    paymentMethod,
    ...prices,
  });

  // ── Batch decrement all stock in a single bulkWrite ───────────────
  // Old code ran N individual findById() + save() calls in a for-loop.
  // Now: 1 bulkWrite regardless of cart size.
  const bulkOps = user.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { countInStock: -item.quantity } },
    },
  }));
  await Product.bulkWrite(bulkOps);

  user.cartItems = [];
  await user.save();

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order id.");
  }

  const order = await Order.findById(orderId).populate("user", "name email");

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view your own orders.");
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const markOrderAsPaid = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order id.");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own orders.");
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    id: req.body.id || "dummy-payment-id",
    status: req.body.status || "completed",
    updateTime: req.body.updateTime || new Date().toISOString(),
    emailAddress: req.body.emailAddress || req.user.email,
  };

  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: "Order marked as paid",
    data: updatedOrder,
  });
});
