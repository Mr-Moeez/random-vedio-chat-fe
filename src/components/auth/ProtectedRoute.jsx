import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black dark:bg-slate-950 dark:text-white">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;