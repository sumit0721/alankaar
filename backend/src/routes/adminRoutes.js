import express from "express";

import {
  deleteUser,
  getAllOrders,
  getAllUsers,
  getChartData,
  getStats,
  toggleAdminRole,
  toggleUserActive,
  updateOrderStatus,
  getAllReviews,
  deleteReviewAdmin,
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/charts", getChartData);
router.get("/users", getAllUsers);
router.delete("/users/:userId", deleteUser);
router.patch("/users/:userId/role", toggleAdminRole);
router.patch("/users/:userId/active", toggleUserActive);
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.get("/reviews", getAllReviews);
router.delete("/reviews/:reviewId", deleteReviewAdmin);

export default router;
