import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Notification from "../models/Notification.js";
import sendEmail from "../utils/sendEmail.js";
import { getStatusEmailContent } from "../utils/orderEmailTemplates.js";
import { sendToUser } from "../utils/sseManager.js";

const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    revenueResult,
    pendingOrdersCount,
    lowStockProducts,
  ] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]),
    Order.countDocuments({ isPaid: false }),
    Product.find({ countInStock: { $lt: 5 } })
      .select("name countInStock category price")
      .sort({ countInStock: 1, createdAt: -1 })
      .limit(8),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalOrders,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      totalProducts,
      pendingOrdersCount,
      lowStockProducts,
      lowStockProductsCount: lowStockProducts.length,
    },
  });
});

export const getChartData = asyncHandler(async (req, res) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlySeed = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    monthlySeed.push({
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      month: date.toLocaleString("en-IN", { month: "short" }),
      revenue: 0,
    });
  }

  const [monthlyRevenueRows, topProducts, statusCounts] = await Promise.all([
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.name",
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 4 },
      { $project: { _id: 0, name: "$_id", revenue: 1 } },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: {
            isPaid: "$isPaid",
            isDelivered: "$isDelivered",
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const monthlyRevenue = monthlySeed.map((item) => {
    const match = monthlyRevenueRows.find(
      (row) => row._id.year === Number(item.key.split("-")[0]) &&
        row._id.month === Number(item.key.split("-")[1])
    );

    return {
      month: item.month,
      revenue: match?.revenue || 0,
    };
  });

  const orderStatusBreakdown = [
    {
      label: "Paid",
      count: statusCounts
        .filter((item) => item._id.isPaid)
        .reduce((sum, item) => sum + item.count, 0),
    },
    {
      label: "Unpaid",
      count: statusCounts
        .filter((item) => !item._id.isPaid)
        .reduce((sum, item) => sum + item.count, 0),
    },
    {
      label: "Delivered",
      count: statusCounts
        .filter((item) => item._id.isDelivered)
        .reduce((sum, item) => sum + item.count, 0),
    },
    {
      label: "Pending Delivery",
      count: statusCounts
        .filter((item) => !item._id.isDelivered)
        .reduce((sum, item) => sum + item.count, 0),
    },
  ];

  res.status(200).json({
    success: true,
    data: {
      monthlyRevenue,
      topProducts,
      orderStatusBreakdown,
    },
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [users, total, orderCounts] = await Promise.all([
    User.find(filter)
      .select("-password -cartItems")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
    Order.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = {};
  orderCounts.forEach((entry) => {
    countMap[entry._id.toString()] = entry.count;
  });

  const usersWithCount = users.map((u) => ({
    ...u,
    orderCount: countMap[u._id.toString()] || 0,
  }));

  res.status(200).json({
    success: true,
    count: usersWithCount.length,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    total,
    data: usersWithCount,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id.");
  }

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot delete your own admin account.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const toggleAdminRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id.");
  }

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot change your own admin role.");
  }

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.isAdmin = !user.isAdmin;
  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: updatedUser,
  });
});

export const toggleUserActive = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id.");
  }

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot block yourself.");
  }

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "unblocked" : "blocked"}.`,
    data: { isActive: user.isActive },
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.isPaid === "true") {
    filter.isPaid = true;
  }

  if (req.query.isPaid === "false") {
    filter.isPaid = false;
  }

  if (req.query.isDelivered === "true") {
    filter.isDelivered = true;
  }

  if (req.query.isDelivered === "false") {
    filter.isDelivered = false;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    total,
    data: orders,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "pending", "processing", "packed",
    "shipped", "delivered", "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value.");
  }

  // Populate user to get their name and email for notification + email
  const order = await Order.findById(orderId).populate("user", "name email");

  if (!order) throw new ApiError(404, "Order not found.");

  // No-op if status is unchanged
  if (order.orderStatus === status) {
    return res.status(200).json({ success: true, data: order });
  }

  // Update order fields
  order.orderStatus = status;
  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  if (status === "cancelled") {
    order.isCancelled = true;
  }

  const updatedOrder = await order.save();

  // Human-readable messages per status
  const statusMessages = {
    pending:    `Your order #${order._id.toString().slice(-6).toUpperCase()} is pending.`,
    processing: `Your order #${order._id.toString().slice(-6).toUpperCase()} is now being processed.`,
    packed:     `Your order #${order._id.toString().slice(-6).toUpperCase()} has been packed and is ready for pickup.`,
    shipped:    `Your order #${order._id.toString().slice(-6).toUpperCase()} has been shipped and is on its way!`,
    delivered:  `Your order #${order._id.toString().slice(-6).toUpperCase()} has been delivered. Enjoy your products!`,
    cancelled:  `Your order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled. Contact us if you have questions.`,
  };

  // Save in-app notification to MongoDB
  const newNotification = await Notification.create({
    user: order.user._id,
    orderId: order._id,
    orderShortId: order._id.toString().slice(-6).toUpperCase(),
    message: statusMessages[status],
    status,
    isRead: false,
  });

  // Push to user instantly via SSE if they are currently online
  // If offline, they will receive it via unread_batch when they log back in
  sendToUser(order.user._id.toString(), {
    type: "new_notification",
    notification: newNotification,
  });

  // Send email for shipped, delivered, cancelled only
  const emailStatuses = ["shipped", "delivered", "cancelled"];
  if (emailStatuses.includes(status) && order.user?.email) {
    try {
      const emailContent = getStatusEmailContent(
        status,
        updatedOrder,
        order.user.name
      );
      if (emailContent) {
        await sendEmail({
          to: order.user.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      }
    } catch (emailError) {
      // Email failure must never block the status update response
      console.error("Order status email failed:", emailError.message);
    }
  }

  res.status(200).json({
    success: true,
    data: updatedOrder,
  });
});

// ============================================
// REVIEWS (ADMIN)
// ============================================

export const getAllReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [reviews, total] = await Promise.all([
    Review.find()
      .populate("user", "name email profilePicture")
      .populate("product", "name image category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    total,
    data: reviews,
  });
});

export const deleteReviewAdmin = asyncHandler(async (req, res) => {
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

  // Recalculate product rating
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

  res.status(200).json({
    success: true,
    message: "Review deleted successfully.",
  });
});
