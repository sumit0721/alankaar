import express from "express";
import {
  beautyAdvisorChat,
  generateRoutine,
  generateProductDescription,
} from "../controllers/aiController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Beauty advisor — public (guests can use it too)
router.post("/chat", beautyAdvisorChat);

// Skin quiz routine builder — public
router.post("/routine", generateRoutine);

// Admin description generator — admin only
router.post("/generate-description", protect, adminOnly, generateProductDescription);

export default router;
