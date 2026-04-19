import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const seedProducts = async () => {
  const timeout = setTimeout(() => {
    console.error("Timeout: MongoDB connection took too long");
    process.exit(1);
  }, 10000);

  try {
    // Direct MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log("Connected to MongoDB");

    // Delete all existing products
    const deleteResult = await mongoose.connection.collection("products").deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} products`);

    // Import products after connection
    const { default: sampleProducts } = await import("./sampleProducts.js");

    // Insert new products
    const insertResult = await mongoose.connection.collection("products").insertMany(sampleProducts);
    console.log(`Inserted ${insertResult.insertedIds.length} new products`);

    console.log("✅ Sample products seeded successfully");
    clearTimeout(timeout);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed products:", error.message);
    clearTimeout(timeout);
    process.exit(1);
  }
};

seedProducts();
