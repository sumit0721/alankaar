import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="container nav-wrapper">
        <Link to="/" className="brand-logo">
          ALANKAAR
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart {totalQuantity ? `(${totalQuantity})` : ""}</NavLink>
          {user ? (
            <>
              <NavLink to="/orders">Orders</NavLink>
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
      </div>
    </header>
  );
}

export default Navbar;
