import api from "./api.js";

export const getNotifications = () => api.get("/notifications");
export const markOneRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = () => api.put("/notifications/read-all");
