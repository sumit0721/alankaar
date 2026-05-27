import api from "./api.js";

export const subscribeNewsletter = (payload) => api.post("/newsletter/subscribe", payload);
