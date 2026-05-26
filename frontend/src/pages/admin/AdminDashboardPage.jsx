import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminRevenueChart from "../../components/admin/AdminRevenueChart.jsx";
import AdminSkeletonCard from "../../components/admin/AdminSkeletonCard.jsx";
import AdminStatCard from "../../components/admin/AdminStatCard.jsx";
import AdminTable from "../../components/admin/AdminTable.jsx";
import AdminTopProductsChart from "../../components/admin/AdminTopProductsChart.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  getAdminCharts,
  getAdminOrders,
  getAdminStats,
} from "../../services/adminService.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsResponse, chartsResponse, ordersResponse] = await Promise.all([
          getAdminStats(),
          getAdminCharts(),
          getAdminOrders({ limit: 5 }),
        ]);

        setStats(statsResponse.data.data);
        setCharts(chartsResponse.data.data);
        setRecentOrders(ordersResponse.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load admin dashboard right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const recentOrderColumns = [
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
      key: "paid",
      label: "Payment",
      render: (order) => (
        <span className={order.isPaid ? "admin-badge green" : "admin-badge amber"}>
          {order.isPaid ? "Paid" : "Unpaid"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (order) => new Date(order.createdAt).toLocaleDateString("en-IN"),
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Dashboard</h1>
        </div>
        <Link to="/admin/products/new" className="primary-button">
          Add New Product
        </Link>
      </div>

      {error ? <p className="status-message error-message">{error}</p> : null}

      <div className="admin-stat-grid">
        {loading ? (
          <>
            <AdminSkeletonCard />
            <AdminSkeletonCard />
            <AdminSkeletonCard />
            <AdminSkeletonCard />
          </>
        ) : (
          <>
            <AdminStatCard icon="₹" label="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
            <AdminStatCard icon="#" label="Total Orders" value={stats.totalOrders} />
            <AdminStatCard icon="@" label="Total Users" value={stats.totalUsers} />
            <AdminStatCard icon="+" label="Total Products" value={stats.totalProducts} />
          </>
        )}
      </div>

      {loading ? <Loader /> : null}

      {!loading && !error ? (
        <>
          <div className="admin-chart-grid">
            <AdminRevenueChart data={charts.monthlyRevenue} />
            <AdminTopProductsChart data={charts.topProducts} />
          </div>

          <div className="admin-dashboard-grid">
            <section>
              <div className="admin-section-heading">
                <h2>Recent Orders</h2>
                <Link to="/admin/orders" className="text-button">
                  View all
                </Link>
              </div>
              <AdminTable
                columns={recentOrderColumns}
                rows={recentOrders}
                emptyMessage="No orders yet."
              />
            </section>

            <section className="admin-chart-card">
              <div className="admin-card-heading">
                <h2>Low Stock Alerts</h2>
                <span>Below 5 units</span>
              </div>

              <div className="low-stock-list">
                {stats.lowStockProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/admin/products/${product._id}/edit`}
                    className="low-stock-item"
                  >
                    <span>{product.name}</span>
                    <strong>{product.countInStock} left</strong>
                  </Link>
                ))}

                {!stats.lowStockProducts.length ? (
                  <p className="admin-empty-text">No low stock products right now.</p>
                ) : null}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}

export default AdminDashboardPage;
