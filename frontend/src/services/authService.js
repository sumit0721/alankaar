import api from "./api.js";

export const registerUser = (payload) => api.post("/auth/register", payload);

export const loginUser = (payload) => api.post("/auth/login", payload);

export const getCurrentUser = () => api.get("/auth/me");

// Password reset
export const forgotPassword = (payload) => api.post("/auth/forgot-password", payload);

export const resetPassword = (token, payload) => api.post(`/auth/reset-password/${token}`, payload);

export const changePassword = (payload) => api.put("/auth/change-password", payload);

// Profile
export const updateProfile = (payload) => api.put("/auth/profile", payload);

// Wishlist
export const getWishlist = () => api.get("/auth/wishlist");

export const addToWishlist = (productId) => api.post(`/auth/wishlist/${productId}`);

export const removeFromWishlist = (productId) => api.delete(`/auth/wishlist/${productId}`);

// Address book
export const addAddress = (payload) => api.post("/auth/addresses", payload);

export const updateAddress = (addressId, payload) => api.put(`/auth/addresses/${addressId}`, payload);

export const deleteAddress = (addressId) => api.delete(`/auth/addresses/${addressId}`);
