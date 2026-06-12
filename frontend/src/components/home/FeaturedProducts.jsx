import { useEffect, useState } from "react";

import SkeletonCard from "../common/SkeletonCard.jsx";
import ProductGrid from "../products/ProductGrid.jsx";
import { getProducts } from "../../services/productService.js";
import { buildCacheKey, readCache, writeCache } from "../../utils/productCache.js";

const FEATURED_CACHE_KEY = buildCacheKey({ featured: "true" });

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      // ── Show cached data instantly if available ──────────────────────
      const cached = readCache(FEATURED_CACHE_KEY);
      if (cached) {
        setProducts(cached);
        setLoading(false);
        // Continue to fetch fresh data in background (stale-while-revalidate)
      }

      try {
        const response = await getProducts({ featured: true });
        const freshData = response.data.data;
        setProducts(freshData);
        writeCache(FEATURED_CACHE_KEY, freshData);
      } catch (requestError) {
        // Only show error if we have no cached data to fall back on
        if (!cached) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load featured products right now."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Featured</span>
          <h2>Bestsellers your customers notice first</h2>
        </div>

        {loading ? (
          <div className="card-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : null}
        {error ? <p className="status-message error-message">{error}</p> : null}
        {!loading && !error ? <ProductGrid products={products} /> : null}
      </div>
    </section>
  );
}

export default FeaturedProducts;

