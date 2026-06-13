const PING_URL = `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}/api/health`;
const PING_INTERVAL = 8 * 60 * 1000; // 8 minutes
const IDLE_TIMEOUT = 5 * 60 * 1000;  // 5 minutes

export const initKeepAlive = () => {
  let pingTimer = null;
  let idleTimer = null;
  let isActive = true;

  const ping = () => {
    fetch(PING_URL, { method: "GET" }).catch(() => {});
  };

  const schedulePing = () => {
    clearTimeout(pingTimer);
    if (isActive && !document.hidden) {
      pingTimer = setTimeout(() => {
        ping();
        schedulePing();
      }, PING_INTERVAL);
    }
  };

  const resetIdle = () => {
    clearTimeout(idleTimer);
    if (!isActive) {
      isActive = true;
      schedulePing();
    }
    idleTimer = setTimeout(() => {
      isActive = false;
      clearTimeout(pingTimer);
    }, IDLE_TIMEOUT);
  };

  // CRITICAL CHANGE — fire immediately on mount, do not wait for interaction
  ping();
  schedulePing();

  // Activity listeners keep it alive during continued use
  const events = ["mousemove", "click", "keypress", "scroll", "touchstart"];
  events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));

  const handleVisibilityChange = () => {
    if (document.hidden) {
      isActive = false;
      clearTimeout(pingTimer);
    } else {
      isActive = true;
      ping(); // Ping immediately when tab becomes visible again
      schedulePing();
    }
  };

  // Stop pinging when tab is hidden
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup function for React unmount
  return () => {
    events.forEach(e => window.removeEventListener(e, resetIdle));
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    clearTimeout(pingTimer);
    clearTimeout(idleTimer);
  };
};
