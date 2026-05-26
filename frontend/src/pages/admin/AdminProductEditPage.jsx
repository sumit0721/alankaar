import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AdminProductForm from "../../components/admin/AdminProductForm.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../../services/productService.js";

function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
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
  }, [id, isEditMode]);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      setError("");

      if (isEditMode) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }

      navigate("/admin/products");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Catalog</span>
          <h1>{isEditMode ? "Edit Product" : "Create Product"}</h1>
        </div>
        <Link to="/admin/products" className="secondary-button">
          Back to Products
        </Link>
      </div>

      {error ? <p className="status-message error-message">{error}</p> : null}
      {loading ? <Loader /> : null}

      {!loading ? (
        <div className="admin-form-card">
          <AdminProductForm
            initialProduct={product}
            submitLabel={isEditMode ? "Update Product" : "Create Product"}
            loading={saving}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </>
  );
}

export default AdminProductEditPage;
