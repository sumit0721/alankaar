const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export const getStatusEmailContent = (status, order, userName) => {
  const orderShortId = order._id.toString().slice(-6).toUpperCase();

  const itemsHtml = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e0d5;color:#2f211d;">
          ${item.name}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e0d5;text-align:center;color:#2f211d;">
          ${item.quantity}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e0d5;text-align:right;color:#2f211d;">
          ${formatINR(item.price)}
        </td>
      </tr>`
    )
    .join("");

  const orderDetailsBlock = `
    <div style="background:#fdf6f0;border-radius:8px;padding:20px;margin:24px 0;">
      <h3 style="margin:0 0 16px;color:#2f211d;font-size:1rem;font-family:sans-serif;">
        Order Details — #${orderShortId}
      </h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f0e0d5;">
            <th style="padding:8px 12px;text-align:left;font-size:0.82rem;color:#755d54;font-family:sans-serif;">PRODUCT</th>
            <th style="padding:8px 12px;text-align:center;font-size:0.82rem;color:#755d54;font-family:sans-serif;">QTY</th>
            <th style="padding:8px 12px;text-align:right;font-size:0.82rem;color:#755d54;font-family:sans-serif;">PRICE</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="margin-top:16px;padding-top:12px;border-top:2px solid #f0e0d5;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-family:sans-serif;">
          <span style="color:#755d54;">Subtotal</span>
          <span style="color:#2f211d;">${formatINR(order.itemsPrice)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-family:sans-serif;">
          <span style="color:#755d54;">Shipping</span>
          <span style="color:#2f211d;">${order.shippingPrice === 0 ? "Free" : formatINR(order.shippingPrice)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-family:sans-serif;">
          <span style="color:#755d54;">Tax</span>
          <span style="color:#2f211d;">${formatINR(order.taxPrice)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.05rem;margin-top:8px;padding-top:8px;border-top:1px solid #f0e0d5;font-family:sans-serif;">
          <span style="color:#2f211d;">Total</span>
          <span style="color:#be6a4a;">${formatINR(order.totalPrice)}</span>
        </div>
      </div>
    </div>
    <div style="background:#fdf6f0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 12px;color:#2f211d;font-size:1rem;font-family:sans-serif;">
        Payment & Shipping Info
      </h3>
      <p style="margin:4px 0;color:#755d54;font-family:sans-serif;">
        Payment Method:
        <strong style="color:#2f211d;">
          ${order.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : "Razorpay"}
        </strong>
      </p>
      <p style="margin:4px 0;color:#755d54;font-family:sans-serif;">
        Payment Status:
        <strong style="color:${order.isPaid ? "#255f38" : "#8f5a12"};">
          ${order.isPaid ? "Paid" : "Pending"}
        </strong>
      </p>
      <p style="margin:4px 0;color:#755d54;font-family:sans-serif;">
        Shipping To:
        <strong style="color:#2f211d;">
          ${order.shippingAddress.fullName},
          ${order.shippingAddress.addressLine1},
          ${order.shippingAddress.city},
          ${order.shippingAddress.state} — ${order.shippingAddress.postalCode},
          ${order.shippingAddress.country}
        </strong>
      </p>
    </div>
  `;

  const footer = `
    <div style="background:#fdf6f0;padding:20px 40px;text-align:center;border-top:1px solid #f0e0d5;">
      <p style="color:#755d54;font-size:0.82rem;margin:0;font-family:sans-serif;">
        © ALANKAAR — Beauty for Everyone
      </p>
    </div>
  `;

  const templates = {
    shipped: {
      subject: `Your ALANKAAR Order #${orderShortId} Has Been Shipped! 📦`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f0e0d5;">
          <div style="background:#be6a4a;padding:32px 40px;text-align:center;">
            <p style="font-size:2.5rem;margin:0;">📦</p>
            <h1 style="color:#fff;margin:12px 0 4px;font-size:1.6rem;">Your Order is On Its Way!</h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;">Order #${orderShortId}</p>
          </div>
          <div style="padding:32px 40px;">
            <p style="color:#2f211d;font-size:1rem;">Hi <strong>${userName}</strong>,</p>
            <p style="color:#755d54;line-height:1.7;">
              Great news! Your ALANKAAR order has been shipped and is on its way to you.
              Sit tight — your beauty essentials will arrive soon.
            </p>
            ${orderDetailsBlock}
            <p style="color:#755d54;font-size:0.88rem;text-align:center;">
              Questions? Reply to this email and we will help you out.
            </p>
          </div>
          ${footer}
        </div>
      `,
    },

    delivered: {
      subject: `Your ALANKAAR Order #${orderShortId} Has Been Delivered! ✅`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f0e0d5;">
          <div style="background:#255f38;padding:32px 40px;text-align:center;">
            <p style="font-size:2.5rem;margin:0;">✅</p>
            <h1 style="color:#fff;margin:12px 0 4px;font-size:1.6rem;">Order Delivered Successfully!</h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;">Order #${orderShortId}</p>
          </div>
          <div style="padding:32px 40px;">
            <p style="color:#2f211d;font-size:1rem;">Hi <strong>${userName}</strong>,</p>
            <p style="color:#755d54;line-height:1.7;">
              Your ALANKAAR order has been delivered! We hope you love your new products.
              If you enjoy them, please leave a review on the product page — it really helps other customers.
            </p>
            ${orderDetailsBlock}
            <div style="text-align:center;margin-top:24px;padding:20px;background:#edf8f0;border-radius:8px;">
              <p style="color:#255f38;font-weight:700;margin:0 0 8px;">Enjoying your order?</p>
              <p style="color:#755d54;font-size:0.88rem;margin:0;">
                Log in to your account and leave a review to help other customers.
              </p>
            </div>
          </div>
          ${footer}
        </div>
      `,
    },

    cancelled: {
      subject: `Your ALANKAAR Order #${orderShortId} Has Been Cancelled`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f0e0d5;">
          <div style="background:#9a3f28;padding:32px 40px;text-align:center;">
            <p style="font-size:2.5rem;margin:0;">❌</p>
            <h1 style="color:#fff;margin:12px 0 4px;font-size:1.6rem;">Order Cancelled</h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;">Order #${orderShortId}</p>
          </div>
          <div style="padding:32px 40px;">
            <p style="color:#2f211d;font-size:1rem;">Hi <strong>${userName}</strong>,</p>
            <p style="color:#755d54;line-height:1.7;">
              We are sorry to inform you that your ALANKAAR order has been cancelled.
              If you have any questions or believe this was a mistake, please contact us
              by replying to this email.
            </p>
            ${orderDetailsBlock}
            <div style="text-align:center;margin-top:24px;padding:20px;background:#fff0ec;border-radius:8px;border:1px solid #f0c4b8;">
              <p style="color:#9a3f28;font-weight:700;margin:0 0 8px;">Need help?</p>
              <p style="color:#755d54;font-size:0.88rem;margin:0;">
                Reply to this email and our team will assist you promptly.
              </p>
            </div>
          </div>
          ${footer}
        </div>
      `,
    },
  };

  return templates[status] || null;
};
