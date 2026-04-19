import ApiError from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== "production";

  // Log the error for debugging
  if (statusCode >= 500) {
    logger.error(`Server Error: ${err.message}`, {
      statusCode,
      url: req.originalUrl,
      method: req.method,
      stack: err.stack,
    });
  } else {
    logger.warn(`Client Error: ${err.message}`, {
      statusCode,
      url: req.originalUrl,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};
