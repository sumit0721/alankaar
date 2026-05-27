import Newsletter from "../models/Newsletter.js";
import asyncHandler from "../utils/asyncHandler.js";

export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  try {
    await Newsletter.create({ email });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "You're already subscribed!",
      });
    }
    throw error;
  }

  res.status(201).json({
    success: true,
    message: "Successfully subscribed to the newsletter!",
  });
});
