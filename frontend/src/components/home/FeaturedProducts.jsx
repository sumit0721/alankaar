import { useEffect, useState } from "react";

import Loader from "../common/Loader.jsx";
import ProductGrid from "../products/ProductGrid.jsx";
import { getProducts } from "../../services/productService.js";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({ featured: true });
        setProducts(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load featured products right now."
        );
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

        {loading ? <Loader /> : null}
        {error ? <p className="status-message error-message">{error}</p> : null}
        {!loading && !error ? <ProductGrid products={products} /> : null}
      </div>
    </section>
  );
}

export default FeaturedProducts;
