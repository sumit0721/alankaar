import api from "./api.js";

export const getAdminStats = () => api.get("/admin/stats");

export const getAdminCharts = () => api.get("/admin/charts");

export const getAdminUsers = (params) => api.get("/admin/users", { params });

export const deleteAdminUser = (userId) => api.delete(`/admin/users/${userId}`);

export const toggleAdminRole = (userId) => api.patch(`/admin/users/${userId}/role`);

export const toggleUserActive = (userId) => api.patch(`/admin/users/${userId}/active`);

export const getAdminOrders = (params) => api.get("/admin/orders", { params });

export const updateAdminOrderStatus = (orderId, status) =>
  api.patch(`/admin/orders/${orderId}/status`, { status });
