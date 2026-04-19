import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
