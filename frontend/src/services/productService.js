import api from "./api.js";

export const getProducts = (params = {}) => api.get("/products", { params });

export const getProductById = (productId) => api.get(`/products/${productId}`);
