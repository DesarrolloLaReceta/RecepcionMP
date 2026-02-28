import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { Breadcrumb } from "./Breadcrumb";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

// ─── ÍCONO HAMBURGUESA / X ────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ transition: "transform var(--transition-base)" }}
    >
      {open ? (
        // X
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        // Hamburguesa
        <>
          <line x1="3" y1="7" x2="21" y2="7" />
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
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        position:     "fixed",
        top:          0,
        left:         0,
        right:        0,
        zIndex:       50,
        height:       "var(--header-height)",
        background:   "var(--bg-surface)",
        borderBottom: "1px solid var(--border-default)",
        boxShadow:    "var(--shadow-sm)",
      }}
    >
      {/* ── Izquierda: hamburguesa + logo + breadcrumb ─────────────────── */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Botón hamburguesa */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-150"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-item)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          }}
          aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <HamburgerIcon open={sidebarOpen} />
        </button>

        {/* Logo compacto */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "var(--primary-10)",
            border:     "1px solid var(--primary-20)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M2 20V10l6-6v6l6-6v6l6-3v13H2z" />
            <rect x="6" y="14" width="3" height="6" />
            <rect x="11" y="14" width="3" height="6" />
          </svg>
        </div>

        {/* Divisor */}
        <div className="w-px h-4 shrink-0" style={{ background: "var(--border-default)" }} />

        {/* Breadcrumb */}
        <Breadcrumb compact />
      </div>

      {/* ── Derecha: estado + usuario ──────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Fecha */}
        <span
          className="text-[11px] hidden lg:block capitalize"
          style={{ color: "var(--text-ghost)", fontFamily: "var(--font-mono)" }}
        >
          {dateLabel}
        </span>

        <div className="w-px h-4 hidden lg:block" style={{ background: "var(--border-default)" }} />

        {/* Indicador online */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--success)",
              animation: "pulse 2.5s ease-in-out infinite",
            }}
          />
          <span
            className="text-[10px] hidden sm:block"
            style={{ color: "var(--text-ghost)", fontFamily: "var(--font-mono)" }}
          >
            EN LÍNEA
          </span>
        </div>

        <div className="w-px h-4" style={{ background: "var(--border-default)" }} />

        {/* ── Menú de usuario ── */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-150"
            style={{
              background: menuOpen ? "var(--bg-item)" : "transparent",
              border:     "1px solid " + (menuOpen ? "var(--border-default)" : "transparent"),
            }}
            onMouseEnter={e => {
              if (!menuOpen) (e.currentTarget as HTMLElement).style.background = "var(--bg-item)";
            }}
            onMouseLeave={e => {
              if (!menuOpen) (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: "var(--primary-10)",
                border:     "1px solid var(--primary-20)",
                color:      "var(--primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {initials}
            </div>

            {/* Nombre */}
            <div className="text-left hidden sm:block">
              <p
                className="text-[12px] font-semibold leading-none mb-0.5 whitespace-nowrap max-w-[110px] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {displayName}
              </p>
              <p className="text-[10px] leading-none" style={{ color: "var(--text-muted)" }}>
                {roles[0] ?? "Usuario"}
              </p>
            </div>

            {/* Chevron */}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-ghost)" strokeWidth="2.5"
              className="transition-transform duration-200"
              style={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" />
            </svg>
          </button>

          {/* ── Dropdown ── */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
              style={{
                background: "var(--bg-modal)",
                border:     "1px solid var(--border-default)",
                boxShadow:  "var(--shadow-dropdown)",
              }}
            >
              {/* Info */}
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {displayName}
                </p>
                <p className="text-xs truncate mt-0.5"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {email}
                </p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {roles.map(r => (
                    <span key={r} className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{
                        background: "var(--primary-8)",
                        color:      "var(--primary)",
                        border:     "1px solid var(--primary-15)",
                        fontFamily: "var(--font-mono)",
                      }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mi perfil */}
              <div className="py-1">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-item)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                  Mi perfil
                </button>
              </div>

              {/* Cerrar sesión */}
              <div className="py-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--danger-bg)";
                    (e.currentTarget as HTMLElement).style.color = "var(--danger-text)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                      strokeLinecap="round" />
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