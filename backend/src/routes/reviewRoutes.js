import express from "express";

import {
  getProductReviews,
  addReview,
  checkReviewEligibility,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:productId", getProductReviews);
router.get("/:productId/eligible", protect, checkReviewEligibility);
router.post("/:productId", protect, addReview);

export default router;
