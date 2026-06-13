import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { getModel } from "../utils/geminiClient.js";
import Product from "../models/Product.js";
import { logger } from "../utils/logger.js";

const callGeminiSafely = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    const msg = error?.message || "";
    const status = error?.status || error?.response?.status;
    if (status === 429 || msg.includes("429") || msg.includes("quota") || msg.includes("rate")) {
      throw new ApiError(429, "AI service is busy. Please wait 10 seconds and try again.");
    }
    if (status === 503 || msg.includes("503") || msg.includes("overloaded")) {
      throw new ApiError(503, "AI service is temporarily unavailable. Please try again in a moment.");
    }
    console.error("Gemini error:", msg);
    throw new ApiError(500, "AI request failed. Please try again.");
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

  const systemPrompt = `You are Aanya, ALANKAAR's AI beauty advisor for skincare, haircare, makeup and grooming.

Rules:
- Max 4 sentences per reply
- Only recommend products from catalog below
- Format product recommendations as: [PRODUCT:ProductName:ProductID]
- Redirect non-beauty questions politely
- Website info: products at /products, skin quiz at /skin-quiz, orders at /orders

Catalog (name|category|price|skinType|id):
${catalogSummary}`;

  // Build conversation history for multi-turn context (keep last 6 messages only)
  const trimmedHistory = (history || []).slice(-6);
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
      maxOutputTokens: 500,
      temperature: 0.7,
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

  const prompt = `Beauty consultant for ALANKAAR cosmetics.

Customer: skin=${skinType}, concern=${mainConcern}, budget=${budget}, routine=${routinePreference}, age=${ageGroup}

Products (name|category|price|id):
${catalogSummary}

Build a personalised routine using ONLY products above. Skip steps with no match.

Respond ONLY in valid JSON, no markdown, no code blocks:
{
  "summary": "2 sentence summary",
  "morning": [{"step":1,"productName":"exact name","productId":"id","category":"cat","price":0,"instruction":"specific instruction"}],
  "evening": [{"step":1,"productName":"exact name","productId":"id","category":"cat","price":0,"instruction":"specific instruction"}],
  "tip": "one pro tip"
}`;

  const model = getModel({
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const result = await callGeminiSafely(() => model.generateContent(prompt));
  const rawText = result.response.text();

  let routine;
  try {
    routine = JSON.parse(rawText);
  } catch (err) {
    logger.error("JSON parsing error on Gemini response", { rawText, error: err.message });
    throw new ApiError(
      500,
      "Failed to parse routine from AI. Please try again."
    );
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
      temperature: 0.3,
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
