import express from "express";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

// Password reset (public)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.put("/change-password", protect, changePassword);
router.put("/profile", protect, updateProfile);

// Wishlist
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, addToWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

// Address book
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

export default router;
