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
      .limit(20)
      .lean();

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

  // ── Heartbeat every 25 seconds ─────────────────────────────────────
  // Keeps proxy connections alive on Render/Railway.
  // The interval ref is passed to addClient so the manager can
  // clear it if the user reconnects (prevents orphaned intervals).
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      // Write failed — connection is gone, clean up
      removeClient(userId);
    }
  }, 25000);

  // Register client WITH heartbeat ref so manager can clean up on reconnect
  addClient(userId, res, heartbeat);

  // Clean up when user closes browser tab or logs out
  req.on("close", () => {
    removeClient(userId);
  });
});

