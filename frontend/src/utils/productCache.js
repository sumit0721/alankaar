/**
 * productCache.js — sessionStorage-based product cache
 *
 * Strategy: stale-while-revalidate
 * - On first visit: fetch from API, store in sessionStorage
 * - On return visit: show cached data INSTANTLY, then refresh in background
 * - TTL: 5 minutes. After expiry, force a fresh fetch on next visit.
 * - Cache is scoped to the browser session (cleared when tab closes).
 *   This is intentional — no stale product data across sessions.
 *
 * Why sessionStorage and not localStorage?
 * - Products change (price, stock, featured status). We don't want
 *   a user from yesterday seeing stale pricing.
 * - sessionStorage is automatically cleared when the tab closes,
 *   giving us a natural "fresh on every visit" guarantee.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Build a deterministic cache key from query params.
 * Objects with the same keys in different order produce the same key.
 */
export const buildCacheKey = (params = {}) => {
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  return `product_cache:${JSON.stringify(sorted)}`;
};

/**
 * Read cached products for a given cache key.
 * Returns null if no cache exists or if the cache has expired.
 */
export const readCache = (cacheKey) => {
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    const isExpired = Date.now() - timestamp > CACHE_TTL_MS;

    if (isExpired) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

/**
 * Write products to cache with current timestamp.
 */
export const writeCache = (cacheKey, data) => {
  try {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // sessionStorage can throw if storage quota is exceeded.
    // Silently ignore — cache is a performance enhancement, not required.
  }
};

/**
 * Clear all product cache entries from sessionStorage.
 * Useful when a product is updated by admin.
 */
export const clearProductCache = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("product_cache:")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Silently ignore
  }
};
