import { useEffect, useState } from "react";
import SkeletonCard from "../common/SkeletonCard.jsx";
import ProductGrid from "../products/ProductGrid.jsx";
import { getProducts } from "../../services/productService.js";

function FeaturedProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const cached = sessionStorage.getItem("featured_products");
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) return data;
      }
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState(products === null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;

    const fetchFeatured = async (attempt = 1) => {
      try {
        const response = await getProducts({ featured: true });
        if (cancelled) return;
        const data = response.data.data || response.data;
        setProducts(data);
        setLoading(false);
        sessionStorage.setItem(
          "featured_products",
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch {
        if (cancelled) return;
        if (attempt < 4) {
          const delay = attempt === 1 ? 5000 : attempt === 2 ? 15000 : 40000;
          retryTimer = setTimeout(() => fetchFeatured(attempt + 1), delay);
        }
      }
    };

    fetchFeatured();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, []);

  if (loading) {
    return (
      <section className="section-block">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Signature Collection</span>
            <h2>The icons of our cosmetic heritage</h2>
          </div>
          <div className="card-grid">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Signature Collection</span>
          <h2>The icons of our cosmetic heritage</h2>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

export default FeaturedProducts;

