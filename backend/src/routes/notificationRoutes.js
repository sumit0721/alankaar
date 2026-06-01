import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { sseConnect } from "../controllers/sseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/stream", sseConnect);
router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:notificationId/read", markAsRead);

export default router;
