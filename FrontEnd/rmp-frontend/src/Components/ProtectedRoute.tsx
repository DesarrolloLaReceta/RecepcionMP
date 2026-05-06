import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { ROUTES } from "../Constants/routes";
import { Spinner } from "./UI/Index";
import "./ProtectedRoute.css";

// ─── Definición local de roles (coincide con PerfilUsuario en backend) ───────
export type AppRole = 
  | "Administrador"
  | "App_Calidad_LE"
  | "App_Recibo"
  | "Compras"
  | "RecepcionAlmacen";

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
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Función auxiliar para verificar grupos del AD
  const hasRole = (roles: AppRole | AppRole[]): boolean => {
    // IMPORTANTE: Ahora buscamos en 'grupos' (Active Directory)
    if (!user?.grupos || !Array.isArray(user.grupos)) return false;
    
    const required = Array.isArray(roles) ? roles : [roles];
    
    // Verificamos si alguno de los grupos del usuario coincide con los requeridos
    return required.some(role => user.grupos.includes(role));
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
  if (requiredRoles && !hasRole(requiredRoles)) {
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