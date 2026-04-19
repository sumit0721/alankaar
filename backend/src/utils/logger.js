/**
 * Logger Utility
 * Provides structured logging for development and production
 * In production, you can redirect logs to services like Winston, Sentry, etc.
 */

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

const getTimestamp = () => new Date().toISOString();

const log = (level, message, data = null) => {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...(data && { data }),
    environment: process.env.NODE_ENV || "development",
  };

  // In production, you would send this to a logging service
  // For now, we'll console log with colors
  const colorMap = {
    ERROR: "\x1b[31m", // Red
    WARN: "\x1b[33m",  // Yellow
    INFO: "\x1b[36m",  // Cyan
    DEBUG: "\x1b[35m", // Magenta
  };

  const resetColor = "\x1b[0m";
  const color = colorMap[level] || "";

  console.log(
    `${color}[${logEntry.timestamp}] ${level}${resetColor}`,
    message,
    data ? JSON.stringify(data, null, 2) : ""
  );
};

export const logger = {
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => {
    if (process.env.NODE_ENV !== "production") {
      log(LOG_LEVELS.DEBUG, message, data);
    }
  },
};
