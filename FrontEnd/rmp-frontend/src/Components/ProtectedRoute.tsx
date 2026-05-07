import { Navigate, Outlet, useLocation } from "react-router-dom";
import { type AppRole, useAuth } from "../Auth/AuthContext";
import { ROUTES } from "../Constants/routes";
import { Spinner } from "./UI/Index";
import "./ProtectedRoute.css";

interface ProtectedRouteProps {
  requiredRoles?: AppRole | AppRole[];
}

/**
 * Guard de ruta que verifica autenticación y roles.
 *
 * - Mientras carga: muestra spinner de verificación.
 * - Sin autenticación: redirige a LOGIN.
 * - Sin rol requerido: redirige a SIN_ACCESO con contexto de estado.
 * - Con permisos: renderiza el <Outlet />.
 */
export function ProtectedRoute({ requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, roles } = useAuth();
  const location = useLocation();
  const hasAnyRequiredRole = (required: AppRole | AppRole[]): boolean => {
    const requiredList = (Array.isArray(required) ? required : [required]).map((r) => r.toLowerCase());
    const userRoles = (roles ?? []).map((r) => r.toLowerCase());

    // Permitir acceso si tiene al menos uno de los grupos requeridos.
    return requiredList.some((requiredRole) => userRoles.includes(requiredRole));
  };

  // ── Verificando sesión ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="pr-loading">
        <div className="pr-loading-inner">
          <Spinner size="lg" />
          <p className="pr-loading-text">Verificando permisos…</p>
        </div>
      </div>
    );
  }

  // ── Sin autenticación → Login ────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ── Sin rol requerido → Sin acceso ──────────────────────────────────────
  if (requiredRoles && !hasAnyRequiredRole(requiredRoles)) {
    return (
      <Navigate
        to={ROUTES.SIN_ACCESO}
        replace
        state={{ requiredRoles, from: location.pathname }}
      />
    );
  }

  // ── Permisos correctos → Renderizar ─────────────────────────────────────
  return <Outlet />;
}