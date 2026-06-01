import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import sampleProducts from "./sampleProducts.js";

dotenv.config();

const clearAndSeed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    
    console.log("Clearing all products from database...");
    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} products`);

    console.log("Inserting fresh products...");
    await Product.insertMany(sampleProducts);
    console.log(`Successfully inserted ${sampleProducts.length} products`);
    
    console.log("✅ Database cleared and reseeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during clear and seed:", error.message);
    process.exit(1);
  }
};

clearAndSeed();
