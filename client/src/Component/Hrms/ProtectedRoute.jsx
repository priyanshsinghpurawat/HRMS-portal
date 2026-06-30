import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import Loader from "../../Reuse/Loader";

function ProtectedRoute({ children, allowedRoles }) {
  const { companyUser, companyLoading } = useContext(AppContext);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user data exists in memory or localStorage fallback
  useEffect(() => {
    // Small delay to let context load from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Still loading auth state
  if (companyLoading || isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader />
      </div>
    );
  }

  // Not logged in — redirect to login, save intended path
  if (!companyUser) {
    return <Navigate to="/hrm-login" state={{ from: location.pathname }} replace />;
  }

  // Wrong role — redirect to appropriate dashboard
  const userRole = companyUser?.role;
  if (!allowedRoles.includes(userRole)) {
    // Redirect to correct dashboard based on role
    if (userRole === "company") {
      return <Navigate to="/company-dashboard" replace />;
    } else if (userRole === "hr") {
      return <Navigate to="/hrdashboard" replace />;
    } else if (userRole === "employee") {
      return <Navigate to="/employeedashboard" replace />;
    }
    return <Navigate to="/hrms" replace />;
  }

  // Authorized — render children
  return children;
}

export default ProtectedRoute;          