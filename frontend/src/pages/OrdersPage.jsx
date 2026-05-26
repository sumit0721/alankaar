import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import { getMyOrders } from "../services/orderService.js";
import { formatCurrency } from "../utils/formatCurrency.js";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await getMyOrders();
        setOrders(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load your orders right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <section className="section-block">
        <div className="container">
          <Loader />
        </div>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Orders</span>
          <h1>Your recent orders</h1>
          <p className="products-subtitle">
            This page reads your order history from the backend using the logged-in JWT token.
          </p>
        </div>

        {error ? <p className="status-message error-message">{error}</p> : null}

        {!error && !orders.length ? (
          <div className="empty-state-panel">
            <h2>No orders yet.</h2>
            <p>Once you complete checkout, your orders will appear here.</p>
            <Link to="/products" className="primary-button">
              Start Shopping
            </Link>
          </div>
        ) : null}

        <div className="orders-grid">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <div className="order-card-top">
                <span>Order #{order._id.slice(-6).toUpperCase()}</span>
                <strong>{formatCurrency(order.totalPrice)}</strong>
              </div>

              <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>{order.orderItems.length} items</p>
              <p className={order.isPaid ? "order-status success" : "order-status pending"}>
                {order.isPaid
                  ? "Payment confirmed and order placed"
                  : "Order placed, awaiting payment confirmation"}
              </p>
              <p className={`order-status-badge status-${order.orderStatus || "pending"}`}>
                {(order.orderStatus || "pending").charAt(0).toUpperCase() + (order.orderStatus || "pending").slice(1)}
              </p>

              <Link to={`/orders/${order._id}`} className="secondary-button">
                View Order
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrdersPage;
