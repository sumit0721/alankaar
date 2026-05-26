import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const links = [
  { to: "/admin", label: "Dashboard", icon: "□", end: true },
  { to: "/admin/products", label: "Products", icon: "◇" },
  { to: "/admin/orders", label: "Orders", icon: "▣" },
  { to: "/admin/users", label: "Users", icon: "○" },
];

function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">ALANKAAR</div>

        <nav className="admin-sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="admin-sidebar-link"
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-profile">
          <strong>{user?.name}</strong>
          <span>Admin</span>
        </div>
      </aside>

      <section className="admin-main">
        <div className="admin-header">
          <h2 className="admin-page-title">ALANKAAR Admin</h2>
          <div className="admin-header-right">
            <span className="admin-header-brand">ALANKAAR Admin</span>
            <span className="admin-header-user">👤 {user?.name}</span>
          </div>
        </div>
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
