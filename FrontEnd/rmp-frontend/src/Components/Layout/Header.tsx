import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { Breadcrumb } from "./Breadcrumb";
import "./StylesLayout/Layout.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen:     boolean;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

// ─── ÍCONO HAMBURGUESA / X ────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className="header-hamburger-icon"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="18" y1="6"  x2="6"  y2="18" />
          <line x1="6"  y1="6"  x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="7"  x2="21" y2="7"  />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </>
      )}
    </svg>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { displayName, email, roles, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials  = getInitials(displayName || "U");
  const dateLabel = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
  });

  return (
    <header className="app-header">

      {/* ── Izquierda: hamburguesa + logo + breadcrumb ── */}
      <div className="header-left">

        {/* Botón hamburguesa */}
        <button
          className="header-hamburger"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={sidebarOpen}
        >
          <HamburgerIcon open={sidebarOpen} />
        </button>

        {/* Logo compacto */}
        <div className="header-logo" aria-hidden="true">
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="var(--primary)"
            strokeWidth="1.8" strokeLinejoin="round"
          >
            <path d="M2 20V10l6-6v6l6-6v6l6-3v13H2z" />
            <rect x="6"  y="14" width="3" height="6" />
            <rect x="11" y="14" width="3" height="6" />
          </svg>
        </div>

        {/* Divisor */}
        <div className="header-divider" aria-hidden="true" />

        {/* Breadcrumb */}
        <Breadcrumb compact />
      </div>

      {/* ── Derecha: fecha + online + usuario ── */}
      <div className="header-right">

        {/* Fecha — solo lg */}
        <span className="header-date">{dateLabel}</span>

        <div className="header-divider header-divider-lg" aria-hidden="true" />

        {/* Indicador online */}
        <div className="header-online">
          <div className="header-online-dot" aria-hidden="true" />
          <span className="header-online-label">EN LÍNEA</span>
        </div>

        <div className="header-divider" aria-hidden="true" />

        {/* ── Menú de usuario ── */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            className="header-user-btn"
            data-open={menuOpen || undefined}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            {/* Avatar */}
            <div className="header-avatar" aria-hidden="true">
              {initials}
            </div>

            {/* Nombre + rol */}
            <div className="header-user-info">
              <p className="header-user-name">{displayName}</p>
              <p className="header-user-role">{roles[0] ?? "Usuario"}</p>
            </div>

            {/* Chevron */}
            <svg
              width="11" height="11" viewBox="0 0 24 24"
              className="header-user-chevron"
              data-open={menuOpen || undefined}
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" />
            </svg>
          </button>

          {/* ── Dropdown ── */}
          {menuOpen && (
            <div className="header-dropdown" role="menu">

              {/* Info del usuario */}
              <div className="header-dropdown-info">
                <p className="header-dropdown-name">{displayName}</p>
                <p className="header-dropdown-email">{email}</p>
                <div className="header-dropdown-roles">
                  {roles.map(r => (
                    <span key={r} className="header-role-badge">{r}</span>
                  ))}
                </div>
              </div>

              {/* Mi perfil */}
              <div className="header-dropdown-section">
                <button
                  className="header-dropdown-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" className="header-dropdown-icon" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                  Mi perfil
                </button>
              </div>

              {/* Cerrar sesión */}
              <div className="header-dropdown-section">
                <button
                  className="header-dropdown-item header-dropdown-item-danger"
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); logout(); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" className="header-dropdown-icon" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}