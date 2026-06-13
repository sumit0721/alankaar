import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  try {
    const port = process.env.PORT || 5000;

    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const server = app.listen(port, () => {
      logger.info(`✅ Server running on port ${port}`, {
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      });
    });

    // ─────────────────────────────────────────────
    // Render / proxy keep-alive tuning
    // Render's load balancer has a 75s idle timeout.
    // Setting keepAliveTimeout slightly above it prevents
    // the proxy from closing connections that Express still
    // thinks are open, which would cause ECONNRESET errors.
    // ─────────────────────────────────────────────
    server.keepAliveTimeout = 90000; // 90 s (> Render's 75 s)
    server.headersTimeout = 95000;   // must be > keepAliveTimeout

    // Graceful shutdown on SIGTERM
    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });

    // Graceful shutdown on SIGINT (Ctrl+C)
    process.on("SIGINT", () => {
      logger.info("SIGINT signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });

    // ─────────────────────────────────────────────
    // Uncaught synchronous exceptions — truly unrecoverable.
    // Exit so Render can restart the process cleanly.
    // ─────────────────────────────────────────────
    process.on("uncaughtException", (error) => {
      logger.error("💥 Uncaught Exception — restarting server", {
        message: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    // ─────────────────────────────────────────────
    // Unhandled promise rejections — DO NOT exit.
    // These are typically transient (email API timeout,
    // Razorpay blip, MongoDB socket hiccup). Exiting here
    // was the PRIMARY cause of the 2–4 minute downtime.
    // Log it so we can diagnose, but keep the server alive.
    // ─────────────────────────────────────────────
    process.on("unhandledRejection", (reason) => {
      logger.error("⚠️  Unhandled Promise Rejection — server continuing", {
        reason: reason instanceof Error
          ? { message: reason.message, stack: reason.stack }
          : reason,
      });
      // Do NOT call process.exit(1) here.
    });

  } catch (error) {
    logger.error("Failed to start server", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();
