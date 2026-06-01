import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader.jsx";
import ProductReviews from "../components/products/ProductReviews.jsx";
import ProductCard from "../components/products/ProductCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { getProductById, getProducts } from "../services/productService.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getFallbackImage } from "../utils/fallbackImages.js";

function ProductDetailsPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (product) {
      const allImages = product.images?.length
        ? product.images
        : [product.image || getFallbackImage(product.category, product.name)];
      setImgSrc(allImages[0] || getFallbackImage(product.category, product.name));
      setSelectedImage(0);
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

        // Track recently viewed
        const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        const updated = [productId, ...viewed.filter((id) => id !== productId)].slice(0, 10);
        localStorage.setItem("recentlyViewed", JSON.stringify(updated));
      } catch (requestError) {
        // Fallback: search for product by name if ID was deleted due to db reseed
        const searchParams = new URLSearchParams(location.search);
        const productName = searchParams.get("name");
        
        if (productName) {
          try {
            const searchResponse = await getProducts({ keyword: productName });
            const matchingProduct = searchResponse.data.data.find(
              (p) => p.name.toLowerCase() === productName.toLowerCase()
            ) || searchResponse.data.data[0];
            
            if (matchingProduct) {
              const writeReview = searchParams.get("writeReview");
              const nextQuery = writeReview ? "?writeReview=true" : "";
              navigate(`/products/${matchingProduct._id}${nextQuery}`, { replace: true });
              return;
            }
          } catch (searchError) {
            console.error("Failed to find product by name:", searchError);
          }
        }

        setError(
          requestError.response?.data?.message || "Unable to load this product right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, location.search]);

  // Load related products
  useEffect(() => {
    if (!product) return;

    const loadRelated = async () => {
      try {
        const response = await getProducts({ category: product.category });
        setRelatedProducts(
          response.data.data.filter((p) => p._id !== product._id).slice(0, 4)
        );
      } catch {
        setRelatedProducts([]);
      }
    };

    loadRelated();
  }, [product]);

  const allImages = product?.images?.length
    ? product.images
    : product
    ? [product.image || getFallbackImage(product.category, product.name)]
    : [];

  const inWishlist = product ? isInWishlist(product._id) : false;

  const renderStars = (rating) => {
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

          {/* Thumbnail gallery */}
          {allImages.length > 1 ? (
            <div className="product-gallery-thumbs">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  className={`gallery-thumb ${index === selectedImage ? "gallery-thumb-active" : ""}`}
                  onClick={() => {
                    setSelectedImage(index);
                    setImgSrc(img);
                  }}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-details-content">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-price">{formatCurrency(product.price)}</p>

          {product.rating > 0 ? (
            <div className="product-detail-rating">
              <span className="star-rating-inline">{renderStars(product.rating)}</span>
              <span className="rating-text">
                {product.rating}/5 ({product.numReviews} reviews)
              </span>
            </div>
          ) : null}

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
              <span>Skin Type</span>
              <strong>{product.skinType || "All Types"}</strong>
            </div>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 ? (
            <div className="product-variants">
              <span className="variant-label">Options:</span>
              <div className="variant-chips">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`variant-chip ${selectedVariant === index ? "variant-active" : ""} ${!variant.inStock ? "variant-oos" : ""}`}
                    onClick={() => variant.inStock && setSelectedVariant(index)}
                    disabled={!variant.inStock}
                  >
                    {variant.label}: {variant.value}
                    {!variant.inStock ? " (OOS)" : ""}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p className="product-description">{product.description}</p>

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
                } catch (cartError) {
                  toast.error(cartError.message);
                }
              }}
            >
              Add to Cart
            </button>

            <button
              type="button"
              className={`wishlist-button ${inWishlist ? "wishlist-active" : ""}`}
              onClick={() => {
                if (!user) {
                  navigate("/login");
                  return;
                }
                if (inWishlist) {
                  removeFromWishlist(product._id);
                } else {
                  addToWishlist(product._id);
                }
              }}
            >
              {inWishlist ? "♥ Saved" : "♡ Save"}
            </button>

            <Link to="/products" className="secondary-button">
              Back to Products
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container" style={{ marginTop: "3rem" }}>
        <ProductReviews productId={productId} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 ? (
        <div className="container" style={{ marginTop: "3rem" }}>
          <div className="section-heading">
            <span className="eyebrow">More Like This</span>
            <h2>Related Products</h2>
          </div>
          <div className="card-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProductDetailsPage;
