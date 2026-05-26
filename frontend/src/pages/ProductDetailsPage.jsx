import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { getProductById } from "../services/productService.js";
import { formatCurrency } from "../utils/formatCurrency.js";

import { getFallbackImage } from "../utils/fallbackImages.js";

function ProductDetailsPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartFeedback, setCartFeedback] = useState({ type: "", message: "" });
  const [imgSrc, setImgSrc] = useState("");

  useEffect(() => {
    if (product) {
      setImgSrc(product.image || getFallbackImage(product.category, product.name));
    }
  }, [product]);

  const handleImageError = () => {
    if (product) {
      setImgSrc(getFallbackImage(product.category, product.name));
    }
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(productId);
        setProduct(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load this product right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <section className="section-block">
        <div className="container">
          <Loader />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-block">
        <div className="container">
          <p className="status-message error-message">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="container product-details-layout">
        <div className="product-details-media">
          <div className="product-details-badges">
            <span className="product-category-badge">{product.category}</span>
            {product.featured ? <span className="product-featured-badge">Best Seller</span> : null}
          </div>

          <img
            src={imgSrc}
            alt={product.name}
            className="product-details-image"
            onError={handleImageError}
            style={{ display: "block" }}
          />
        </div>

        <div className="product-details-content">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-price">{formatCurrency(product.price)}</p>

          <div className="product-highlights">
            <div>
              <span>Brand</span>
              <strong>{product.brand}</strong>
            </div>
            <div>
              <span>Stock</span>
              <strong>{product.countInStock} available</strong>
            </div>
            <div>
              <span>Rating</span>
              <strong>{product.rating || 0}/5</strong>
            </div>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-benefits">
            <article>
              <h3>Why customers will like it</h3>
              <p>Balanced texture, wearable finish, and a category-first shopping story.</p>
            </article>
            <article>
              <h3>Where it fits</h3>
              <p>Easy to place into a daily ritual, gift edit, or featured homepage block.</p>
            </article>
          </div>

          {cartFeedback.message ? (
            <p
              className={
                cartFeedback.type === "error"
                  ? "status-message error-message"
                  : "status-message success-message"
              }
            >
              {cartFeedback.message}
            </p>
          ) : null}

          <div className="product-details-actions">
            <button
              type="button"
              className="primary-button"
              onClick={async () => {
                if (!user) {
                  navigate("/login", { state: { from: location } });
                  return;
                }

                try {
                  await addToCart(product);
                  setCartFeedback({
                    type: "success",
                    message: "Added to cart successfully.",
                  });
                } catch (cartError) {
                  setCartFeedback({
                    type: "error",
                    message: cartError.message,
                  });
                }
              }}
            >
              Add to Cart
            </button>

            <Link to="/products" className="secondary-button">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
