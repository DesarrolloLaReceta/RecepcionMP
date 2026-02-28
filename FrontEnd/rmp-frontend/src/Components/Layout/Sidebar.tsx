import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";
import { AppRoles } from "../../Auth/msalConfig";
import { ROUTES } from "../../Constants/routes";
import "./StylesLayout/Layout.css";

// ─── ÍCONO SVG LOCAL ──────────────────────────────────────────────────────────

function Icon({ d, size = 16, className = "" }: { d: string; size?: number; className?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={`sidebar-nav-icon ${className}`}  // Usar className aquí
      aria-hidden="true"
    >
      {d.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

// ─── ÍCONOS POR SECCIÓN ───────────────────────────────────────────────────────

const ICONS: Record<string, string> = {
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

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon:  string;
  path:  string;
  roles?: string[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

// ─── MENÚ DE NAVEGACIÓN ───────────────────────────────────────────────────────

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
      {
        label: "Liberación de lotes",
        icon:  "liberacion",
        path:  ROUTES.LIBERACION,
        roles: [AppRoles.Calidad, AppRoles.Administrador],
      },
      {
        label: "No conformidades",
        icon:  "noConformidad",
        path:  ROUTES.NO_CONFORMIDADES,
        roles: [AppRoles.Calidad, AppRoles.Administrador, AppRoles.Auditor],
      },
    ],
  },
  {
    group: "Compras",
    items: [
      {
        label: "Órdenes de Compra",
        icon:  "ordenesCompra",
        path:  ROUTES.ORDENES_COMPRA,
        roles: [AppRoles.Compras, AppRoles.Administrador],
      },
    ],
  },
  {
    group: "Maestros",
    items: [
      {
        label: "Proveedores",
        icon:  "proveedores",
        path:  ROUTES.PROVEEDORES,
        roles: [AppRoles.Administrador, AppRoles.Compras],
      },
      {
        label: "Ítems",
        icon:  "items",
        path:  ROUTES.ITEMS,
        roles: [AppRoles.Administrador],
      },
      {
        label: "Checklists BPM",
        icon:  "checklists",
        path:  ROUTES.CHECKLISTS,
        roles: [AppRoles.Administrador, AppRoles.Calidad],
      },
    ],
  },
];

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  open:    boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { hasRole, roles } = useAuth();
  const location           = useLocation();

  // Cierra en móvil al navegar
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) onClose();
  }, [location.pathname]);

  const canSee = (item: NavItem) =>
    !item.roles || hasRole(item.roles as any);

  return (
    <aside
      className="app-sidebar"
      data-open={open}
      aria-hidden={!open}
    >
      {/* Wrapper con ancho fijo — evita que el contenido se comprima al animar */}
      <div className="sidebar-inner">

        {/* ── Navegación ── */}
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {NAV_MENU.map(group => {
            const visibleItems = group.items.filter(canSee);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} className="sidebar-group">

                <p className="sidebar-group-label">{group.group}</p>

                {visibleItems.map(item => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== ROUTES.DASHBOARD &&
                      location.pathname.startsWith(item.path));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="sidebar-nav-item"
                      data-active={isActive || undefined}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* Barra indicadora — solo visible cuando está activo */}
                      {isActive && (
                        <span
                          className="sidebar-nav-indicator"
                          aria-hidden="true"
                        />
                      )}

                      <Icon
                        d={ICONS[item.icon]}
                        size={16}
                        className="sidebar-nav-icon"
                      />

                      <span className="sidebar-nav-label">
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}

              </div>
            );
          })}
        </nav>

        {/* ── Perfil activo ── */}
        <div className="sidebar-profile">
          <p className="sidebar-profile-label">Perfil activo</p>
          <div className="sidebar-profile-roles">
            {roles.map(r => (
              <span key={r} className="sidebar-role-badge">{r}</span>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}