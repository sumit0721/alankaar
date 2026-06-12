import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI || mongoURI === "PASTE_YOUR_MONGODB_ATLAS_URI_HERE") {
      throw new Error(
        "MONGODB_URI is missing. Paste your MongoDB Atlas connection string into backend/.env before starting the backend."
      );
    }

    await mongoose.connect(mongoURI, {
      // ── Tuned for Render Free Tier + Atlas M0 ──────────────────
      // How long the driver waits to find an available server before
      // throwing. Keeps the startup fast if Atlas is briefly unreachable.
      serverSelectionTimeoutMS: 10000, // 10 s

      // How long a socket can be idle before it is closed.
      // Prevents zombie connections on Atlas M0 which recycles
      // idle connections after ~60 s of inactivity.
      socketTimeoutMS: 45000, // 45 s

      // Atlas M0 free tier allows up to 100 connections total across
      // all apps. Keep the pool small to avoid hitting the cap.
      maxPoolSize: 10,

      // Minimum connections kept alive in the pool.
      minPoolSize: 1,

      // How often the driver checks server status (heartbeat).
      heartbeatFrequencyMS: 10000, // 10 s
    });

    logger.info("✅ MongoDB connected successfully");

    // ── Connection event monitoring ────────────────────────────────
    // These events are visible in Render logs and help diagnose
    // exactly when and why disconnections happen.

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️  MongoDB disconnected — driver will attempt to reconnect");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("✅ MongoDB reconnected successfully");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB connection error", {
        message: err.message,
      });
    });

  } catch (error) {
    logger.error("❌ MongoDB connection failed", { message: error.message });
    process.exit(1);
  }
};

export default connectDB;

