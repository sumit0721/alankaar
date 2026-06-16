import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { formatCurrency } from "../../utils/formatCurrency.js";
import { getFallbackImage } from "../../utils/fallbackImages.js";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function ProductCard({ product }) {
  const [imgSrc, setImgSrc] = useState(product.image || getFallbackImage(product.category, product.name));
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    setImgSrc(product.image || getFallbackImage(product.category, product.name));
  }, [product.image, product.category, product.name]);

  const handleImageError = () => {
    setImgSrc(getFallbackImage(product.category, product.name));
  };

  const inWishlist = isInWishlist(product._id);

  const handleWishlistToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product._id);
    }
  };

  const renderStars = () => {
    const rating = product.rating || 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? "star star-filled" : "star star-empty"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <article className="product-card">
      <div className="product-card-topline">
        <span className="product-category-badge">{product.category}</span>
      </div>

      <button
        type="button"
        className={`wishlist-heart ${inWishlist ? "wishlist-active" : ""}`}
        onClick={handleWishlistToggle}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {inWishlist ? "♥" : "♡"}
      </button>

      <Link to={`/products/${product._id}`} className="product-image-link" style={{ display: "block" }}>
        <div className="product-image-wrapper">
          <img
            src={imgSrc}
            alt={product.name}
            className="product-image"
            onError={handleImageError}
            style={{ display: "block" }}
          />
          {product.featured && (
            <span className="product-featured-badge-overlay">Featured</span>
          )}
        </div>
      </Link>

      <div className="product-card-content">
        <h3>{product.name}</h3>
        {product.rating > 0 ? (
          <div className="product-card-rating">
            <span className="star-rating-inline">{renderStars()}</span>
            <span className="rating-count">({product.numReviews})</span>
          </div>
        ) : null}
        <p className="product-card-description">{product.description}</p>
      </div>

      <div className="product-card-footer">
        <p className="product-card-price">{formatCurrency(product.price)}</p>
        <Link to={`/products/${product._id}`} className="secondary-button">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
