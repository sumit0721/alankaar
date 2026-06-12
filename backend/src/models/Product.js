import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "ALANKAAR",
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    skinType: {
      type: String,
      default: "All Types",
    },
    tags: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ["Unisex", "Women", "Men"],
      default: "Unisex",
    },
    images: {
      type: [String],
      default: [],
    },
    variants: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        inStock: { type: Boolean, default: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ── Query performance indexes ──────────────────────────────────────────
// These indexes prevent full collection scans on the most common queries.
// They are created once by MongoDB when the app starts; no ongoing overhead.
productSchema.index({ featured: 1 });           // Home page featured filter
productSchema.index({ category: 1 });           // Category filter
productSchema.index({ rating: -1 });            // Top-rated sort
productSchema.index({ numReviews: -1 });        // Popular sort
productSchema.index({ price: 1 });              // Price sort
productSchema.index({ countInStock: 1 });       // Stock filter + low-stock admin view

const Product = mongoose.model("Product", productSchema);

export default Product;

