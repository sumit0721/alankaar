import { useEffect, useState } from "react";

import SkeletonCard from "../components/common/SkeletonCard.jsx";
import ProductGrid from "../components/products/ProductGrid.jsx";
import { getProducts } from "../services/productService.js";

// Professional cosmetic categories & skin types
const COSMETIC_CATEGORIES = ["All", "Makeup", "Skincare", "Lip Care", "Fragrance", "Body Care"];
const SKIN_TYPES = ["All", "Normal", "Oily", "Dry", "Sensitive", "Combination"];

function StarRatingRow({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? "star-filled" : "star-empty"} style={{ color: "#f39c12", fontSize: "0.85rem" }}>
        ★
      </span>
    );
  }
  return <div style={{ display: "inline-flex", gap: "1px" }}>{stars}</div>;
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Sort State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // Filtering States
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSkinType, setActiveSkinType] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Mobile drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Debounce Search input to limit API calls while typing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // 2. Fetch filtered products from backend whenever a filter, search or sort parameter changes
  const loadFilteredProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (debouncedSearch) params.keyword = debouncedSearch;
      if (activeCategory !== "All") params.category = activeCategory;
      if (activeSkinType !== "All") params.skinType = activeSkinType;
      if (minPrice !== "") params.minPrice = minPrice;
      if (maxPrice !== "") params.maxPrice = maxPrice;
      if (minRating !== "") params.minRating = minRating;
      if (inStockOnly) params.inStock = "true";
      if (sort) params.sort = sort;

      const response = await getProducts(params);
      setProducts(response.data.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load products right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilteredProducts();
  }, [debouncedSearch, activeCategory, activeSkinType, minPrice, maxPrice, minRating, inStockOnly, sort]);

  // Reset all filters to default
  const handleClearAll = () => {
    setSearch("");
    setDebouncedSearch("");
    setActiveCategory("All");
    setActiveSkinType("All");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setInStockOnly(false);
    setSort("newest");
  };

  // Compile currently active filters for displaying pill chips
  const activeChips = [];
  if (debouncedSearch) {
    activeChips.push({
      id: "search",
      label: `Search: "${debouncedSearch}"`,
      onClear: () => { setSearch(""); setDebouncedSearch(""); },
    });
  }
  if (activeCategory !== "All") {
    activeChips.push({
      id: "category",
      label: `Category: ${activeCategory}`,
      onClear: () => setActiveCategory("All"),
    });
  }
  if (activeSkinType !== "All") {
    activeChips.push({
      id: "skinType",
      label: `Skin: ${activeSkinType}`,
      onClear: () => setActiveSkinType("All"),
    });
  }
  if (minPrice !== "" || maxPrice !== "") {
    let priceLabel = "";
    if (minPrice !== "" && maxPrice !== "") priceLabel = `₹${minPrice} - ₹${maxPrice}`;
    else if (minPrice !== "") priceLabel = `Over ₹${minPrice}`;
    else if (maxPrice !== "") priceLabel = `Under ₹${maxPrice}`;

    activeChips.push({
      id: "price",
      label: priceLabel,
      onClear: () => { setMinPrice(""); setMaxPrice(""); },
    });
  }
  if (minRating !== "") {
    activeChips.push({
      id: "rating",
      label: `${minRating} ★ & Above`,
      onClear: () => setMinRating(""),
    });
  }
  if (inStockOnly) {
    activeChips.push({
      id: "stock",
      label: "In Stock Only",
      onClear: () => setInStockOnly(false),
    });
  }

  // Sidebar Filtering form component (rendered on both desktop and mobile drawer)
  const FilterSidebarContent = () => (
    <div className="filter-sidebar-card">
      {/* Category filters */}
      <div className="filter-section">
        <h3>Categories</h3>
        <div className="filter-list">
          {COSMETIC_CATEGORIES.map((cat) => (
            <label key={cat} className="filter-checkbox">
              <input
                type="checkbox"
                checked={activeCategory === cat}
                onChange={() => setActiveCategory(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skin Type filters */}
      <div className="filter-section">
        <h3>Skin Type</h3>
        <div className="filter-list">
          {SKIN_TYPES.map((st) => (
            <label key={st} className="filter-checkbox">
              <input
                type="checkbox"
                checked={activeSkinType === st}
                onChange={() => setActiveSkinType(st)}
              />
              <span>{st}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pricing ranges */}
      <div className="filter-section">
        <h3>Price Range</h3>
        <div className="price-range-inputs">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Ratings filters */}
      <div className="filter-section">
        <h3>Ratings</h3>
        <div className="filter-list">
          <label className={`rating-filter-row ${minRating === "" ? "active" : ""}`} onClick={() => setMinRating("")}>
            <span>All Ratings</span>
          </label>
          <label className={`rating-filter-row ${minRating === "4" ? "active" : ""}`} onClick={() => setMinRating("4")}>
            <StarRatingRow rating={4} />
            <span>& Up</span>
          </label>
          <label className={`rating-filter-row ${minRating === "3" ? "active" : ""}`} onClick={() => setMinRating("3")}>
            <StarRatingRow rating={3} />
            <span>& Up</span>
          </label>
        </div>
      </div>

      {/* Availability toggle */}
      <div className="filter-section">
        <h3>Availability</h3>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Reset button inside sidebar */}
      <button
        type="button"
        className="secondary-button"
        style={{ width: "100%", marginTop: "1rem" }}
        onClick={handleClearAll}
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <section className="section-block">
      <div className="container">
        {/* Banner Section */}
        <div className="products-hero">
          <div className="section-heading">
            <span className="eyebrow">Collection</span>
            <h1>Luminous Formulations</h1>
            <p className="products-subtitle">
              Shop high-performance skincare, premium palettes, and lip essentials engineered for all skin profiles.
            </p>
          </div>
        </div>

        {/* Top bar controls: search box + sort selection */}
        <div className="products-top-controls">
          <div className="search-box-wrapper">
            <input
              type="text"
              className="search-box-input"
              placeholder="Search products, ingredients, glow formulas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search ? (
              <button
                type="button"
                className="search-box-clear"
                onClick={() => { setSearch(""); setDebouncedSearch(""); }}
              >
                ✕
              </button>
            ) : null}
          </div>

          <div className="sort-select-wrapper">
            <span style={{ fontSize: "0.9rem", color: "var(--color-muted)", fontWeight: "600" }}>Sort:</span>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">New Arrivals</option>
              <option value="popular">Best Sellers</option>
              <option value="topRated">Top Rated</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 ? (
          <div className="active-chips-bar">
            {activeChips.map((chip) => (
              <div key={chip.id} className="active-chip">
                <span>{chip.label}</span>
                <button type="button" onClick={chip.onClear}>✕</button>
              </div>
            ))}
            <button type="button" className="clear-all-filters-btn" onClick={handleClearAll}>
              Clear All
            </button>
          </div>
        ) : null}

        {/* Sidebar + Main Grid layout */}
        <div className="products-layout-grid">
          {/* Left Sidebar column (Desktop only) */}
          <aside className="products-sidebar-desktop">
            <FilterSidebarContent />
          </aside>

          {/* Right Product Grid column */}
          <div className="products-main-column">
            {loading ? (
              <div className="card-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SkeletonCard key={n} />
                ))}
              </div>
            ) : null}

            {error ? <p className="status-message error-message">{error}</p> : null}

            {!loading && !error ? (
              <>
                <div className="results-summary" style={{ marginBottom: "1.5rem" }}>
                  <strong>{products.length}</strong>
                  <span> products found</span>
                </div>

                {products.length === 0 ? (
                  <div className="empty-state-panel" style={{ padding: "4rem 2rem", background: "var(--color-surface-strong)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-large)" }}>
                    <p style={{ fontSize: "3rem", margin: 0 }}>🔍</p>
                    <h2>No formulas found matching your filters.</h2>
                    <p style={{ color: "var(--color-muted)", margin: "0.5rem auto 1.5rem" }}>
                      Try adjusting your checkboxes, widening your price range, or clearing filters.
                    </p>
                    <button type="button" className="primary-button" onClick={handleClearAll}>
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <ProductGrid products={products} />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Floating Button for Mobile Filtering */}
      <button
        type="button"
        className="primary-button mobile-filter-toggle-btn"
        onClick={() => setIsDrawerOpen(true)}
      >
        🎛️ Filter & Sort
      </button>

      {/* Slide-Up Mobile Filter Drawer */}
      {isDrawerOpen ? (
        <div className="filter-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="filter-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="filter-drawer-header">
              <h2>Filter & Sort</h2>
              <button
                type="button"
                className="filter-drawer-close"
                onClick={() => setIsDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="filter-drawer-body">
              <div style={{ marginBottom: "1rem" }} className="sort-select-wrapper">
                <span style={{ fontSize: "0.95rem", fontWeight: "700" }}>Sort:</span>
                <select className="sort-select" style={{ width: "100%" }} value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">New Arrivals</option>
                  <option value="popular">Best Sellers</option>
                  <option value="topRated">Top Rated</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
              <FilterSidebarContent />
            </div>
            <div className="filter-drawer-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={handleClearAll}
              >
                Clear All
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => setIsDrawerOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProductsPage;
