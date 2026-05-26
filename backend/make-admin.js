import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

// Load env vars
dotenv.config();

const makeAdmin = async () => {
  try {
    const email = process.argv[2];

    if (!email) {
      console.error("Please provide an email address.");
      console.error("Usage: node make-admin.js <email>");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`Success! User ${email} is now an admin.`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
};

makeAdmin();
