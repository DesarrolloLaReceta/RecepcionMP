import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { type AppRole } from "../Auth/msalConfig";
import { ROUTES } from "../Constants/routes";
import { Spinner } from "./UI/Index";
import "./StylesComponents/ProtectedRoute.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  requiredRoles?: AppRole | AppRole[];
}

// ─── PROTECTED ROUTE ──────────────────────────────────────────────────────────

/**
 * Guard de ruta que verifica autenticación y roles.
 *
 * - Mientras carga: muestra spinner de verificación.
 * - Sin autenticación: redirige a LOGIN.
 * - Sin rol requerido: redirige a SIN_ACCESO con contexto de estado.
 * - Con permisos: renderiza el <Outlet />.
 *
 * @example
 * // Sin restricción de rol
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/" element={<Dashboard />} />
 * </Route>
 *
 * // Con roles requeridos
 * <Route element={<ProtectedRoute requiredRoles={[AppRoles.Calidad, AppRoles.Administrador]} />}>
 *   <Route path="/liberacion" element={<LiberacionPage />} />
 * </Route>
 */
export function ProtectedRoute({ requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

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

  // ── Permisos correctos → Renderizar ─────────────────────────────────────
  return <Outlet />;
}