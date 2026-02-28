import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";
import { AppRoles } from "../../Auth/msalConfig";
import { ROUTES } from "../../Constants/routes";

// ─── ÍCONOS ───────────────────────────────────────────────────────────────────

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  dashboard:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  recepciones:   "M5 3h14a2 2 0 012 2v3H3V5a2 2 0 012-2z M3 8h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8z M8 8v2 M16 8v2",
  lotes:         "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  liberacion:    "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  noConformidad: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  proveedores:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  items:         "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M9 12h6 M9 16h4",
  checklists:    "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  ordenesCompra: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 000 4h6a2 2 0 000-4M9 12h6M9 16h4",
};

// ─── MENÚ ─────────────────────────────────────────────────────────────────────

interface NavItem  { label: string; icon: keyof typeof ICONS; path: string; roles?: string[]; }
interface NavGroup { group: string; items: NavItem[]; }

const NAV_MENU: NavGroup[] = [
  {
    group: "Principal",
    items: [
      { label: "Dashboard",   icon: "dashboard",   path: ROUTES.DASHBOARD   },
      { label: "Recepciones", icon: "recepciones", path: ROUTES.RECEPCIONES },
      { label: "Lotes",       icon: "lotes",       path: ROUTES.LOTES       },
    ],
  },
  {
    group: "Calidad",
    items: [
      { label: "Liberación de lotes", icon: "liberacion",    path: ROUTES.LIBERACION,
        roles: [AppRoles.Calidad, AppRoles.Administrador] },
      { label: "No conformidades",    icon: "noConformidad", path: ROUTES.NO_CONFORMIDADES,
        roles: [AppRoles.Calidad, AppRoles.Administrador, AppRoles.Auditor] },
    ],
  },
  {
    group: "Compras",
    items: [
      { label: "Órdenes de Compra", icon: "ordenesCompra", path: ROUTES.ORDENES_COMPRA,
        roles: [AppRoles.Compras, AppRoles.Administrador] },
    ],
  },
  {
    group: "Maestros",
    items: [
      { label: "Proveedores",    icon: "proveedores", path: ROUTES.PROVEEDORES,
        roles: [AppRoles.Administrador, AppRoles.Compras] },
      { label: "Ítems",          icon: "items",       path: ROUTES.ITEMS,
        roles: [AppRoles.Administrador] },
      { label: "Checklists BPM", icon: "checklists",  path: ROUTES.CHECKLISTS,
        roles: [AppRoles.Administrador, AppRoles.Calidad] },
    ],
  },
];

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { hasRole, roles } = useAuth();
  const location = useLocation();

  // Cerrar al navegar en móvil
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) onClose();
  }, [location.pathname]);

  const canSee = (item: NavItem) => !item.roles || hasRole(item.roles as any);

  return (
    <aside
      className="flex flex-col h-full shrink-0 overflow-hidden transition-all duration-300 ease-out"
      style={{
        width:       open ? "var(--sidebar-width)" : "0px",
        background:  "var(--bg-surface)",
        borderRight: open ? "1px solid var(--border-default)" : "none",
        boxShadow:   open ? "var(--shadow-sidebar)" : "none",
      }}
    >
      {/* Wrapper con ancho fijo para que el contenido no se comprima al animar */}
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ width: "var(--sidebar-width)", minWidth: "var(--sidebar-width)" }}
      >

        {/* ── Navegación ─────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-hide">
          {NAV_MENU.map(group => {
            const visibleItems = group.items.filter(canSee);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} className="mb-1">
                <p
                  className="px-4 pb-1 pt-3 text-[9px] font-bold tracking-[0.25em] uppercase"
                  style={{ color: "var(--text-ghost)", fontFamily: "var(--font-mono)" }}
                >
                  {group.group}
                </p>

                {visibleItems.map(item => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== ROUTES.DASHBOARD && location.pathname.startsWith(item.path));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="relative flex items-center gap-2.5 mx-2 my-0.5 px-3 py-2 rounded-lg transition-all duration-150"
                      style={{
                        background: isActive ? "var(--primary-8)" : "transparent",
                        color:      isActive ? "var(--primary)"   : "var(--text-muted)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "var(--bg-row-hover)";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                        }
                      }}
                    >
                      {/* Barra indicadora */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                          style={{ background: "var(--primary)" }}
                        />
                      )}

                      <Icon d={ICONS[item.icon]} size={16} />

                      <span className="text-[13px] leading-none whitespace-nowrap">
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* ── Perfil activo ───────────────────────────────────────────────── */}
        <div
          className="mx-3 mb-4 px-3 py-2.5 rounded-lg"
          style={{
            background: "var(--bg-item)",
            border:     "1px solid var(--border-subtle)",
          }}
        >
          <p className="text-[9px] tracking-widest uppercase mb-1.5"
            style={{ color: "var(--text-ghost)", fontFamily: "var(--font-mono)" }}>
            Perfil activo
          </p>
          <div className="flex flex-wrap gap-1">
            {roles.map(r => (
              <span key={r} className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{
                  background: "var(--primary-8)",
                  color:      "var(--primary)",
                  border:     "1px solid var(--primary-15)",
                }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}