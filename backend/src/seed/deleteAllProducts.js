import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function deleteAllProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const result = await mongoose.connection.collection("products").deleteMany({});
    console.log(`Deleted ${result.deletedCount} products from database`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

deleteAllProducts();
