import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../../components/common/Loader.jsx";
import { getAllReviews, deleteReview } from "../../services/adminService.js";

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getAllReviews({ page, limit: 20 });
      setReviews(response.data.data);
      setPages(response.data.pages);
    } catch {
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await deleteReview(reviewId);
      toast.success("Review deleted.");
      fetchReviews();
    } catch {
      toast.error("Failed to delete review.");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="admin-page">
      <h2>Reviews Management</h2>
      <p className="products-subtitle">
        {reviews.length} reviews — Page {page} of {pages}
      </p>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>User</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td>{review.product?.name || "—"}</td>
                <td>{review.user?.name || "—"}</td>
                <td>
                  <span className="star-display">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </td>
                <td className="review-comment-cell">
                  {review.comment || <em>No comment</em>}
                </td>
                <td>
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td>
                  <button
                    type="button"
                    className="text-button danger"
                    onClick={() => handleDelete(review._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <div className="admin-pagination">
          <button
            type="button"
            className="secondary-button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            type="button"
            className="secondary-button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default AdminReviewsPage;
