import { useContext } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../Component/Context/AppContext";
import Loader from "../Reuse/Loader";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, authLoading } = useContext(AuthContext);
  const location = useLocation();

  // ─── CRITICAL: Show loader while checking auth ───
  // This prevents redirecting to login during page refresh
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  // ─── Only redirect AFTER auth check completes ───
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated, authLoading } = useContext(AuthContext);
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (isAuthenticated) {
    const from = location.state?.from || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export const HRMSProtectedRoute = ({ allowedRoles = [] }) => {
  const { companyUser, companyLoading } = useContext(AuthContext);
  const location = useLocation();

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (!companyUser) {
    return (
      <Navigate
        to="/hrm-login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(companyUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;