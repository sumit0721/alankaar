import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

console.log("Testing MongoDB connection...");
console.log("URI exists:", !!process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log("✅ Connected to MongoDB");
  mongoose.disconnect();
  process.exit(0);
})
.catch((err) => {
  console.log("❌ MongoDB error:", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log("❌ Connection timeout");
  process.exit(1);
}, 10000);
