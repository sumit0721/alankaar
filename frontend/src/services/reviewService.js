import api from "./api.js";

export const getProductReviews = (productId) => api.get(`/reviews/${productId}`);

export const addReview = (productId, payload) => api.post(`/reviews/${productId}`, payload);

export const checkReviewEligibility = (productId) => api.get(`/reviews/${productId}/eligible`);
