import { createContext, useContext, useEffect, useState } from "react";

import {
  addCartItem,
  clearCartItems,
  getCart,
  removeCartItem as removeCartItemRequest,
  updateCartItemQuantity as updateCartItemQuantityRequest,
} from "../services/cartService.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);
const initialCartState = {
  cartItems: [],
  itemsPrice: 0,
  totalQuantity: 0,
};

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

const normalizeCartState = (payload) => ({
  cartItems: (payload?.items || []).map((item) => ({
    id: item.product,
    productId: item.product,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
  })),
  itemsPrice: payload?.itemsPrice || 0,
  totalQuantity: payload?.totalQuantity || 0,
});

export function CartProvider({ children }) {
  const { user, authLoading } = useAuth();
  const [cartState, setCartState] = useState(initialCartState);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  const fetchCart = async () => {
    if (!user) {
      setCartState(initialCartState);
      setCartLoading(false);
      return;
    }

    try {
      setCartLoading(true);
      setCartError("");
      const response = await getCart();
      setCartState(normalizeCartState(response.data.data));
    } catch (error) {
      setCartError(getErrorMessage(error, "Unable to load your cart right now."));
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    fetchCart();
  }, [user, authLoading]);

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      throw new Error("Please login to add items to your cart.");
    }

    try {
      setCartError("");
      const productId = product._id || product.id || product.productId;
      const response = await addCartItem({ productId, quantity });
      const nextState = normalizeCartState(response.data.data);
      setCartState(nextState);
      return nextState;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to add this item to your cart.");
      setCartError(message);
      throw new Error(message);
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      setCartError("");
      const response = await updateCartItemQuantityRequest(productId, { quantity });
      const nextState = normalizeCartState(response.data.data);
      setCartState(nextState);
      return nextState;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update cart item quantity.");
      setCartError(message);
      throw new Error(message);
    }
  };

  const removeCartItem = async (productId) => {
    try {
      setCartError("");
      const response = await removeCartItemRequest(productId);
      const nextState = normalizeCartState(response.data.data);
      setCartState(nextState);
      return nextState;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to remove this item from the cart.");
      setCartError(message);
      throw new Error(message);
    }
  };

  const clearCart = async () => {
    try {
      setCartError("");
      const response = await clearCartItems();
      const nextState = normalizeCartState(response.data.data);
      setCartState(nextState);
      return nextState;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to clear the cart right now.");
      setCartError(message);
      throw new Error(message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...cartState,
        totalAmount: cartState.itemsPrice,
        cartLoading,
        cartError,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
