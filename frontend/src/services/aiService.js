import api from "./api.js";

export const sendBeautyAdvisorMessage = (payload) =>
  api.post("/ai/chat", payload);

export const generateSkinRoutine = (payload) =>
  api.post("/ai/routine", payload);

export const generateDescription = (payload) =>
  api.post("/ai/generate-description", payload);
