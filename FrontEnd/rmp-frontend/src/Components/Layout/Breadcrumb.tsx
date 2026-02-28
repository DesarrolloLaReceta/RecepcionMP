import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES, ROUTE_LABELS } from "../../Constants/routes";
import "./StylesLayout/Breadcrumb.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface BreadcrumbProps {
  /**
   * Etiquetas extra para segmentos dinámicos que no están en ROUTE_LABELS.
   * Clave: segmento tal como aparece en la URL (ej. "rec-001").
   * Valor: etiqueta legible (ej. "REC-2026-0048").
   *
   * @example
   * <Breadcrumb customLabels={{ [recepcionId]: recepcion.numeroRecepcion }} />
   */
  customLabels?: Record<string, string>;
  /**
   * Modo compacto: muestra solo el segmento actual y el inmediatamente anterior.
   * Útil en Header con espacio horizontal limitado.
   */
  compact?:      boolean;
  /** Clase CSS extra para el <nav> raíz */
  className?:    string;
}

// ─── ÍCONOS POR RUTA ─────────────────────────────────────────────────────────

const ROUTE_ICONS: Record<string, string> = {
  "/":                     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  "/recepciones":          "M5 3h14a2 2 0 012 2v3H3V5a2 2 0 012-2zM3 8h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8zM8 8v2M16 8v2",
  "/lotes":                "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  "/liberacion":           "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  "/no-conformidades":     "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  "/ordenes-compra":       "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4",
  "/maestros":             "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0",
  "/maestros/proveedores": "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  "/maestros/items":       "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4",
  "/maestros/checklists":  "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDynamicSegment(seg: string): string {
  if (seg.length > 12 && !seg.includes("-")) return seg.slice(0, 8) + "…";
  return seg
    .split("-")
    .map((word, i) => {
      if (/^\d+$/.test(word) || /^[A-Z]{2,}$/.test(word)) return word;
      return i === 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word;
    })
    .join("-");
}

interface Crumb {
  label:      string;
  path:       string;
  isLast:     boolean;
  isDynamic:  boolean;
  iconPath?:  string;
}

function useCrumbs(customLabels?: Record<string, string>): Crumb[] {
  const location = useLocation();

  return useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];

    return segments.map((seg, i) => {
      const path        = "/" + segments.slice(0, i + 1).join("/");
      const staticLabel = ROUTE_LABELS[path];
      const customLabel = customLabels?.[seg] ?? customLabels?.[path];
      const label       = staticLabel ?? customLabel ?? formatDynamicSegment(seg);
      const isDynamic   = !staticLabel && !customLabel;
      const rootPath    = "/" + segments[0];
      const iconPath    = ROUTE_ICONS[path] ?? (i === 0 ? ROUTE_ICONS[rootPath] : undefined);

      return { label, path, isLast: i === segments.length - 1, isDynamic, iconPath };
    });
  }, [location.pathname, customLabels]);
}

// ─── ÍCONOS INTERNOS ──────────────────────────────────────────────────────────

function Chevron() {
  return (
    <svg
      width="10" height="10" viewBox="0 0 24 24"
      fill="none" stroke="var(--border-strong)"
      strokeWidth="2.5" strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function SectionIcon({ pathData }: { pathData: string }) {
  return (
    <svg
      width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round"
      aria-hidden="true"
    >
      {pathData.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────

/**
 * Breadcrumb del sistema de recepción de materia prima.
 *
 * @example
 * // En Header — automático
 * <Breadcrumb compact />
 *
 * // En página de detalle con ID legible
 * <Breadcrumb customLabels={{ [recepcionId]: recepcion.numeroRecepcion }} />
 */
export function Breadcrumb({
  customLabels,
  compact   = false,
  className = "",
}: BreadcrumbProps) {
  const allCrumbs = useCrumbs(customLabels);

  const crumbs    = compact && allCrumbs.length > 2
    ? allCrumbs.slice(-2)
    : allCrumbs;
  const truncated = compact && allCrumbs.length > 2;

  // ── Caso raíz: estamos en Dashboard ──────────────────────────────────────
  if (allCrumbs.length === 0) {
    return (
      <nav className={`bc-nav ${className}`} aria-label="Navegación">
        <Link to={ROUTES.DASHBOARD} className="bc-home-link bc-home-link-active">
          <HomeIcon />
          <span className="bc-home-label">Dashboard</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className={`bc-nav ${className}`} aria-label="Navegación">

      {/* ── Ícono Home ── */}
      <Link
        to={ROUTES.DASHBOARD}
        className="bc-home-link"
        aria-label="Dashboard"
      >
        <HomeIcon />
      </Link>

      {/* ── Elipsis cuando se trunca en modo compacto ── */}
      {truncated && (
        <>
          <Chevron />
          <span className="bc-ellipsis" aria-hidden="true">…</span>
        </>
      )}

      {/* ── Crumbs ── */}
      {crumbs.map(({ label, path, isLast, isDynamic, iconPath }) => (
        <span key={path} className="bc-item">
          <Chevron />

          {isLast ? (
            /* Segmento activo — no navegable */
            <span className="bc-active" aria-current="page">
              {iconPath && (
                <span className="bc-section-icon-wrap">
                  <SectionIcon pathData={iconPath} />
                </span>
              )}
              <span
                className="bc-active-label"
                data-dynamic={isDynamic || undefined}
                title={label}
              >
                {label}
              </span>
            </span>
          ) : (
            /* Segmento navegable */
            <Link to={path} className="bc-link">
              {iconPath && (
                <span className="bc-link-icon">
                  <SectionIcon pathData={iconPath} />
                </span>
              )}
              <span className="bc-link-label" title={label}>
                {label}
              </span>
            </Link>
          )}
        </span>
      ))}

    </nav>
  );
}

export default Breadcrumb;