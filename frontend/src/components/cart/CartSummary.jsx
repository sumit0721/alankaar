import { Link } from "react-router-dom";

import { calculateOrderSummary } from "../../utils/calculateOrderSummary.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

function CartSummary({
  totalAmount,
  totalQuantity,
  onClear,
  clearDisabled,
  checkoutDisabled,
}) {
  const summary = calculateOrderSummary(totalAmount);

  return (
    <aside className="cart-summary">
      <h3>Order Summary</h3>
      <div className="summary-row">
        <span>Items</span>
        <strong>{totalQuantity}</strong>
      </div>
      <div className="summary-row">
        <span>Subtotal</span>
        <strong>{formatCurrency(summary.itemsPrice)}</strong>
      </div>
      <div className="summary-row">
        <span>Estimated shipping</span>
        <strong>{summary.shippingPrice ? formatCurrency(summary.shippingPrice) : "Free"}</strong>
      </div>
      <div className="summary-row">
        <span>Estimated tax</span>
        <strong>{formatCurrency(summary.taxPrice)}</strong>
      </div>
      <div className="summary-row total">
        <span>Estimated total</span>
        <strong>{formatCurrency(summary.totalPrice)}</strong>
      </div>

      <div className="summary-actions">
        <Link
          to="/checkout"
          className={checkoutDisabled ? "secondary-button disabled-link" : "primary-button"}
          aria-disabled={checkoutDisabled}
          onClick={(event) => {
            if (checkoutDisabled) {
              event.preventDefault();
            }
          }}
        >
          Proceed to Checkout
        </Link>

        <button
          type="button"
          className="secondary-button"
          onClick={onClear}
          disabled={clearDisabled}
        >
          Clear Cart
        </button>
      </div>
    </aside>
  );
}

export default CartSummary;
