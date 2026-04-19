import { useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import CartItem from "../components/cart/CartItem.jsx";
import CartSummary from "../components/cart/CartSummary.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

function CartPage() {
  const { user } = useAuth();
  const {
    cartItems,
    totalAmount,
    totalQuantity,
    cartLoading,
    cartError,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  } = useCart();
  const [pendingItemId, setPendingItemId] = useState("");
  const [actionError, setActionError] = useState("");

  if (cartLoading) {
    return (
      <section className="section-block">
        <div className="container">
          <Loader />
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section-block">
        <div className="container empty-state-panel">
          <span className="eyebrow">Cart Access</span>
          <h1>Login to manage your cart and continue to checkout.</h1>
          <p>
            In this version, cart data is stored in the backend for each authenticated user,
            which is why login is required before adding items and placing orders.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="primary-button">
              Login
            </Link>
            <Link to="/products" className="secondary-button">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="container cart-layout">
        <div>
          <h1>Your Cart</h1>
          <p className="cart-note">
            Your cart is now connected to the backend, so quantity changes and item removals
            are stored for your signed-in account.
          </p>

          {cartError ? <p className="status-message error-message">{cartError}</p> : null}
          {actionError ? <p className="status-message error-message">{actionError}</p> : null}

          {cartItems.length ? (
            cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                disabled={pendingItemId === item.productId}
                onIncrease={async () => {
                  try {
                    setActionError("");
                    setPendingItemId(item.productId);
                    await updateCartItemQuantity(item.productId, item.quantity + 1);
                  } catch (error) {
                    setActionError(error.message);
                  } finally {
                    setPendingItemId("");
                  }
                }}
                onDecrease={async () => {
                  try {
                    setActionError("");
                    setPendingItemId(item.productId);
                    await updateCartItemQuantity(item.productId, item.quantity - 1);
                  } catch (error) {
                    setActionError(error.message);
                  } finally {
                    setPendingItemId("");
                  }
                }}
                onRemove={async () => {
                  try {
                    setActionError("");
                    setPendingItemId(item.productId);
                    await removeCartItem(item.productId);
                  } catch (error) {
                    setActionError(error.message);
                  } finally {
                    setPendingItemId("");
                  }
                }}
              />
            ))
          ) : (
            <div className="empty-state-panel">
              <h2>Your cart is currently empty.</h2>
              <p>Explore the collection and add a few products to continue the order flow.</p>
              <Link to="/products" className="primary-button">
                Shop Products
              </Link>
            </div>
          )}
        </div>

        <CartSummary
          totalAmount={totalAmount}
          totalQuantity={totalQuantity}
          onClear={async () => {
            try {
              setActionError("");
              await clearCart();
            } catch (error) {
              setActionError(error.message);
            }
          }}
          clearDisabled={!cartItems.length}
          checkoutDisabled={!cartItems.length || Boolean(pendingItemId)}
        />
      </div>
    </section>
  );
}

export default CartPage;
