import { formatCurrency } from "../../utils/formatCurrency.js";

function CartItem({ item, onIncrease, onDecrease, onRemove, disabled }) {
  return (
    <article className="cart-item">
      <div className="cart-item-main">
        {item.image ? <img src={item.image} alt={item.name} className="cart-item-image" /> : null}

        <h3>{item.name}</h3>
        <p className="cart-item-meta">Unit price: {formatCurrency(item.price)}</p>
      </div>

      <div className="cart-item-actions">
        <div className="quantity-control">
          <button type="button" onClick={onDecrease} disabled={disabled || item.quantity <= 1}>
            -
          </button>
          <span>{item.quantity}</span>
          <button type="button" onClick={onIncrease} disabled={disabled}>
            +
          </button>
        </div>

        <strong>{formatCurrency(item.price * item.quantity)}</strong>

        <button type="button" className="text-button" onClick={onRemove} disabled={disabled}>
          Remove
        </button>
      </div>
    </article>
  );
}

export default CartItem;
