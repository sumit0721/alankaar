import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/db.js";
import { logger } from "./utils/logger.js";

dotenv.config();

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

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception", {
        message: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", {
        promise,
        reason,
      });
      process.exit(1);
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
