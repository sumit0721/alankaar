import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container nav-wrapper">
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          ALANKAAR
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/skin-quiz">Skin Quiz</NavLink>
          <NavLink to="/cart">
            Cart {totalQuantity ? `(${totalQuantity})` : ""}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/wishlist" title="Wishlist" className="nav-icon-link">❤️</NavLink>
              <NavLink to="/profile" title="Profile" className="nav-icon-link" style={{ color: "var(--color-accent)" }}>
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle" }}>
                  <circle cx="16" cy="16" r="14" fill="currentColor" />
                  <circle cx="16" cy="13" r="4.5" fill="#fff" />
                  <path d="M7 26.5C7 21.8 11 18 16 18s9 3.8 9 8.5H7z" fill="#fff" />
                </svg>
              </NavLink>
              {user.isAdmin ? (
                <NavLink to="/admin" title="Admin Panel" className="nav-icon-link">🛠️</NavLink>
              ) : null}
              {user && <NotificationBell />}
              <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
              <button type="button" className="nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>

        {/* Mobile: cart icon + bell + hamburger */}
        <div className="nav-mobile-right">
          {user && <NotificationBell />}
          <Link to="/cart" className="mobile-cart-icon" onClick={closeMenu}>
            🛒
            {totalQuantity ? (
              <span className="cart-badge">{totalQuantity}</span>
            ) : null}
          </Link>

          <button
            type="button"
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <nav className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/products" onClick={closeMenu}>Products</NavLink>
          <NavLink to="/skin-quiz" onClick={closeMenu}>Skin Quiz</NavLink>
          {user ? (
            <>
              <NavLink to="/orders" onClick={closeMenu}>Orders</NavLink>
              <NavLink to="/wishlist" onClick={closeMenu}>Wishlist</NavLink>
              <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
              {user.isAdmin ? (
                <NavLink to="/admin" onClick={closeMenu}>Admin Panel</NavLink>
              ) : null}
              <button type="button" className="nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
              <NavLink to="/register" onClick={closeMenu}>Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
