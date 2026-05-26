import api from "./api.js";

export const getProducts = (params = {}) => api.get("/products", { params });

export const getProductById = (productId) => api.get(`/products/${productId}`);

export const createProduct = (payload) => api.post("/products", payload);

export const updateProduct = (productId, payload) => api.put(`/products/${productId}`, payload);

export const deleteProduct = (productId) => api.delete(`/products/${productId}`);
