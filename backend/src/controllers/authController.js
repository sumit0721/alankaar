import crypto from "crypto";

import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

const buildAuthResponse = (user) => ({
  success: true,
  message: "Authentication successful",
  data: {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    phone: user.phone,
    profilePicture: user.profilePicture,
    token: generateToken(user._id),
  },
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new ApiError(400, "A user with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json({
    ...buildAuthResponse(user),
    message: "User registered successfully",
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  res.status(200).json({
    ...buildAuthResponse(user),
    message: "Login successful",
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// ============================================
// FORGOT / RESET PASSWORD
// ============================================

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return generic success to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // Build reset URL
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "ALANKAAR — Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#be6a4a;color:#fff;text-decoration:none;border-radius:8px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  } catch (emailError) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    throw new ApiError(500, "Failed to send reset email. Please try again later.");
  }

  res.status(200).json({
    success: true,
    message: "If that email is registered, a reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters.");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token.");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully.",
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required.");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters.");
  }

  const user = await User.findById(req.user._id);

  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
});

// ============================================
// PROFILE
// ============================================

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, profilePicture } = req.body;
  const user = await User.findById(req.user._id);

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin,
    },
  });
});

// ============================================
// WISHLIST
// ============================================

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "name price image category rating numReviews countInStock featured"
  );

  res.status(200).json({
    success: true,
    data: user.wishlist,
  });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Added to wishlist.",
    data: user.wishlist,
  });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId
  );
  await user.save();

  res.status(200).json({
    success: true,
    message: "Removed from wishlist.",
    data: user.wishlist,
  });
});

// ============================================
// SAVED ADDRESSES
// ============================================

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { label, fullName, addressLine1, city, state, postalCode, country, phone, isDefault } = req.body;

  if (!fullName || !addressLine1 || !city || !state || !postalCode || !country) {
    throw new ApiError(400, "All address fields are required.");
  }

  // If setting new address as default, unset the current default
  if (isDefault) {
    user.savedAddresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  // If this is the first address, make it default automatically
  const shouldBeDefault = user.savedAddresses.length === 0 ? true : !!isDefault;

  user.savedAddresses.push({
    label: label || "Home",
    fullName,
    addressLine1,
    city,
    state,
    postalCode,
    country,
    phone: phone || "",
    isDefault: shouldBeDefault,
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: "Address added successfully.",
    data: user.savedAddresses,
  });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  const address = user.savedAddresses.id(addressId);

  if (!address) {
    throw new ApiError(404, "Address not found.");
  }

  const fields = ["label", "fullName", "addressLine1", "city", "state", "postalCode", "country", "phone", "isDefault"];

  if (req.body.isDefault) {
    user.savedAddresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      address[field] = req.body[field];
    }
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Address updated successfully.",
    data: user.savedAddresses,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  const addressIndex = user.savedAddresses.findIndex(
    (addr) => addr._id.toString() === addressId
  );

  if (addressIndex === -1) {
    throw new ApiError(404, "Address not found.");
  }

  user.savedAddresses.splice(addressIndex, 1);

  // If deleted address was default and there are remaining addresses, make the first one default
  if (user.savedAddresses.length > 0 && !user.savedAddresses.some((a) => a.isDefault)) {
    user.savedAddresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Address deleted successfully.",
    data: user.savedAddresses,
  });
});
