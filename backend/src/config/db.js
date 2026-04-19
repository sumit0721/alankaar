import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI || mongoURI === "PASTE_YOUR_MONGODB_ATLAS_URI_HERE") {
      throw new Error(
        "MONGODB_URI is missing. Paste your MongoDB Atlas connection string into backend/.env before starting the backend."
      );
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
