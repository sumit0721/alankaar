import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { formatCurrency } from "../../utils/formatCurrency.js";
import { getFallbackImage } from "../../utils/fallbackImages.js";

function ProductCard({ product }) {
  const [imgSrc, setImgSrc] = useState(product.image || getFallbackImage(product.category, product.name));

  useEffect(() => {
    setImgSrc(product.image || getFallbackImage(product.category, product.name));
  }, [product.image, product.category, product.name]);

  const handleImageError = () => {
    setImgSrc(getFallbackImage(product.category, product.name));
  };

  return (
    <article className="product-card">
      <div className="product-card-topline">
        <span className="product-category-badge">{product.category}</span>
        {product.featured ? <span className="product-featured-badge">Featured</span> : null}
      </div>

      <img
        src={imgSrc}
        alt={product.name}
        className="product-image"
        onError={handleImageError}
        style={{ display: "block" }}
      />

      <div className="product-card-content">
        <h3>{product.name}</h3>
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
