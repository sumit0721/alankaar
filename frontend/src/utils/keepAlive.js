/**
 * keepAlive.js — Activity-gated backend ping
 *
 * Philosophy (per user requirement):
 * - DO ping the backend while the user is actively using the site.
 *   This keeps Render warm during active sessions.
 * - DO NOT ping if the user is idle, the tab is hidden, or the browser
 *   is in the background. Let Render sleep — the product cache will
 *   serve instant results when the user returns and Render wakes up.
 *
 * Trigger conditions (ANY of these resets the activity timer):
 * - Mouse movement
 * - Click
 * - Keyboard input
 * - Scroll
 *
 * Stop conditions:
 * - Tab hidden (Page Visibility API: document.hidden)
 * - No activity for IDLE_TIMEOUT_MS (5 minutes)
 *
 * Ping interval: every 8 minutes while active.
 * (Render sleeps after 15 min inactivity; 8 min keeps it alive with margin)
 */

const PING_INTERVAL_MS  = 8 * 60 * 1000; // 8 minutes
const IDLE_TIMEOUT_MS   = 5 * 60 * 1000; // 5 minutes of no interaction = idle

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

let pingTimer = null;
let idleTimer = null;
let isActive  = false;

const BACKEND_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
    : "http://localhost:5000";

const ping = async () => {
  // Never ping if the tab is hidden
  if (document.hidden) return;

  try {
    await fetch(`${BACKEND_URL}/api/health`, {
      method: "GET",
      // Short timeout — this is fire-and-forget, not business logic
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Silently ignore — if the backend is unreachable, the user will
    // see errors on their actual requests. This ping is just a courtesy.
  }
};

const startPingLoop = () => {
  if (pingTimer) return; // Already running
  pingTimer = setInterval(ping, PING_INTERVAL_MS);
};

const stopPingLoop = () => {
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
};

const resetIdleTimer = () => {
  // User is active — ensure ping loop is running
  if (!isActive) {
    isActive = true;
    startPingLoop();
  }

  // Reset the idle countdown
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    // User has been idle for IDLE_TIMEOUT_MS — stop pinging
    isActive = false;
    stopPingLoop();
  }, IDLE_TIMEOUT_MS);
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    // Tab went to background — stop pinging immediately
    stopPingLoop();
  } else {
    // Tab came back into focus — resume if user was recently active
    if (isActive) {
      startPingLoop();
    }
  }
};

/**
 * Call this once at app startup (e.g., in main.jsx or App.jsx).
 * Returns a cleanup function to call on app unmount.
 */
export const initKeepAlive = () => {
  // Listen for user activity
  ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, resetIdleTimer, { passive: true });
  });

  // Listen for tab visibility changes
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup function for React useEffect return
  return () => {
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, resetIdleTimer);
    });
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    stopPingLoop();
    if (idleTimer) clearTimeout(idleTimer);
  };
};
