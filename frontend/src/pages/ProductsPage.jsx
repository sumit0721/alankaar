import { useEffect, useState } from "react";

import Loader from "../components/common/Loader.jsx";
import ProductGrid from "../components/products/ProductGrid.jsx";
import { getProducts } from "../services/productService.js";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        setProducts(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load products right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const visibleProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <section className="section-block">
      <div className="container">
        <div className="products-hero">
          <div className="section-heading">
            <span className="eyebrow">Collection</span>
            <h1>Shop products crafted for glow, comfort, and daily wear.</h1>
            <p className="products-subtitle">
              Browse the full ALANKAAR collection and explore categories with a simple
              storefront flow.
            </p>
          </div>

          <div className="product-filter-bar">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={category === activeCategory ? "filter-chip active" : "filter-chip"}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Loader /> : null}
        {error ? <p className="status-message error-message">{error}</p> : null}
        {!loading && !error ? (
          <>
            <div className="results-summary">
              <strong>{visibleProducts.length}</strong>
              <span>products visible in {activeCategory === "All" ? "all categories" : activeCategory}</span>
            </div>
            <ProductGrid products={visibleProducts} />
          </>
        ) : null}
      </div>
    </section>
  );
}

export default ProductsPage;
