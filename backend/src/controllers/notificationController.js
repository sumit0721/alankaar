import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found.",
    });
  }

  res.status(200).json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
  });
});
