import { Link } from "react-router-dom";

import { formatCurrency } from "../../utils/formatCurrency.js";

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-card-topline">
        <span className="product-category-badge">{product.category}</span>
        {product.featured ? <span className="product-featured-badge">Featured</span> : null}
      </div>

      {product.image ? (
        <img src={product.image} alt={product.name} className="product-image" />
      ) : (
        <div className="product-image-placeholder">{product.name}</div>
      )}

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
