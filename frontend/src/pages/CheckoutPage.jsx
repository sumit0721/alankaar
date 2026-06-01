import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader.jsx";
import { useCart } from "../context/CartContext.jsx";
import { createOrder } from "../services/orderService.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/paymentService.js";
import { loadRazorpayScript } from "../utils/loadRazorpayScript.js";
import { calculateOrderSummary } from "../utils/calculateOrderSummary.js";
import { formatCurrency } from "../utils/formatCurrency.js";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount, totalQuantity, cartLoading, cartError, refreshCart } = useCart();
  const [formData, setFormData] = useState(() => {
    const savedDraft = localStorage.getItem("checkoutDraft");

    return savedDraft
      ? JSON.parse(savedDraft)
      : {
          fullName: "",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          paymentMethod: "cash_on_delivery",
        };
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("checkoutDraft", JSON.stringify(formData));
  }, [formData]);

  const summary = calculateOrderSummary(totalAmount);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const requiredFields = [
      "fullName",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
      "paymentMethod",
    ];

    const hasMissingField = requiredFields.some((field) => !formData[field]?.trim?.() && field !== "paymentMethod");

    if (hasMissingField) {
      toast.error("Please complete all shipping fields before placing the order.");
      setError("Please complete all shipping fields before placing the order.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await createOrder({
        shippingAddress: {
          fullName: formData.fullName,
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
      });

      localStorage.removeItem("checkoutDraft");

      const createdOrder = response.data.data;

      if (formData.paymentMethod === "razorpay") {
        const isScriptLoaded = await loadRazorpayScript();

        if (!isScriptLoaded || !window.Razorpay) {
          throw new Error("Razorpay checkout script failed to load.");
        }

        const paymentResponse = await createRazorpayOrder({
          orderId: createdOrder._id,
        });

        const checkoutOptions = paymentResponse.data.data;
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
          handler(response) {
            verifyRazorpayPayment({
              orderId: createdOrder._id,
              ...response,
            })
              .then(async () => {
                await refreshCart();
                navigate(`/orders/${createdOrder._id}`, { replace: true });
              })
              .catch(() => {
                navigate(`/orders/${createdOrder._id}?payment=verification_failed`, {
                  replace: true,
                });
              });
          },
        });

        if (typeof razorpay.on === "function") {
          razorpay.on("payment.failed", (paymentFailure) => {
            setError(
              paymentFailure.error?.description ||
                paymentFailure.error?.reason ||
                "Razorpay payment failed."
            );
          });
        }

        razorpay.open();
        return;
      }

      await refreshCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${createdOrder._id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to place your order right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <section className="section-block">
        <div className="container">
          <Loader />
        </div>
      </section>
    );
  }

  if (!cartItems.length) {
    return (
      <section className="section-block">
        <div className="container empty-state-panel">
          <span className="eyebrow">Checkout</span>
          <h1>Your cart is empty, so there is nothing to check out yet.</h1>
          <p>Add products to your cart first, then return here to place your order.</p>
          <Link to="/products" className="primary-button">
            Go to Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="container checkout-layout">
        <div className="checkout-form-panel">
          <span className="eyebrow">Checkout</span>
          <h1>Shipping and order review</h1>

          {cartError ? <p className="status-message error-message">{cartError}</p> : null}
          {error ? <p className="status-message error-message">{error}</p> : null}

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-grid">
              <label className="form-field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
              </label>

              <label className="form-field">
                <span>Address Line</span>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </label>

              <label className="form-field">
                <span>City</span>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </label>

              <label className="form-field">
                <span>State</span>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </label>

              <label className="form-field">
                <span>Postal Code</span>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code"
                />
              </label>

              <label className="form-field">
                <span>Country</span>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </label>
            </div>

            <fieldset className="payment-method-panel">
              <legend>Choose a payment method</legend>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={formData.paymentMethod === "cash_on_delivery"}
                  onChange={handleChange}
                />
                <span>Cash on Delivery</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={formData.paymentMethod === "razorpay"}
                  onChange={handleChange}
                />
                <span>Razorpay Checkout (test mode)</span>
              </label>
            </fieldset>

            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>

        <aside className="checkout-summary-panel">
          <h2>Order Review</h2>

          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>

                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Total items</span>
            <strong>{totalQuantity}</strong>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(summary.itemsPrice)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{summary.shippingPrice ? formatCurrency(summary.shippingPrice) : "Free"}</strong>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <strong>{formatCurrency(summary.taxPrice)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{formatCurrency(summary.totalPrice)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
