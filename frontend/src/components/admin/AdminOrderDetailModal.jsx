import { formatCurrency } from "../../utils/formatCurrency.js";

function AdminOrderDetailModal({ order, onClose }) {
  if (!order) {
    return null;
  }

  const statusClass = `admin-badge status-${order.orderStatus || "pending"}`;

  return (
    <div className="admin-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="admin-modal admin-detail-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-detail-modal-header">
          <h2>Order #{order._id.slice(-6).toUpperCase()}</h2>
          <button type="button" className="admin-detail-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-order-detail-grid">
          <div className="admin-order-detail-section">
            <h3>Order Info</h3>
            <p>
              <strong>Placed:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={statusClass}>
                {(order.orderStatus || "pending").charAt(0).toUpperCase() +
                  (order.orderStatus || "pending").slice(1)}
              </span>
            </p>
          </div>

          <div className="admin-order-detail-section">
            <h3>Customer</h3>
            <p>
              <strong>Name:</strong> {order.user?.name || "Guest"}
            </p>
            <p>
              <strong>Email:</strong> {order.user?.email || "N/A"}
            </p>
          </div>
        </div>

        {order.shippingAddress ? (
          <div className="admin-order-detail-section">
            <h3>Shipping Address</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        ) : null}

        <div className="admin-order-detail-section">
          <h3>Order Items</h3>
          <table className="admin-order-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-order-detail-section">
          <h3>Price Breakdown</h3>
          <div className="admin-order-summary-row">
            <span>Items</span>
            <span>{formatCurrency(order.itemsPrice)}</span>
          </div>
          <div className="admin-order-summary-row">
            <span>Shipping</span>
            <span>{formatCurrency(order.shippingPrice)}</span>
          </div>
          <div className="admin-order-summary-row">
            <span>Tax</span>
            <span>{formatCurrency(order.taxPrice)}</span>
          </div>
          <div className="admin-order-summary-row total">
            <span>Total</span>
            <span>{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>

        <div className="admin-order-detail-grid">
          <div className="admin-order-detail-section">
            <h3>Payment</h3>
            <p>
              <strong>Method:</strong> {order.paymentMethod}
            </p>
            <p>
              <span className={order.isPaid ? "admin-badge green" : "admin-badge amber"}>
                {order.isPaid ? "Paid" : "Unpaid"}
              </span>
              {order.isPaid && order.paidAt ? (
                <span>
                  {" "}
                  on {new Date(order.paidAt).toLocaleDateString("en-IN")}
                </span>
              ) : null}
            </p>
          </div>

          <div className="admin-order-detail-section">
            <h3>Delivery</h3>
            <p>
              <span className={order.isDelivered ? "admin-badge green" : "admin-badge red"}>
                {order.isDelivered ? "Delivered" : "Not Delivered"}
              </span>
              {order.isDelivered && order.deliveredAt ? (
                <span>
                  {" "}
                  on {new Date(order.deliveredAt).toLocaleDateString("en-IN")}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailModal;
