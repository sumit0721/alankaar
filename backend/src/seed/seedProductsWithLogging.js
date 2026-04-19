import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const logFile = path.join(process.cwd(), "seed-log.txt");

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
}

dotenv.config();

const seedProducts = async () => {
  try {
    log("Starting seed process...");
    log("MONGODB_URI present: " + (!!process.env.MONGODB_URI));

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    log("✅ Connected to MongoDB");

    const deleteResult = await mongoose.connection.collection("products").deleteMany({});
    log(`✅ Deleted ${deleteResult.deletedCount} products`);

    const { default: sampleProducts } = await import("./sampleProducts.js");
    log(`✅ Loaded ${sampleProducts.length} sample products`);

    const insertResult = await mongoose.connection.collection("products").insertMany(sampleProducts);
    log(`✅ Inserted ${insertResult.insertedIds.length} new products`);

    await mongoose.disconnect();
    log("✅ Disconnected from MongoDB");
    log("✅ Seed process completed successfully");
    process.exit(0);
  } catch (error) {
    log("❌ ERROR: " + error.message);
    log("Stack: " + error.stack);
    process.exit(1);
  }
};

seedProducts();
