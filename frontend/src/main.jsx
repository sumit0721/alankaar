import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import "./styles/variables.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NotificationProvider>
              <App />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    fontFamily: "var(--font-body)",
                    fontSize: "0.92rem",
                    maxWidth: "90vw",
                    borderRadius: "12px",
                  },
                }}
              />
            </NotificationProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
