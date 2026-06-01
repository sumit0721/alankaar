import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // Primary: Authorization Bearer header (all normal API calls)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Fallback: query param token (SSE only — EventSource cannot set headers)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    throw new ApiError(401, "Not authorized. Token is missing.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new ApiError(401, "User linked to this token was not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      throw new ApiError(401, "Invalid or expired token.");
    }
    throw error;
  }
});

export const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return next(new ApiError(403, "Admin access only."));
  }
  next();
};
