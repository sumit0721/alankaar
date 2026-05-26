import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const allowedClientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (origin === allowedClientOrigin) {
    return true;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// Rate limiting to prevent abuse (significantly higher limits in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 10000, // Limit each IP to 100 requests (production) or 10,000 requests (development)
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 50 : 5000, // Stricter in production, high in dev to prevent blocking dev reloads
  message: "Too many login attempts, please try again later.",
});

// ============================================
// CORS & BODY PARSING
// ============================================

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// HTTP logging
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

// Body parsing middleware
app.use(express.json({ limit: "50mb" })); // Limit payload to prevent abuse
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES
// ============================================

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFound);
app.use(errorHandler);

export default app;
