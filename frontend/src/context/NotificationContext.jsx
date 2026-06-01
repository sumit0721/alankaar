import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext.jsx";
import { markAllRead, markOneRead } from "../services/notificationService.js";

const NotificationContext = createContext(null);

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5000";

const STATUS_TOAST_CONFIG = {
  shipped: {
    icon: "📦",
    style: {
      background: "#fff0f9",
      color: "#9d174d",
      border: "1px solid #fbcfe8",
    },
  },
  delivered: {
    icon: "✅",
    style: {
      background: "#edf8f0",
      color: "#255f38",
      border: "1px solid #bed9c4",
    },
  },
  cancelled: {
    icon: "❌",
    style: {
      background: "#fff0ec",
      color: "#9a3f28",
      border: "1px solid #f0c4b8",
    },
  },
  processing: {
    icon: "⚙️",
    style: {
      background: "#e8f0fe",
      color: "#1a56cc",
      border: "1px solid #b3c8f5",
    },
  },
  packed: {
    icon: "📫",
    style: {
      background: "#f0e8fe",
      color: "#6b21a8",
      border: "1px solid #d8b4fe",
    },
  },
  pending: {
    icon: "🕐",
    style: {
      background: "#fff5df",
      color: "#8f5a12",
      border: "1px solid #ead2a2",
    },
  },
};

const showNotificationToast = (notification) => {
  const config =
    STATUS_TOAST_CONFIG[notification.status] || STATUS_TOAST_CONFIG.pending;

  toast(notification.message, {
    icon: config.icon,
    duration: 6000,
    style: {
      ...config.style,
      fontFamily: "var(--font-body)",
      fontSize: "0.9rem",
      maxWidth: "90vw",
      borderRadius: "12px",
    },
  });
};

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef(null);
  const shownToastsRef = useRef(new Set());

  const addNotification = (notification) => {
    setNotifications((prev) => {
      // Deduplicate — don't add same notification twice
      if (prev.find((n) => n._id === notification._id)) return prev;
      return [notification, ...prev].slice(0, 20);
    });

    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }

    // Show toast only once per notification ID
    if (!shownToastsRef.current.has(notification._id)) {
      shownToastsRef.current.add(notification._id);
      showNotificationToast(notification);
    }
  };

  const connectSSE = () => {
    // Get token from localStorage — needed because EventSource cannot set headers
    const storedUser = localStorage.getItem("authUser");
    const token = storedUser ? JSON.parse(storedUser)?.token : null;
    if (!token) return;

    // Close any existing connection before opening a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${BASE_URL}/api/notifications/stream?token=${token}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      // SSE comment lines (heartbeat) come through as empty data — ignore
      if (!event.data || event.data.trim() === "") return;

      try {
        const data = JSON.parse(event.data);

        if (data.type === "new_notification") {
          // Instant push from admin action — user is currently online
          addNotification(data.notification);
        }

        if (data.type === "unread_batch") {
          // Sent on connection open — contains all missed notifications
          setNotifications(data.notifications);
          const unread = data.notifications.filter((n) => !n.isRead);
          setUnreadCount(unread.length);

          // Show toast for each unread one not yet shown
          unread.forEach((n) => {
            if (!shownToastsRef.current.has(n._id)) {
              shownToastsRef.current.add(n._id);
              showNotificationToast(n);
            }
          });
        }
      } catch {
        // Ignore JSON parse errors — heartbeat comments are not JSON
      }
    };

    eventSource.onerror = () => {
      // Browser auto-reconnects SSE after ~3 seconds on error
      // No manual handling needed here
    };
  };

  useEffect(() => {
    if (!user) {
      // User logged out — close SSE connection and reset all state
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      shownToastsRef.current.clear();
      return;
    }

    // User logged in — open SSE connection
    connectSSE();

    // Cleanup when component unmounts or user changes
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [user]);

  const markRead = async (notificationId) => {
    try {
      await markOneRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent fail
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silent fail
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
