import api from "./api.js";

export const getCart = () => api.get("/cart");

export const addCartItem = (payload) => api.post("/cart", payload);

export const updateCartItemQuantity = (productId, payload) =>
  api.put(`/cart/${productId}`, payload);

export const removeCartItem = (productId) => api.delete(`/cart/${productId}`);

export const clearCartItems = () => api.delete("/cart");
