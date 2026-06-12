import { useEffect, useState } from "react";
import { getFallbackImage } from "../../utils/fallbackImages.js";
import { generateDescription } from "../../services/aiService.js";

const CATEGORY_GROUPS = [
  {
    label: "Legacy",
    options: ["Skincare", "Makeup"],
  },
  {
    label: "Face",
    options: [
      "Lipstick", "Lip Gloss", "Lip Liner", "Foundation", "Concealer",
      "Blush", "Highlighter", "Eyeshadow", "Eyeliner", "Mascara",
      "Eyebrow", "Setting Spray", "Face Primer", "Contour",
    ],
  },
  {
    label: "Skin",
    options: [
      "Face Serum", "Face Moisturiser", "Face Wash", "Face Scrub",
      "Face Mask", "Sunscreen", "Toner", "Eye Cream",
    ],
  },
  {
    label: "Hair",
    options: [
      "Shampoo", "Conditioner", "Hair Mask", "Hair Serum",
      "Hair Oil", "Hair Colour", "Dry Shampoo", "Styling Gel",
      "Hair Spray", "Heat Protectant",
    ],
  },
  {
    label: "Body",
    options: [
      "Body Lotion", "Body Scrub", "Body Wash", "Deodorant",
      "Perfume", "Hand Cream", "Foot Cream", "Stretch Mark Cream",
    ],
  },
  {
    label: "Men Grooming",
    options: [
      "Beard Oil", "Beard Balm", "Shaving Cream", "After Shave",
      "Men Face Wash", "Men Moisturiser", "Men Sunscreen",
    ],
  },
  {
    label: "Wellness",
    options: [
      "Nail Polish", "Nail Care", "Lip Balm", "Makeup Remover",
      "Micellar Water", "Bath Salt",
    ],
  },
];

const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((group) => group.options);

const SKIN_TYPES = [
  "All Types", "Oily Skin", "Dry Skin", "Combination Skin",
  "Sensitive Skin", "Normal Skin", "All Hair Types",
  "Oily Hair", "Dry Hair", "Damaged Hair", "Curly Hair",
];

const GENDERS = ["Unisex", "Women", "Men"];

const emptyForm = {
  name: "",
  description: "",
  brand: "ALANKAAR",
  category: "",
  image: "",
  price: "",
  countInStock: "",
  rating: "",
  numReviews: "",
  featured: false,
  skinType: "All Types",
  gender: "Unisex",
  tags: "",
};

function AdminProductForm({ initialProduct, submitLabel, onSubmit, loading }) {
  const [formData, setFormData] = useState(emptyForm);
  const [validationError, setValidationError] = useState("");
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || "",
        description: initialProduct.description || "",
        brand: initialProduct.brand || "ALANKAAR",
        category: initialProduct.category || "",
        image: initialProduct.image || "",
        price: initialProduct.price ?? "",
        countInStock: initialProduct.countInStock ?? "",
        rating: initialProduct.rating ?? "",
        numReviews: initialProduct.numReviews ?? "",
        featured: Boolean(initialProduct.featured),
        skinType: initialProduct.skinType || "All Types",
        gender: initialProduct.gender || "Unisex",
        tags: Array.isArray(initialProduct.tags) ? initialProduct.tags.join(", ") : "",
      });
    }
  }, [initialProduct]);

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.category) {
      setValidationError("Name, description, and category are required.");
      return;
    }

    if (formData.price === "" || Number(formData.price) < 0) {
      setValidationError("Price must be a valid amount.");
      return;
    }

    if (formData.countInStock === "" || Number(formData.countInStock) < 0) {
      setValidationError("Stock must be a valid number.");
      return;
    }

    const parsedTags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      brand: formData.brand.trim() || "ALANKAAR",
      category: formData.category,
      image: formData.image.trim(),
      price: Number(formData.price),
      countInStock: Number(formData.countInStock),
      rating: formData.rating === "" ? 0 : Number(formData.rating),
      numReviews: formData.numReviews === "" ? 0 : Number(formData.numReviews),
      featured: formData.featured,
      skinType: formData.skinType,
      gender: formData.gender,
      tags: parsedTags,
    };

    setValidationError("");
    onSubmit(payload);
  };

  // Check if the current category value exists in the dropdown options
  const categoryInList = ALL_CATEGORIES.includes(formData.category);

  return (
    <form className="admin-product-form" onSubmit={handleSubmit}>
      {validationError ? (
        <p className="status-message error-message">{validationError}</p>
      ) : null}

      <div className="admin-form-grid">
        <label className="form-field">
          <span>Name</span>
          <input
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Hydrating Rose Lip Tint"
          />
        </label>

        <label className="form-field">
          <span>Brand</span>
          <input
            value={formData.brand}
            onChange={(event) => updateField("brand", event.target.value)}
            placeholder="ALANKAAR"
          />
        </label>

        <label className="form-field">
          <span>Category</span>
          <select
            value={categoryInList ? formData.category : "__custom__"}
            onChange={(event) => {
              if (event.target.value !== "__custom__") {
                updateField("category", event.target.value);
              }
            }}
          >
            <option value="" disabled>
              Select a category
            </option>
            {!categoryInList && formData.category ? (
              <option value="__custom__">
                {formData.category} (current)
              </option>
            ) : null}
            {CATEGORY_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Stock</span>
          <input
            type="number"
            min="0"
            value={formData.countInStock}
            onChange={(event) => updateField("countInStock", event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Rating</span>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={(event) => updateField("rating", event.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Skin / Hair Type</span>
          <select
            value={formData.skinType}
            onChange={(event) => updateField("skinType", event.target.value)}
          >
            {SKIN_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Gender</span>
          <select
            value={formData.gender}
            onChange={(event) => updateField("gender", event.target.value)}
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Reviews</span>
          <input
            type="number"
            min="0"
            value={formData.numReviews}
            onChange={(event) => updateField("numReviews", event.target.value)}
          />
        </label>

        <label className="admin-checkbox-field">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(event) => updateField("featured", event.target.checked)}
          />
          Featured product
        </label>
      </div>

      <label className="form-field">
        <span>Tags (comma-separated)</span>
        <input
          value={formData.tags}
          onChange={(event) => updateField("tags", event.target.value)}
          placeholder="hydrating, glow, serum"
        />
      </label>

      <label className="form-field">
        <span>Image URL</span>
        <input
          value={formData.image}
          onChange={(event) => updateField("image", event.target.value)}
          placeholder="https://..."
        />
      </label>

      {formData.image ? (
        <div className="admin-image-preview">
          <img
            src={formData.image}
            alt="Product preview"
            onError={(e) => {
              e.target.src = getFallbackImage(formData.category, formData.name);
            }}
          />
        </div>
      ) : null}

      <label className="form-field">
        <span>Description</span>
        <div className="admin-description-field">
          <textarea
            className="admin-description-textarea"
            rows="6"
            value={formData.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe the product texture, benefits, and finish."
          />
          <button
            type="button"
            id="ai-generate-description-btn"
            className="ai-generate-btn"
            disabled={generatingDescription || !formData.name || !formData.category}
            title={
              !formData.name || !formData.category
                ? "Enter product name and category first"
                : "Generate product details with AI"
            }
            onClick={async () => {
              if (!formData.name || !formData.category) return;
              setGeneratingDescription(true);
              setDescriptionError("");
              try {
                const response = await generateDescription({
                  productName: formData.name,
                  category: formData.category,
                });
                const details = response.data.data;
                setFormData((current) => ({
                  ...current,
                  description: details.description || current.description,
                  price: details.price !== undefined ? details.price : current.price,
                  countInStock: details.countInStock !== undefined ? details.countInStock : current.countInStock,
                  skinType: details.skinType || current.skinType,
                  gender: details.gender || current.gender,
                  tags: details.tags || current.tags,
                }));
              } catch {
                setDescriptionError(
                  "AI generation failed. Please try again or write manually."
                );
              } finally {
                setGeneratingDescription(false);
              }
            }}
          >
            {generatingDescription ? "Generating..." : "✨ Generate with AI"}
          </button>
        </div>
        {descriptionError && (
          <p className="status-message error-message" style={{ marginTop: "0.5rem" }}>
            {descriptionError}
          </p>
        )}
        <span style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: "0.25rem", display: "block" }}>
          Enter product name and category first, then click Generate with AI
        </span>
      </label>

      <div className="admin-form-actions">
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default AdminProductForm;
