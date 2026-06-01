import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext.jsx";

function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = (status) => {
    const icons = {
      shipped: "📦",
      delivered: "✅",
      cancelled: "❌",
      processing: "⚙️",
      packed: "📫",
      pending: "🕐",
    };
    return icons[status] || "🔔";
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="notification-bell-wrapper">
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="notification-backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <strong>Notifications</strong>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notification-mark-all"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <p>🔔</p>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    to={`/orders/${n.orderId}`}
                    key={n._id}
                    className={`notification-item ${n.isRead ? "read" : "unread"}`}
                    onClick={() => {
                      markRead(n._id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="notification-icon">
                      {getStatusIcon(n.status)}
                    </span>
                    <div className="notification-content">
                      <p className="notification-message">{n.message}</p>
                      <span className="notification-time">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    {!n.isRead && <span className="notification-dot" />}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
