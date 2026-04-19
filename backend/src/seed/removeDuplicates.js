import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const removeProductDuplicates = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected");

    const db = mongoose.connection.db;
    const products = db.collection("products");

    // Find duplicate products by name
    const duplicates = await products.aggregate([
      {
        $group: {
          _id: "$name",
          ids: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();

    console.log(`Found ${duplicates.length} product names with duplicates`);

    // For each duplicate group, keep first and delete rest
    for (const dup of duplicates) {
      const idsToDelete = dup.ids.slice(1); // Keep first, delete the rest
      const result = await products.deleteMany({
        _id: { $in: idsToDelete }
      });
      console.log(`Deleted ${result.deletedCount} duplicate(s) of "${dup._id}"`);
    }

    // Count total remaining products
    const totalProducts = await products.countDocuments();
    console.log(`\n✅ Cleanup complete! Total products: ${totalProducts}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

removeProductDuplicates();
