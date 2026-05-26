import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AdminModal from "../../components/admin/AdminModal.jsx";
import AdminTable from "../../components/admin/AdminTable.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../services/productService.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { getFallbackImage } from "../../utils/fallbackImages.js";

const PAGE_SIZE = 8;

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [error, setError] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);

  const pages = Math.max(Math.ceil(products.length / PAGE_SIZE), 1);
  const visibleProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [page, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = debouncedSearch ? { keyword: debouncedSearch } : {};
      const response = await getProducts(params);
      setProducts(response.data.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load products right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [debouncedSearch]);

  const handleFeaturedToggle = async (product) => {
    try {
      setMutationLoading(true);
      await updateProduct(product._id, { featured: !product.featured });
      await loadProducts();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update featured status."
      );
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) {
      return;
    }

    try {
      setMutationLoading(true);
      await deleteProduct(productToDelete._id);
      setProductToDelete(null);
      await loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete product.");
    } finally {
      setMutationLoading(false);
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (product) => {
        const src = product.image || getFallbackImage(product.category, product.name);
        return (
          <img
            src={src}
            alt={product.name}
            onError={(e) => {
              e.target.src = getFallbackImage(product.category, product.name);
            }}
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        );
      },
    },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    {
      key: "gender",
      label: "Gender",
      render: (product) => {
        const gender = product.gender || "Unisex";
        let badgeClass = "admin-badge amber";
        if (gender === "Women") {
          badgeClass = "admin-badge status-shipped";
        } else if (gender === "Men") {
          badgeClass = "admin-badge status-processing";
        }
        return <span className={badgeClass}>{gender}</span>;
      },
    },
    {
      key: "price",
      label: "Price",
      render: (product) => formatCurrency(product.price),
    },
    {
      key: "stock",
      label: "Stock",
      render: (product) => (
        <span className={product.countInStock < 5 ? "admin-badge red" : "admin-badge green"}>
          {product.countInStock}
        </span>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (product) => (
        <button
          type="button"
          className={product.featured ? "admin-toggle active" : "admin-toggle"}
          onClick={() => handleFeaturedToggle(product)}
          disabled={mutationLoading}
        >
          {product.featured ? "Yes" : "No"}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (product) => (
        <div className="admin-row-actions">
          <Link to={`/admin/products/${product._id}/edit`} className="secondary-button">
            Edit
          </Link>
          <button
            type="button"
            className="danger-button"
            onClick={() => setProductToDelete(product)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="admin-top-bar">
        <div>
          <span className="eyebrow">Catalog</span>
          <h1>Products</h1>
        </div>
        <Link to="/admin/products/new" className="primary-button">
          Add New Product
        </Link>
      </div>

      <div className="admin-top-bar">
        <input
          className="admin-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products"
        />
        <span className="admin-result-count">{products.length} products</span>
      </div>

      {error ? <p className="status-message error-message">{error}</p> : null}
      {loading ? <Loader /> : null}

      {!loading ? (
        <>
          <AdminTable columns={columns} rows={visibleProducts} emptyMessage="No products found." />

          <div className="admin-pagination">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>Page {page} of {pages}</span>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((current) => Math.min(current + 1, pages))}
              disabled={page === pages}
            >
              Next
            </button>
          </div>
        </>
      ) : null}

      {productToDelete ? (
        <AdminModal
          title="Delete product"
          message={`Delete ${productToDelete.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={mutationLoading}
          onCancel={() => setProductToDelete(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}

export default AdminProductsPage;
