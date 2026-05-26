import { useEffect, useState } from "react";

import AdminOrderDetailModal from "../../components/admin/AdminOrderDetailModal.jsx";
import AdminTable from "../../components/admin/AdminTable.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../../services/adminService.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

const PAGE_SIZE = 20;

const STATUS_LIST = ["pending", "processing", "packed", "shipped", "delivered", "cancelled"];

const exportCSV = (orders) => {
  const rows = [
    ["Order ID", "Customer", "Total", "Paid", "Status", "Date"],
    ...orders.map((order) => [
      order._id,
      order.user?.name || "Guest",
      order.totalPrice,
      order.isPaid,
      order.orderStatus || "pending",
      order.createdAt,
    ]),
  ];
  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "orders.csv";
  anchor.click();
  URL.revokeObjectURL(url);
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: PAGE_SIZE };

      if (filter === "paid") {
        params.isPaid = true;
      }

      if (filter === "unpaid") {
        params.isPaid = false;
      }

      const response = await getAdminOrders(params);
      setOrders(response.data.data);
      setPages(response.data.pages || 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load orders right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filter, page]);

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setMutationLoading(true);
      await updateAdminOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update order status.");
    } finally {
      setMutationLoading(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "Order ID",
      render: (order) => `#${order._id.slice(-6).toUpperCase()}`,
    },
    {
      key: "customer",
      label: "Customer",
      render: (order) => order.user?.name || "Guest",
    },
    {
      key: "total",
      label: "Total",
      render: (order) => formatCurrency(order.totalPrice),
    },
    {
      key: "payment",
      label: "Payment",
      render: (order) => (
        <span className={order.isPaid ? "admin-badge green" : "admin-badge amber"}>
          {order.isPaid ? "Paid" : "Unpaid"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (order) => {
        const currentStatus = order.orderStatus || "pending";
        return (
          <span className={`admin-badge status-${currentStatus}`}>
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </span>
        );
      },
    },
    {
      key: "date",
      label: "Date",
      render: (order) => new Date(order.createdAt).toLocaleDateString("en-IN"),
    },
    {
      key: "actions",
      label: "Update Status",
      render: (order) => (
        <select
          value={order.orderStatus || "pending"}
          onChange={(e) => {
            e.stopPropagation();
            handleStatusChange(order._id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          className="admin-status-select"
          disabled={mutationLoading}
        >
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <>
      <div className="admin-top-bar">
        <div>
          <span className="eyebrow">Fulfillment</span>
          <h1>Orders</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => exportCSV(orders)}>
          Export CSV
        </button>
      </div>

      <div className="admin-filter-tabs">
        {["all", "paid", "unpaid"].map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? "admin-filter-tab active" : "admin-filter-tab"}
            onClick={() => handleFilterChange(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {error ? <p className="status-message error-message">{error}</p> : null}
      {loading ? <Loader /> : null}

      {!loading ? (
        <>
          <AdminTable
            columns={columns}
            rows={orders}
            emptyMessage="No orders found."
            onRowClick={(order) => setSelectedOrder(order)}
          />

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

      {selectedOrder ? (
        <AdminOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      ) : null}
    </>
  );
}

export default AdminOrdersPage;
