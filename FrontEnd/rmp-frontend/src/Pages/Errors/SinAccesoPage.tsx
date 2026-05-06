import { useNavigate, useLocation } from "react-router-dom";
import { type AppRole, useAuth } from "../../Auth/AuthContext";
import { AD_GROUPS } from "../../Auth/adGroups";
import { ROUTES } from "../../Constants/routes";
import { Button, Badge } from "../../Components/UI/Index";
import "./StylesErrors/Errors.css";

// ─── MAPA DE ACCESO POR MÓDULO ────────────────────────────────────────────────

interface ModuleAccess {
  label: string;
  icon:  string;
  roles: AppRole[];
}

const MODULE_ACCESS: ModuleAccess[] = [
  {
    label: "Dashboard",
    icon:  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
    roles: [AD_GROUPS.ADMINISTRATIVO, AD_GROUPS.CALIDAD, AD_GROUPS.RECIBO],
  },
  {
    label: "Recepciones",
    icon:  "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16",
    roles: [AD_GROUPS.ADMINISTRATIVO, AD_GROUPS.RECIBO, AD_GROUPS.CALIDAD],
  },
  {
    label: "Lotes",
    icon:  "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
    roles: [AD_GROUPS.ADMINISTRATIVO, AD_GROUPS.RECIBO, AD_GROUPS.CALIDAD],
  },
  {
    label: "Liberación de lotes",
    icon:  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    roles: [AD_GROUPS.ADMINISTRATIVO, AD_GROUPS.CALIDAD],
  },
  {
    label: "No conformidades",
    icon:  "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    roles: [AD_GROUPS.ADMINISTRATIVO, AD_GROUPS.CALIDAD, AD_GROUPS.RECIBO],
  },
  {
    label: "Órdenes de compra",
    icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    roles: [AD_GROUPS.ADMINISTRATIVO, AD_GROUPS.RECIBO],
  },
  {
    label: "Maestros",
    icon:  "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    roles: [AD_GROUPS.ADMINISTRATIVO],
  },
];

// ─── COLORES POR ROL ──────────────────────────────────────────────────────────

const ROL_CFG: Record<AppRole, { colorToken: string; bg?: never }> = {
  [AD_GROUPS.ADMINISTRATIVO]: { colorToken: "#F59E0B" },
  [AD_GROUPS.CALIDAD]:       { colorToken: "#86EFAC" },
  [AD_GROUPS.RECIBO]:        { colorToken: "#93C5FD" },
};

// Fallback para roles no definidos
const ROL_FALLBACK = { colorToken: "#94A3B8" };

// ─── COMPONENTE PARA RENDERIZAR BADGES DE ROL ─────────────────────────────────

function RoleBadge({ role }: { role: AppRole }) {
  const config = ROL_CFG[role] ?? ROL_FALLBACK;
  
  return (
    <Badge 
      size="sm" 
      color="custom" 
      colorToken={config.colorToken}
    >
      {role}
    </Badge>
  );
}

// ─── SIN ACCESO PAGE ──────────────────────────────────────────────────────────

export default function SinAccesoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const state      = location.state as { requiredRoles?: AppRole[]; from?: string } | null;
  const requeridos = state?.requiredRoles ?? [];
  const desde      = state?.from;

  const exitBlockedFlow = (target: string) => {
    // Limpiamos la sesión para evitar loops de redirección con permisos inválidos/cacheados.
    logout();
    navigate(target, { replace: true, state: null });
  };

  return (
    <div className="ep-page">

      {/* Número 403 con ícono superpuesto */}
      <div className="ep-number-wrap">
        <p
          className="ep-number"
          style={{ WebkitTextStroke: "1px rgba(239,68,68,0.15)" }}
          aria-hidden="true"
        >
          403
        </p>
        <div className="ep-icon-overlay" aria-hidden="true">
          <div
            className="ep-icon-box"
            style={{
              background: "rgba(239,68,68,0.08)",
              border:     "1px solid rgba(239,68,68,0.20)",
            }}
          >
            <svg
              width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="#EF4444"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <rect x="9" y="11" width="6" height="5" rx="1" />
              <path d="M12 11V9a2 2 0 00-2-2v0a2 2 0 00-2 2v2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Texto */}
      <div className="ep-heading">
        <h1 className="ep-title">Acceso denegado</h1>
        <p className="ep-subtitle">
          No tienes los permisos necesarios para acceder a esta sección.
          {desde && <span className="ep-from">{desde}</span>}
        </p>
        <p className="ep-code">ERROR 403 · PERMISOS INSUFICIENTES</p>
      </div>

      {/* Roles requeridos */}
      {requeridos.length > 0 && (
        <div className="ep-roles-box">
          <p className="ep-roles-label">Roles con acceso</p>
          <div className="ep-roles-list">
            {requeridos.map(rol => (
              <RoleBadge key={rol} role={rol} />
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="ep-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => exitBlockedFlow(ROUTES.LOGIN)}
          iconLeft="M15 18l-6-6 6-6"
        >
          Ir al Login
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => exitBlockedFlow(ROUTES.DASHBOARD)}
          iconLeft="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"
        >
          Reiniciar e ir al Dashboard
        </Button>
      </div>

      {/* Mapa de permisos del sistema */}
      <div className="ep-map">
        <div className="ep-map-header">
          <p className="ep-map-title">Mapa de permisos del sistema</p>
        </div>

        {MODULE_ACCESS.map(mod => (
          <div key={mod.label} className="ep-map-row">

            {/* Ícono del módulo */}
            <div className="ep-map-icon" aria-hidden="true">
              <svg
                width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="#475569"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              >
                {mod.icon.split(" M").map((seg, i) => (
                  <path key={i} d={i === 0 ? seg : "M" + seg} />
                ))}
              </svg>
            </div>

            {/* Nombre del módulo */}
            <p className="ep-map-name">{mod.label}</p>

            {/* Badges de roles con acceso */}
            <div className="ep-map-badges">
              {mod.roles.map(rol => (
                <RoleBadge key={rol} role={rol} />
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}