import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cascade order: best quality first, high-quota safety net last
const MODEL_CASCADE = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",  // 500 RPD — last resort safety net
];

// Single model call with 503 retry (server overload, not quota)
async function callWithRetry(model, promptFn, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await promptFn(model);
    } catch (error) {
      const msg = error?.message || "";
      const status = error?.status || error?.response?.status || error?.httpErrorCode || error?.httpStatus;
      const isRetryable503 = status === 503 || msg.includes("503") || msg.includes("overloaded");

      if (isRetryable503 && attempt < retries) {
        const delay = attempt * 1500;
        console.warn(`[Gemini] 503 on attempt ${attempt}, retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
}

// Main export — cascades through all models on quota errors
export async function callGeminiWithFallback(promptFn, config = {}) {
  let lastError = null;

  for (const modelName of MODEL_CASCADE) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, ...config });
      const result = await callWithRetry(model, promptFn);
      
      // Log which model actually served the request (useful for monitoring)
      if (modelName !== MODEL_CASCADE[0]) {
        console.info(`[Gemini] Served by fallback model: ${modelName}`);
      }
      
      return result;
    } catch (error) {
      const msg = error?.message || "";
      const status = error?.status || error?.response?.status || error?.httpErrorCode || error?.httpStatus;
      const isQuotaOrOverload = status === 429 || status === 503 || msg.includes("429") || msg.includes("503") || msg.includes("Resource has been exhausted") || msg.includes("overloaded");

      if (isQuotaOrOverload) {
        // Quota or overload — try next model
        console.warn(`[Gemini] ${modelName} returned status/error: ${status || msg}, moving to next model...`);
        lastError = error;
        continue;
      }

      // Hard error (400 bad request, 401 auth, malformed prompt) — 
      // don't cascade, surface immediately
      console.error(`[Gemini] Hard error from ${modelName}:`, error?.message);
      throw error;
    }
  }

  // All 5 models exhausted
  console.error("[Gemini] All models exhausted.");
  const err = new Error(
    "Our AI is at capacity right now. Please try again in a few minutes."
  );
  err.statusCode = 503;
  throw err;
}

// Legacy export — keeps backward compat if any file imports getModel() directly
export function getModel(modelName = MODEL_CASCADE[0]) {
  return genAI.getGenerativeModel({ model: modelName });
}
