import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { type AppRole } from "../Auth/msalConfig";
import { ROUTES } from "../Constants/routes";

interface ProtectedRouteProps {
  requiredRoles?: AppRole | AppRole[];
}

export function ProtectedRoute({ requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#475569] text-xs font-mono">Verificando permisos…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return (
      <Navigate
        to={ROUTES.SIN_ACCESO}
        replace
        state={{ requiredRoles: roles, from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}