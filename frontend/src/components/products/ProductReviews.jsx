import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext.jsx";
import { getProductReviews, addReview, checkReviewEligibility } from "../../services/reviewService.js";

function StarRating({ rating, onRate, interactive = false, size = "1rem" }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating" style={{ fontSize: size }}>
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? "star-filled" : "star-empty"} ${interactive ? "star-interactive" : ""}`}
          onClick={interactive ? () => onRate(star) : undefined}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ProductReviews({ productId }) {
  const { user } = useAuth();
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getProductReviews(productId);
      setReviews(response.data.data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibility = async () => {
    if (!user) {
      setCanReview(false);
      return;
    }
    try {
      const response = await checkReviewEligibility(productId);
      setCanReview(response.data.canReview);
    } catch {
      setCanReview(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchEligibility();
  }, [productId, user]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("writeReview") === "true" && canReview) {
      setShowForm(true);
      setTimeout(() => {
        const element = document.getElementById("reviews-section-root");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [location.search, canReview]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await addReview(productId, { rating, comment });
      toast.success("Review submitted!");
      setShowForm(false);
      setRating(5);
      setComment("");
      fetchReviews();
      fetchEligibility();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyReviewed = reviews.some(
    (review) => review.user?._id === user?._id
  );

  return (
    <div id="reviews-section-root" className="product-reviews">
      <div className="reviews-header">
        <h2>Customer Reviews ({reviews.length})</h2>
        {user && canReview && !showForm ? (
          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowForm(true)}
          >
            Write a Review
          </button>
        ) : null}
      </div>

      {user && !canReview && !alreadyReviewed && (
        <p className="status-message info-message" style={{ margin: "1rem 0", background: "var(--color-background-alt)", border: "1px solid var(--color-border)", padding: "0.75rem 1rem", borderRadius: "var(--radius-small)", color: "var(--color-muted)" }}>
          🌸 Only customers who have purchased and received this product can write a review.
        </p>
      )}

      {user && alreadyReviewed && (
        <p className="status-message success-message" style={{ margin: "1rem 0", background: "#edf8f0", border: "1px solid #bed9c4", padding: "0.75rem 1rem", borderRadius: "var(--radius-small)", color: "#255f38" }}>
          ✨ You have already reviewed this product. Thank you for your feedback!
        </p>
      )}

      {showForm ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-rating">
            <span>Your Rating:</span>
            <StarRating rating={rating} onRate={setRating} interactive size="1.6rem" />
          </div>

          <label className="form-field">
            <span>Your Review (optional)</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              maxLength={500}
              rows={4}
            />
          </label>

          <div className="review-form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="reviews-empty">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-card-header">
                <div className="review-user">
                  {review.user?.profilePicture ? (
                    <img src={review.user.profilePicture} alt="" className="review-avatar" />
                  ) : (
                    <div className="review-avatar-placeholder">
                      {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <strong>{review.user?.name || "User"}</strong>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.comment ? <p className="review-comment">{review.comment}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductReviews;
