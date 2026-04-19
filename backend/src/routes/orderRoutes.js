import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  markOrderAsPaid,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/my-orders", getMyOrders);
router.post("/", createOrder);
router.get("/:orderId", getOrderById);
router.put("/:orderId/pay", markOrderAsPaid);

export default router;
