import api from "./api.js";

export const createOrder = (payload) => api.post("/orders", payload);

export const getMyOrders = () => api.get("/orders/my-orders");

export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);
