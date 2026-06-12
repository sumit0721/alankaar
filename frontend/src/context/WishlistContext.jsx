import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getWishlist,
  addToWishlist as addToWishlistAPI,
  removeFromWishlist as removeFromWishlistAPI,
} from "../services/authService.js";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await getWishlist();
        const ids = response.data.data.map((item) =>
          typeof item === "string" ? item : item._id
        );
        setWishlistIds(new Set(ids));
      } catch {
        setWishlistIds(new Set());
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user?._id]);

  const addToWishlist = async (productId) => {
    try {
      const response = await addToWishlistAPI(productId);
      setWishlistIds(new Set(response.data.data.map((id) => id.toString())));
      toast.success("Added to wishlist");
    } catch {
      toast.error("Couldn't add to wishlist");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await removeFromWishlistAPI(productId);
      setWishlistIds(new Set(response.data.data.map((id) => id.toString())));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Couldn't remove from wishlist");
    }
  };

  const isInWishlist = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
