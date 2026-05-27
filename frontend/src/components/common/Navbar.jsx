import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

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
          <NavLink to="/cart">
            Cart {totalQuantity ? `(${totalQuantity})` : ""}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/wishlist">Wishlist</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              {user.isAdmin ? (
                <NavLink to="/admin">Admin</NavLink>
              ) : null}
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

        {/* Mobile: cart icon + hamburger */}
        <div className="nav-mobile-right">
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
          {user ? (
            <>
              <NavLink to="/orders" onClick={closeMenu}>Orders</NavLink>
              <NavLink to="/wishlist" onClick={closeMenu}>Wishlist</NavLink>
              <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
              <NavLink to="/address-book" onClick={closeMenu}>Address Book</NavLink>
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
