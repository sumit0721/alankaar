/**
 * Input Validation Utilities
 * Provides reusable validation functions for data validation
 * This ensures consistent validation across all endpoints
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

export const validateProductData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Product name is required");
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push("Product description is required");
  }

  if (typeof data.price !== "number" || data.price <= 0) {
    errors.push("Product price must be a positive number");
  }

  if (typeof data.quantity !== "number" || data.quantity < 0) {
    errors.push("Product quantity must be a non-negative number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateOrderData = (data) => {
  const errors = [];

  if (!data.shippingAddress || !data.shippingAddress.fullName) {
    errors.push("Full name in shipping address is required");
  }

  if (!data.shippingAddress || !data.shippingAddress.street) {
    errors.push("Street address is required");
  }

  if (!data.shippingAddress || !data.shippingAddress.city) {
    errors.push("City is required");
  }

  if (!data.shippingAddress || !data.shippingAddress.country) {
    errors.push("Country is required");
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push("Order must contain at least one item");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
