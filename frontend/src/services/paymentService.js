import api from "./api.js";

export const createRazorpayOrder = (payload) => api.post("/payments/razorpay/order", payload);

export const verifyRazorpayPayment = (payload) => api.post("/payments/razorpay/verify", payload);
