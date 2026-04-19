import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !keyId ||
    !keySecret ||
    keyId === "PASTE_YOUR_RAZORPAY_KEY_ID_HERE" ||
    keySecret === "PASTE_YOUR_RAZORPAY_KEY_SECRET_HERE"
  ) {
    throw new ApiError(
      500,
      "Razorpay credentials are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env to enable Razorpay payments."
    );
  }

  return { keyId, keySecret };
};

const getOrderForUser = async (orderId, user) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order id.");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!user.isAdmin && order.user.toString() !== user._id.toString()) {
    throw new ApiError(403, "You can only access your own orders.");
  }

  return order;
};

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await getOrderForUser(orderId, req.user);

  if (order.isPaid) {
    throw new ApiError(400, "This order has already been paid.");
  }

  if (order.paymentMethod !== "razorpay") {
    throw new ApiError(400, "Razorpay checkout is only available for Razorpay orders.");
  }

  const { keyId, keySecret } = getRazorpayCredentials();
  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(order.totalPrice * 100),
      currency: "INR",
      receipt: `order_${order._id.toString().slice(-8)}`,
      notes: {
        appOrderId: order._id.toString(),
        customerEmail: req.user.email,
      },
    }),
  });

  const razorpayPayload = await razorpayResponse.json();

  if (!razorpayResponse.ok) {
    throw new ApiError(
      razorpayResponse.status,
      razorpayPayload.error?.description ||
        razorpayPayload.error?.reason ||
        "Razorpay order creation failed."
    );
  }

  const razorpayOrder = razorpayPayload;

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.status(200).json({
    success: true,
    data: {
      keyId,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Antigravity",
      description: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
      prefill: {
        name: order.shippingAddress.fullName,
        email: req.user.email,
      },
      notes: {
        shippingCity: order.shippingAddress.city,
        shippingCountry: order.shippingAddress.country,
      },
    },
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Razorpay verification details are missing.");
  }

  const order = await getOrderForUser(orderId, req.user);

  if (order.paymentMethod !== "razorpay") {
    throw new ApiError(400, "This order is not configured for Razorpay.");
  }

  if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
    throw new ApiError(400, "Razorpay order id does not match this order.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", getRazorpayCredentials().keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Razorpay payment signature verification failed.");
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.razorpayOrderId = razorpay_order_id;
  order.paymentResult = {
    id: razorpay_payment_id,
    status: "paid",
    updateTime: new Date().toISOString(),
    emailAddress: req.user.email,
  };

  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: "Razorpay payment verified successfully",
    data: updatedOrder,
  });
});
