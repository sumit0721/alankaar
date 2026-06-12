import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Singleton pattern ────────────────────────────────────────────────────────
// One instance is shared across all requests. Initialised lazily on the first
// call so the missing-key error surfaces at request time, not at server start,
// giving a clean 500 with an actionable message rather than a crash loop.
let genAI = null;

const getGeminiClient = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set in environment variables. " +
          "Add it to backend/.env (local) and to Render environment variables (production)."
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export const getModel = (config = {}) => {
  return getGeminiClient().getGenerativeModel({
    model: "gemini-2.5-flash",
    ...config,
  });
};
