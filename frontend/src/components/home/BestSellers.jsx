import { useEffect, useState } from "react";
import SkeletonCard from "../common/SkeletonCard.jsx";
import ProductGrid from "../products/ProductGrid.jsx";
import { getProducts } from "../../services/productService.js";

function BestSellers() {
  const [products, setProducts] = useState(() => {
    try {
      const cached = sessionStorage.getItem("bestsellers_products");
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

    const fetchBestsellers = async (attempt = 1) => {
      try {
        const response = await getProducts({ sort: "popular" });
        if (cancelled) return;
        const rawData = response.data.data || response.data;
        const data = rawData.slice(0, 4);
        setProducts(data);
        setLoading(false);
        sessionStorage.setItem(
          "bestsellers_products",
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch {
        if (cancelled) return;
        if (attempt < 4) {
          const delay = attempt === 1 ? 5000 : attempt === 2 ? 15000 : 40000;
          retryTimer = setTimeout(() => fetchBestsellers(attempt + 1), delay);
        }
      }
    };

    fetchBestsellers();

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
            <span className="eyebrow">Popular</span>
            <h2>Best sellers loved by our community</h2>
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
          <span className="eyebrow">Popular</span>
          <h2>Best sellers loved by our community</h2>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

export default BestSellers;

