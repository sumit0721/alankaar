import { useEffect, useState } from "react";

import ProductGrid from "../products/ProductGrid.jsx";
import SkeletonCard from "../common/SkeletonCard.jsx";
import { getProducts } from "../../services/productService.js";
import { buildCacheKey, readCache, writeCache } from "../../utils/productCache.js";

const BESTSELLERS_CACHE_KEY = buildCacheKey({ sort: "popular", _limit: "4" });

function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopular = async () => {
      // ── Show cached data instantly if available ──────────────────────
      const cached = readCache(BESTSELLERS_CACHE_KEY);
      if (cached) {
        setProducts(cached);
        setLoading(false);
        // Continue to refresh in background
      }

      try {
        const response = await getProducts({ sort: "popular" });
        const freshData = response.data.data.slice(0, 4);
        setProducts(freshData);
        writeCache(BESTSELLERS_CACHE_KEY, freshData);
      } catch {
        if (!cached) {
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPopular();
  }, []);

  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Popular</span>
          <h2>Best sellers loved by our community</h2>
        </div>

        {loading ? (
          <div className="card-grid">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </section>
  );
}

export default BestSellers;

