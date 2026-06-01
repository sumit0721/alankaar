import { addClient, removeClient } from "../utils/sseManager.js";
import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sseConnect = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  // Set SSE required headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Prevents Railway/Render proxy buffering
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
  res.flushHeaders();

  // Confirm connection immediately
  res.write(": connected\n\n");

  // Send all unread notifications immediately so user gets
  // any updates they missed while they were logged out
  try {
    const unread = await Notification.find({
      user: req.user._id,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    if (unread.length > 0) {
      res.write(
        `data: ${JSON.stringify({
          type: "unread_batch",
          notifications: unread,
        })}\n\n`
      );
    }
  } catch (err) {
    console.error("SSE initial load error:", err.message);
  }

  // Register this user's connection
  addClient(userId, res);

  // Heartbeat every 25 seconds to keep proxy connections alive
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
      removeClient(userId);
    }
  }, 25000);

  // Clean up when user closes browser tab or logs out
  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(userId);
  });
});
