import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/paymentService.js";
import { loadRazorpayScript } from "../utils/loadRazorpayScript.js";
import { getOrderById } from "../services/orderService.js";
import { formatCurrency } from "../utils/formatCurrency.js";

function OrderDetailsPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const paymentCancelled = searchParams.get("payment") === "cancelled";
  const verificationFailed = searchParams.get("payment") === "verification_failed";

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(orderId);
        setOrder(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load this order right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

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
      <div className="container order-details-layout">
        <div className="order-details-panel">
          <span className="eyebrow">Order Confirmed</span>
          <h1>Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="products-subtitle">
            Thank you for shopping with us. Your order details and tracking status are shown below.
          </p>

          <div className="order-section">
            <h2>Shipping Address</h2>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>

          <div className="order-section">
            <h2>Payment Status</h2>
            <p>Method: {order.paymentMethod}</p>
            <p className={order.isPaid ? "order-status success" : "order-status pending"}>
              {order.isPaid
                ? "Payment confirmed and order placed successfully"
                : "Order is placed and waiting for payment confirmation"}
            </p>
            {order.isPaid && order.paidAt ? (
              <p className="order-meta-line">
                Confirmed on {new Date(order.paidAt).toLocaleString()}
              </p>
            ) : null}
            {paymentCancelled ? (
              <p className="status-message error-message">
                Razorpay checkout was cancelled. You can retry payment below.
              </p>
            ) : null}
            {verificationFailed ? (
              <p className="status-message error-message">
                Razorpay payment completed but verification did not finish in the app. Retry the
                payment button if needed.
              </p>
            ) : null}
            {paymentError ? <p className="status-message error-message">{paymentError}</p> : null}
          </div>

          <div className="order-section">
            <h2>Order Status</h2>
            <p className={`order-status-badge status-${order.orderStatus || "pending"}`}>
              {(order.orderStatus || "pending").charAt(0).toUpperCase() + 
               (order.orderStatus || "pending").slice(1)}
            </p>
            <div className="order-status-timeline">
              {["pending","processing","packed","shipped","delivered"].map((step, index) => {
                const allStatuses = ["pending","processing","packed","shipped","delivered"];
                const currentIndex = allStatuses.indexOf(order.orderStatus || "pending");
                const isCancelled = order.orderStatus === "cancelled";
                const isCompleted = index <= currentIndex && !isCancelled;
                const isCurrent = index === currentIndex && !isCancelled;
                return (
                  <div key={step} className={`timeline-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isCancelled ? "cancelled" : ""}`}>
                    <div className="timeline-dot" />
                    <span>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                  </div>
                );
              })}
              {order.orderStatus === "cancelled" && (
                <div className="timeline-step cancelled">
                  <div className="timeline-dot" />
                  <span>Cancelled</span>
                </div>
              )}
            </div>
          </div>

          <div className="order-section">
            <h2>Items</h2>
            <div className="checkout-items">
              {order.orderItems.map((item) => (
                <div key={item.product} className="checkout-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span>{formatCurrency(item.quantity * item.price)}</span>
                  </div>
                  {order.orderStatus === "delivered" && (
                    <Link
                      to={`/products/${item.product}?writeReview=true&name=${encodeURIComponent(item.name)}`}
                      className="text-button"
                      style={{ fontSize: "0.85rem", color: "var(--color-gold-muted)", textDecoration: "underline", padding: "0.25rem 0", display: "inline-flex", alignItems: "center", minHeight: "unset" }}
                    >
                      ✍️ Review this product
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="order-details-sidebar">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <strong>{formatCurrency(order.itemsPrice)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{formatCurrency(order.shippingPrice)}</strong>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <strong>{formatCurrency(order.taxPrice)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{formatCurrency(order.totalPrice)}</strong>
          </div>

          <div className="summary-actions">
            {order.paymentMethod === "razorpay" && !order.isPaid ? (
              <button
                type="button"
                className="primary-button"
                onClick={async () => {
                  try {
                    setPaymentError("");
                    setPaymentLoading(true);

                    const isScriptLoaded = await loadRazorpayScript();

                    if (!isScriptLoaded || !window.Razorpay) {
                      throw new Error("Razorpay checkout script failed to load.");
                    }

                    const response = await createRazorpayOrder({
                      orderId: order._id,
                    });
                    const checkoutOptions = response.data.data;

                    const razorpay = new window.Razorpay({
                      key: checkoutOptions.keyId,
                      amount: checkoutOptions.amount,
                      currency: checkoutOptions.currency,
                      name: checkoutOptions.name,
                      order_id: checkoutOptions.razorpayOrderId,
                      prefill: {
                        name: checkoutOptions.prefill?.name || "",
                        email: checkoutOptions.prefill?.email || "",
                        contact: "",
                      },
                      theme: {
                        color: "#be6a4a",
                      },
                      handler(paymentResponse) {
                        verifyRazorpayPayment({
                          orderId: order._id,
                          ...paymentResponse,
                        })
                          .then((verificationResponse) => {
                            setOrder(verificationResponse.data.data);
                          })
                          .catch((verificationError) => {
                            setPaymentError(
                              verificationError.response?.data?.message ||
                                "Unable to verify the Razorpay payment."
                            );
                          });
                      },
                    });

                    if (typeof razorpay.on === "function") {
                      razorpay.on("payment.failed", (paymentFailure) => {
                        setPaymentError(
                          paymentFailure.error?.description ||
                            paymentFailure.error?.reason ||
                            "Razorpay payment failed."
                        );
                      });
                    }

                    razorpay.open();
                  } catch (requestError) {
                    setPaymentError(
                      requestError.response?.data?.message ||
                        requestError.message ||
                        "Unable to start Razorpay checkout for this order."
                    );
                  } finally {
                    setPaymentLoading(false);
                  }
                }}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Opening Razorpay..." : "Pay with Razorpay"}
              </button>
            ) : null}

            <Link to="/orders" className="secondary-button">
              View All Orders
            </Link>
            <Link to="/products" className="primary-button">
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default OrderDetailsPage;
