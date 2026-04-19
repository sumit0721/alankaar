import express from "express";

import {
  addItemToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getCart).post(addItemToCart).delete(clearCart);
router.route("/:productId").put(updateCartItemQuantity).delete(removeCartItem);

export default router;
