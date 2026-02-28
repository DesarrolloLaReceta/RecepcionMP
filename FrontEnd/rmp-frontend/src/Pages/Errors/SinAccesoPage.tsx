import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../Constants/routes";
import { AppRoles, type AppRole } from "../../Auth/msalConfig";

// ─── MAPA PERMISOS POR MÓDULO ─────────────────────────────────────────────────
// Fuente de verdad visual de qué rol puede acceder a qué.
// Debe mantenerse sincronizado con los guards de App.tsx.

interface ModuleAccess {
  label:   string;
  icon:    string;   // SVG path d=""
  roles:   AppRole[];
}

const MODULE_ACCESS: ModuleAccess[] = [
  {
    label: "Dashboard",
    icon:  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
    roles: [AppRoles.Administrador, AppRoles.Calidad, AppRoles.Recepcion, AppRoles.Compras, AppRoles.Auditor],
  },
  {
    label: "Recepciones",
    icon:  "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16",
    roles: [AppRoles.Administrador, AppRoles.Recepcion, AppRoles.Calidad],
  },
  {
    label: "Lotes",
    icon:  "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
    roles: [AppRoles.Administrador, AppRoles.Recepcion, AppRoles.Calidad, AppRoles.Auditor],
  },
  {
    label: "Liberación de lotes",
    icon:  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    roles: [AppRoles.Administrador, AppRoles.Calidad],
  },
  {
    label: "No conformidades",
    icon:  "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    roles: [AppRoles.Administrador, AppRoles.Calidad, AppRoles.Recepcion],
  },
  {
    label: "Órdenes de compra",
    icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    roles: [AppRoles.Administrador, AppRoles.Compras, AppRoles.Recepcion],
  },
  {
    label: "Maestros",
    icon:  "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    roles: [AppRoles.Administrador],
  },
];

// Color por rol
const ROL_CFG: Record<AppRole, { color: string; bg: string; border: string }> = {
  [AppRoles.Administrador]: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
  [AppRoles.Calidad]:       { color: "#86EFAC", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.25)"  },
  [AppRoles.Recepcion]:     { color: "#93C5FD", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)" },
  [AppRoles.Compras]:       { color: "#C4B5FD", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)" },
  [AppRoles.Auditor]:       { color: "#94A3B8", bg: "rgba(100,116,139,0.10)", border: "rgba(100,116,139,0.2)" },
};

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function SinAccesoPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // El guard de ruta puede pasar el rol requerido y la ruta intentada
  const state      = location.state as { requiredRoles?: AppRole[]; from?: string } | null;
  const requeridos = state?.requiredRoles ?? [];
  const desde      = state?.from;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-8 p-6"
      style={{ background: "#0A0F1A" }}
    >
      {/* ── Código de error con ícono superpuesto ── */}
      <div className="relative select-none">
        <p
          className="text-[130px] font-black leading-none font-mono"
          style={{
            color: "transparent",
            WebkitTextStroke: "1px rgba(239,68,68,0.15)",
            filter: "blur(0.5px)",
          }}
        >
          403
        </p>

        {/* Escudo con candado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <rect x="9" y="11" width="6" height="5" rx="1" />
              <path d="M12 11V9a2 2 0 00-2-2v0a2 2 0 00-2 2v2" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Mensaje principal ── */}
      <div className="text-center flex flex-col gap-2 max-w-sm">
        <h1 className="text-xl font-bold text-white">Acceso denegado</h1>
        <p className="text-sm text-[#475569] leading-relaxed">
          No tienes los permisos necesarios para acceder a esta sección.
          {desde && (
            <span className="block mt-1 font-mono text-[11px] text-[#2D3748]">
              {desde}
            </span>
          )}
        </p>
        <p className="text-[10px] text-[#2D3748] font-mono mt-1">
          ERROR 403 · PERMISOS INSUFICIENTES
        </p>
      </div>

      {/* ── Roles requeridos (si el guard los pasó) ── */}
      {requeridos.length > 0 && (
        <div
          className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[10px] text-[#334155] font-mono tracking-widest uppercase">
            Roles con acceso
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {requeridos.map(rol => {
              const c = ROL_CFG[rol] ?? ROL_CFG[AppRoles.Auditor];
              return (
                <span
                  key={rol}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold"
                  style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                >
                  {rol}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mapa de accesos por módulo ── */}
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase font-mono text-[#334155]">
            Mapa de permisos del sistema
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          {MODULE_ACCESS.map(mod => (
            <div
              key={mod.label}
              className="flex items-center gap-4 px-5 py-3"
            >
              {/* Ícono módulo */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={mod.icon} />
                </svg>
              </div>

              {/* Nombre */}
              <p className="text-[12px] text-[#64748B] w-[140px] shrink-0">{mod.label}</p>

              {/* Roles con acceso */}
              <div className="flex flex-wrap gap-1.5">
                {mod.roles.map(rol => {
                  const c = ROL_CFG[rol] ?? ROL_CFG[AppRoles.Auditor];
                  return (
                    <span
                      key={rol}
                      className="px-2 py-0.5 rounded text-[9px] font-bold font-mono"
                      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                    >
                      {rol}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748B",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLElement).style.color      = "#94A3B8";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLElement).style.color      = "#64748B";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </button>

        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#FCA5A5",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.18)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" />
          </svg>
          Ir al Dashboard
        </button>
      </div>

      {/* ── Pie ── */}
      <p className="text-[10px] text-[#1E293B] font-mono">
        Contacta al administrador del sistema para solicitar acceso.
      </p>
    </div>
  );
}