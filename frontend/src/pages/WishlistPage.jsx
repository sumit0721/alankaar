import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import ProductCard from "../components/products/ProductCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getWishlist } from "../services/authService.js";

function WishlistPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadWishlist = async () => {
      try {
        setLoading(true);
        const response = await getWishlist();
        setProducts(response.data.data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [user]);

  if (loading) {
    return (
      <section className="section-block">
        <div className="container">
          <Loader />
        </div>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Saved</span>
          <h1>Your Wishlist</h1>
        </div>

        {products.length === 0 ? (
          <div className="empty-state-panel">
            <h2>Your wishlist is empty</h2>
            <p>Browse products and tap the heart to save items you love.</p>
            <Link to="/products" className="primary-button">
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="card-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default WishlistPage;
