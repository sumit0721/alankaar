import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { getModel } from "../utils/geminiClient.js";
import Product from "../models/Product.js";
import { logger } from "../utils/logger.js";

const callGeminiSafely = async (fn, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const msg = error?.message || "";
      const status = error?.status || error?.response?.status || error?.httpErrorCode || error?.httpStatus;
      const isRetryable = status === 503 || status === 429 || msg.includes("503") || msg.includes("429") || msg.includes("overloaded") || msg.includes("Resource has been exhausted");

      if (isRetryable && attempt < retries) {
        const delay = attempt * 1500; // 1.5s, 3s, 4.5s
        logger.warn(`Gemini API call failed with status ${status} on attempt ${attempt}. Retrying in ${delay}ms...`, {
          message: msg,
          status,
          attempt
        });
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      // Log the full error details on final failure
      logger.error("Gemini API call failed permanently after all retries", {
        message: msg,
        status,
        errorName: error?.name,
        errorCode: error?.code,
        keys: Object.keys(error || {}),
        stack: error?.stack?.split("\n").slice(0, 3).join("\n"),
      });

      let userMessage = "AI request failed. Please try again.";
      let statusCode = 500;

      if (status === 429 || msg.includes("429") || msg.includes("Resource has been exhausted")) {
        userMessage = "You've hit the AI request limit. Please wait a minute and try again.";
        statusCode = 429;
      } else if (status === 503 || msg.includes("503") || msg.includes("overloaded")) {
        userMessage = "AI service is under high load. Please try again in 30 seconds.";
        statusCode = 503;
      } else if (msg.includes("DEADLINE_EXCEEDED") || msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
        userMessage = "AI service took too long to respond. Please try again.";
        statusCode = 504;
      }

      throw new ApiError(statusCode, userMessage);
    }
  }
};

// ============================================
// FEATURE 1 — BEAUTY ADVISOR CHAT
// ============================================

export const beautyAdvisorChat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError(400, "Message is required.");
  }

  // Fetch current product catalog to ground the AI in real products only
  const products = await Product.find({})
    .select("name category price skinType gender _id")
    .limit(30)
    .lean();

  const catalogSummary = products
    .map(p => `${p.name}|${p.category}|₹${p.price}|${p.skinType || "All"}|${p._id}`)
    .join("\n");

  const systemPrompt = `You are Aanya, ALANKAAR's friendly and knowledgeable AI beauty advisor specializing in skincare, haircare, makeup and grooming.

Your personality: warm, helpful, enthusiastic about beauty. Give thorough, actionable advice.

Rules:
- Give complete, helpful answers. Use as many sentences as needed (typically 3-8 sentences).
- ALWAYS recommend specific products from the catalog when relevant.
- When mentioning a product, ALWAYS use this exact format: [PRODUCT:ProductName:ProductID]
  Example: I recommend [PRODUCT:Rose Glow Serum:665abc123def456] for your skin.
- Never invent products not in the catalog.
- For non-beauty questions, politely redirect.
- You can mention: products page at /products, skin quiz at /skin-quiz, orders at /orders.

ALANKAAR Product Catalog (name|category|price|skinType|id):
${catalogSummary}`;

  // Build conversation history for multi-turn context (keep last 10 messages)
  const trimmedHistory = (history || []).slice(-10);
  const conversationHistory = trimmedHistory.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // Pass systemInstruction natively for much stronger compliance
  const model = getModel({ systemInstruction: systemPrompt });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Hi! I'm Aanya, your ALANKAAR beauty advisor. I'm here to help you find the perfect products and build your ideal routine. What can I help you with today?",
          },
        ],
      },
      ...conversationHistory,
    ],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
      thinkingConfig: {
        thinkingBudget: 1024,
      },
    },
  });

  const result = await callGeminiSafely(() => chat.sendMessage(message));
  const reply = result.response.text();

  res.status(200).json({
    success: true,
    data: { reply },
  });
});

// ============================================
// FEATURE 2 — SKIN QUIZ ROUTINE BUILDER
// ============================================

export const generateRoutine = asyncHandler(async (req, res) => {
  const { skinType, mainConcern, budget, routinePreference, ageGroup } =
    req.body;

  if (!skinType || !mainConcern || !budget || !routinePreference || !ageGroup) {
    throw new ApiError(400, "All quiz answers are required.");
  }

  // Fetch all products then filter to user's budget range
  const products = await Product.find({})
    .select("name category price description skinType gender tags featured")
    .lean();

  const budgetMap = {
    "under-500": 500,
    "500-1000": 1000,
    "1000-plus": 99999,
  };
  const maxBudget = budgetMap[budget] || 99999;

  const affordableProducts = products
    .filter((p) => p.price <= maxBudget)
    .slice(0, 20); // Hard cap — never send more than 20 products

  const catalogSummary = affordableProducts
    .map(p => `${p.name}|${p.category}|₹${p.price}|${p._id}`)
    .join("\n");

  const prompt = `You are an expert skincare and beauty consultant for ALANKAAR, an Indian cosmetics brand.

A customer has completed the following skin assessment:
- Skin/Hair Type: ${skinType}
- Main Concern: ${mainConcern}
- Budget: ${budget === "under-500" ? "Under ₹500 per product" : budget === "500-1000" ? "₹500–₹1000 per product" : "Above ₹1000 per product"}
- Routine Preference: ${routinePreference}
- Age Group: ${ageGroup}

Available ALANKAAR Products within their budget (name|category|price|id):
${catalogSummary}

Create a personalised routine using ONLY products from the list above. If a step has no suitable product, skip that step entirely rather than inventing products.

Respond with ONLY valid JSON in this exact format:
{
  "summary": "A 2-3 sentence personalised summary of their skin profile and what this routine focuses on",
  "morning": [
    {
      "step": 1,
      "productName": "exact product name from catalog",
      "productId": "exact _id from catalog",
      "category": "product category",
      "price": 299,
      "instruction": "specific how-to-use instruction for their skin type (1-2 sentences)"
    }
  ],
  "evening": [
    {
      "step": 1,
      "productName": "exact product name from catalog",
      "productId": "exact _id from catalog",
      "category": "product category",
      "price": 299,
      "instruction": "specific how-to-use instruction for their skin type (1-2 sentences)"
    }
  ],
  "tip": "one personalised pro tip for their specific concern"
}`;

  const model = getModel({
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      temperature: 0.3,
      thinkingConfig: {
        thinkingBudget: 1024,
      },
    },
  });

  const result = await callGeminiSafely(() => model.generateContent(prompt));
  const rawText = result.response.text();

  let routine;
  try {
    // Try direct parse first
    routine = JSON.parse(rawText);
  } catch {
    // Sometimes Gemini wraps JSON in markdown code fences — strip them and retry
    try {
      const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      routine = JSON.parse(cleaned);
    } catch (err) {
      logger.error("JSON parsing error on Gemini routine response", { rawText, error: err.message });
      throw new ApiError(
        500,
        "Failed to parse routine from AI. Please try again."
      );
    }
  }

  res.status(200).json({
    success: true,
    data: routine,
  });
});

// ============================================
// FEATURE 3 — ADMIN AI DESCRIPTION GENERATOR
// ============================================

export const generateProductDescription = asyncHandler(async (req, res) => {
  const { productName, category } = req.body;

  if (!productName || !category) {
    throw new ApiError(400, "Product name and category are required.");
  }

  const prompt = `You are a product catalog manager for ALANKAAR, a modern Indian cosmetics brand known for clean formulas, botanical ingredients, and editorial softness.

Generate realistic product details based on the provided name and category:
- Product Name: ${productName}
- Category: ${category}

Generate appropriate values that suit a cosmetic product of this type in the Indian market:
1. Price: A realistic retail price in Indian Rupees (₹), typically between 150 and 800 (as a number, do not include the ₹ symbol).
2. Stock (countInStock): A realistic initial stock number (typically between 30 and 120).
3. Skin/Hair Type (skinType): Choose the most relevant type for this product from: "All Types", "Oily Skin", "Dry Skin", "Combination Skin", "Sensitive Skin", "Normal Skin", "All Hair Types", "Oily Hair", "Dry Hair", "Damaged Hair", "Curly Hair".
4. For (gender): Choose from: "Unisex", "Women", "Men".
5. Tags (tags): A comma-separated list of 3-5 keywords related to ingredients, benefits, or use cases.
6. Description: A compelling product description of exactly 2 sentences. The first sentence should describe what the product does and its key benefit. The second sentence should describe its texture, feel, or how it fits into a beauty routine. Tone should be warm, modern, and confident. Do not include the product name in the description.

Respond with ONLY valid JSON in this exact format with no markdown, no code blocks, no extra text:
{
  "description": "product description here",
  "price": 299,
  "countInStock": 50,
  "skinType": "All Types",
  "gender": "Unisex",
  "tags": "tag1, tag2, tag3"
}`;

  const model = getModel({
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
      temperature: 0.3,
      thinkingConfig: {
        thinkingBudget: 512,
      },
    },
  });

  const result = await callGeminiSafely(() => model.generateContent(prompt));
  const rawText = result.response.text();

  let details;
  try {
    details = JSON.parse(rawText);
  } catch (err) {
    logger.error("JSON parsing error on product details generator response", { rawText, error: err.message });
    throw new ApiError(
      500,
      "Failed to parse product details from AI. Please try again."
    );
  }

  res.status(200).json({
    success: true,
    data: details,
  });
});
