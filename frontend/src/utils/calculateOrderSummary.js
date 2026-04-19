export function calculateOrderSummary(itemsPrice) {
  const safeItemsPrice = Number(itemsPrice || 0);
  const shippingPrice = safeItemsPrice >= 75 ? 0 : safeItemsPrice > 0 ? 8 : 0;
  const taxPrice = Number((safeItemsPrice * 0.12).toFixed(2));
  const totalPrice = Number((safeItemsPrice + shippingPrice + taxPrice).toFixed(2));

  return {
    itemsPrice: safeItemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
}
