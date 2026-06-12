import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { getModel } from "../utils/geminiClient.js";
import Product from "../models/Product.js";
import { logger } from "../utils/logger.js";

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
    .select("name category price description skinType gender tags")
    .limit(50)
    .lean();

  const catalogSummary = products
    .map(
      (p) =>
        `- ${p.name} (${p.category}, ₹${p.price}${p.skinType ? ", " + p.skinType : ""}${p.gender && p.gender !== "Unisex" ? ", for " + p.gender : ""}): ${p.description?.slice(0, 80)}`
    )
    .join("\n");

  const systemPrompt = `You are Aanya, ALANKAAR's friendly and knowledgeable AI beauty advisor. ALANKAAR is a modern Indian cosmetics brand with products for both men and women covering skincare, haircare, makeup, grooming, and body care.

Your role:
- Give helpful, friendly, and personalised beauty advice.
- Answer questions about ALANKAAR (like its products, brand values, or shipping/returns policy).
- Recommend specific ALANKAAR products from the catalog below whenever relevant. Always list the exact product name and price.
- Keep responses concise — 3 to 5 sentences maximum.
- When recommending products, explicitly state the product name and price (e.g. "Beard Growth Oil (₹449)").
- If the user asks about men's products specifically, recommend Men or Unisex products from the catalog (such as "Men's Oil Control Face Wash (₹299)" or "Beard Growth Oil (₹449)").
- Respond in a warm, conversational, and helpful tone — not clinical or robotic.
- Never make up or suggest any products that are not present in the catalog below.

ALANKAAR Product Catalog:
${catalogSummary}

Important: Only recommend products from the catalog above. If no product fits perfectly, give general advice and suggest they browse the full collection.`;

  // Build conversation history for multi-turn context
  const conversationHistory = (history || []).map((msg) => ({
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
      maxOutputTokens: 500, // Increased to avoid cutoffs
      temperature: 0.7,
    },
  });

  let result;
  try {
    result = await chat.sendMessage(message);
  } catch (err) {
    logger.error("Gemini API Chat failed", { message: err.message, stack: err.stack });
    throw new ApiError(
      503,
      "Aanya is currently busy assisting other customers. Please try sending your message again in a moment."
    );
  }
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

  const affordableProducts = products.filter((p) => p.price <= maxBudget);

  const catalogSummary = affordableProducts
    .map(
      (p) =>
        `- ${p.name} (${p.category}, ₹${p.price}, ${p.skinType || "All Types"}): ${p.description?.slice(0, 100)}`
    )
    .join("\n");

  const prompt = `You are an expert skincare and beauty consultant for ALANKAAR, an Indian cosmetics brand.

A customer has completed the following skin assessment:
- Skin/Hair Type: ${skinType}
- Main Concern: ${mainConcern}
- Budget: ${budget === "under-500" ? "Under ₹500 per product" : budget === "500-1000" ? "₹500–₹1000 per product" : "Above ₹1000 per product"}
- Routine Preference: ${routinePreference}
- Age Group: ${ageGroup}

Available ALANKAAR Products (within their budget):
${catalogSummary}

Create a personalised routine using ONLY products from the list above. If a step has no suitable product, skip that step rather than inventing products.

Respond with ONLY valid JSON in this exact format with no markdown, no code blocks, no extra text:
{
  "summary": "2 sentence personalised summary of their skin profile and what their routine focuses on",
  "morning": [
    {
      "step": 1,
      "productName": "exact product name from catalog",
      "category": "product category",
      "price": 000,
      "instruction": "specific how-to-use instruction for their skin type"
    }
  ],
  "evening": [
    {
      "step": 1,
      "productName": "exact product name from catalog",
      "category": "product category",
      "price": 000,
      "instruction": "specific how-to-use instruction for their skin type"
    }
  ],
  "tip": "one personalised pro tip for their specific concern"
}`;

  const model = getModel({
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });
  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err) {
    logger.error("Gemini API generateRoutine failed", { message: err.message, stack: err.stack });
    throw new ApiError(
      503,
      "The routine builder service is currently experiencing high demand. Please try again in a few seconds."
    );
  }
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

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err) {
    logger.error("Gemini API generateProductDetails failed", { message: err.message, stack: err.stack });
    throw new ApiError(
      503,
      "The AI product generator is currently busy. Please try again in a moment."
    );
  }
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
