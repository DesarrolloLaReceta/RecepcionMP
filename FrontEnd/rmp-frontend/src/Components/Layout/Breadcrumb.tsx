import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES, ROUTE_LABELS } from "../../Constants/routes";

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
  compact?: boolean;

  /** Clase CSS extra para el <nav> raíz */
  className?: string;
}

// ─── ÍCONOS POR RUTA ─────────────────────────────────────────────────────────

// SVG paths que se usan como ícono en el badge de la sección raíz.
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Formatea un segmento de URL desconocido (ID dinámico) para mostrarlo en el crumb.
 * Ej.: "rec-001" → "rec-001" (corto), "a1b2c3d4e5f6g7h8" → "a1b2c3d4…"
 */
function formatDynamicSegment(seg: string): string {
  // Si parece un ID de base de datos largo (guid/uuid), truncar
  if (seg.length > 12 && !seg.includes("-")) {
    return seg.slice(0, 8) + "…";
  }
  // Convertir kebab-case en palabras capitalizadas para IDs legibles
  return seg
    .split("-")
    .map((word, i) => {
      // Si parece número o código (REC, OC, etc.), dejar en mayúsculas
      if (/^\d+$/.test(word) || /^[A-Z]{2,}$/.test(word)) return word;
      return i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .join("-");
}

interface Crumb {
  label: string;
  path: string;
  isLast: boolean;
  isDynamic: boolean;   // segmento de URL no mapeado (ID dinámico)
  iconPath?: string;    // SVG path del ícono de sección
}

function useCrumbs(customLabels?: Record<string, string>): Crumb[] {
  const location = useLocation();

  return useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];

    return segments.map((seg, i) => {
      const path = "/" + segments.slice(0, i + 1).join("/");

      // 1. Etiqueta explícita en ROUTE_LABELS
      const staticLabel = ROUTE_LABELS[path];
      // 2. Etiqueta pasada por prop (para segmentos dinámicos como IDs)
      const customLabel = customLabels?.[seg] ?? customLabels?.[path];
      // 3. Fallback: formatear el segmento crudo
      const label = staticLabel ?? customLabel ?? formatDynamicSegment(seg);
      const isDynamic = !staticLabel && !customLabel;

      // Buscar ícono: primero ruta exacta, luego primera sección de la URL
      const rootPath = "/" + segments[0];
      const iconPath = ROUTE_ICONS[path] ?? (i === 0 ? ROUTE_ICONS[rootPath] : undefined);

      return {
        label,
        path,
        isLast: i === segments.length - 1,
        isDynamic,
        iconPath,
      };
    });
  }, [location.pathname, customLabels]);
}

// ─── CHEVRON SEPARADOR ────────────────────────────────────────────────────────

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round"
      aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ─── ÍCONO HOME ───────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

// ─── ÍCONO DE SECCIÓN ─────────────────────────────────────────────────────────

function SectionIcon({ pathData }: { pathData: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      aria-hidden="true">
      {pathData.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────

/**
 * Breadcrumb del sistema de recepción de materia prima.
 * Se monta en el Header y opcionalmente en páginas de detalle.
 *
 * @example
 * // En Header — automático, sin props
 * <Breadcrumb />
 *
 * // En DetalleRecepcionPage — con etiqueta del número de recepción
 * <Breadcrumb customLabels={{ [recepcionId]: recepcion.numeroRecepcion }} />
 *
 * // Compacto para espacios reducidos
 * <Breadcrumb compact />
 */
export function Breadcrumb({
  customLabels,
  compact = false,
  className = "",
}: BreadcrumbProps) {
  const allCrumbs = useCrumbs(customLabels);

  // En modo compacto mostrar solo los últimos 2 crumbs (con "…" si hay más)
  const crumbs = compact && allCrumbs.length > 2
    ? allCrumbs.slice(-2)
    : allCrumbs;
  const truncated = compact && allCrumbs.length > 2;

  // Caso raíz — estamos en Dashboard
  if (allCrumbs.length === 0) {
    return (
      <nav className={`flex items-center gap-1.5 ${className}`} aria-label="Navegación">
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: "var(--primary)" }}
        >
          <HomeIcon />
          <span className="text-sm font-semibold text-white">Dashboard</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav
      className={`flex items-center gap-1.5 min-w-0 ${className}`}
      aria-label="Navegación"
    >
      {/* ── Ícono Home ── */}
      <Link
        to={ROUTES.DASHBOARD}
        className="flex items-center justify-center shrink-0 transition-colors"
        style={{ color: "var(--text-muted)" }}
        aria-label="Dashboard"
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-ghost)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
      >
        <HomeIcon />
      </Link>

      {/* ── Elipsis cuando se trunca en compacto ── */}
      {truncated && (
        <>
          <Chevron />
          <span
            className="text-[11px] font-mono select-none"
            style={{ color: "var(--text-faintest)" }}
            aria-hidden="true"
          >
            …
          </span>
        </>
      )}

      {/* ── Crumbs ── */}
      {crumbs.map(({ label, path, isLast, isDynamic, iconPath }) => (
        <span key={path} className="flex items-center gap-1.5 min-w-0">
          <Chevron />

          {isLast ? (
            /* Segmento activo */
            <span
              className="flex items-center gap-1.5 min-w-0"
              aria-current="page"
            >
              {/* Ícono de sección (solo en el primer nivel si está disponible) */}
              {iconPath && (
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ color: "var(--primary)" }}
                >
                  <SectionIcon pathData={iconPath} />
                </span>
              )}
              <span
                className="text-sm font-semibold truncate max-w-[180px]"
                style={{
                  color: isDynamic ? "var(--text-ghost)" : "var(--text-primary)",
                  fontFamily: isDynamic ? "'DM Mono', monospace" : undefined,
                  fontSize: isDynamic ? "11px" : undefined,
                }}
                title={label}
              >
                {label}
              </span>
            </span>
          ) : (
            /* Segmento navegable */
            <Link
              to={path}
              className="flex items-center gap-1.5 transition-colors min-w-0 group"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-ghost)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              {iconPath && (
                <span className="shrink-0 group-hover:text-[#64748B] transition-colors">
                  <SectionIcon pathData={iconPath} />
                </span>
              )}
              <span
                className="text-sm truncate max-w-[140px]"
                title={label}
              >
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