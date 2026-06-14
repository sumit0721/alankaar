import api from "./api.js";

// AI endpoints use a longer timeout because Gemini 2.5 Flash (thinking model)
// can take 20-40 seconds to generate responses, especially for structured JSON.
// The default api.js has a 15s timeout which is too short for AI calls.
const AI_TIMEOUT = 60000; // 60 seconds

export const sendBeautyAdvisorMessage = (payload) =>
  api.post("/ai/chat", payload, { timeout: AI_TIMEOUT });

export const generateSkinRoutine = (payload) =>
  api.post("/ai/routine", payload, { timeout: AI_TIMEOUT });

export const generateDescription = (payload) =>
  api.post("/ai/generate-description", payload, { timeout: AI_TIMEOUT });
