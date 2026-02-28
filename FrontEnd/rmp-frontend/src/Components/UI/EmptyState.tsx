import { type ReactNode } from "react";
import "./StylesUI/EmptyState.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  title:      string;
  subtitle?:  string;
  /** SVG path del ícono central (default: documento vacío) */
  icon?:      string;
  /** Color hex/rgba del ícono — se aplica inline por ser dinámico */
  iconColor?: string;
  /** Slot para botón de acción principal */
  action?:    ReactNode;
  /** Slot secundario (ej: enlace de ayuda) */
  secondary?: ReactNode;
  className?: string;
  /** Tamaño del bloque: "sm" para tablas/listas, "md" para paneles */
  size?:      "sm" | "md" | "lg";
}

// ─── ÍCONO DEFAULT ────────────────────────────────────────────────────────────

const DEFAULT_ICON =
  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" +
  "M9 5a2 2 0 002 2h2a2 2 0 002-2" +
  "M9 5a2 2 0 012-2h2a2 2 0 012 2" +
  "M9 12h6M9 16h4";

// ─── EMPTYSTATE ───────────────────────────────────────────────────────────────

/**
 * Estado vacío estilizado para tablas, listas y paneles.
 *
 * @example
 * // En tabla sin resultados
 * <EmptyState
 *   title="Sin recepciones"
 *   subtitle="No se encontraron recepciones con los filtros actuales."
 *   size="sm"
 * />
 *
 * // Con acción
 * <EmptyState
 *   title="Sin órdenes de compra"
 *   subtitle="Crea la primera OC para comenzar el ciclo de recepción."
 *   icon="M12 5v14M5 12h14"
 *   action={<Button variant="primary" onClick={onCreate}>Nueva OC</Button>}
 * />
 *
 * // Con slot secundario
 * <EmptyState
 *   title="Sin recepciones para esta OC"
 *   action={<Button variant="secondary" size="sm">Iniciar recepción</Button>}
 *   secondary={<a href="#">Ver documentación</a>}
 *   size="md"
 * />
 */
export function EmptyState({
  title,
  subtitle,
  icon      = DEFAULT_ICON,
  iconColor = "#334155",
  action,
  secondary,
  className = "",
  size      = "md",
}: EmptyStateProps) {
  const cls = [
    "empty-state",
    `empty-state-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>

      {/* ── Ícono ── */}
      <div
        className="empty-state-icon-wrap"
        style={{
          background:  `${iconColor}12`,
          borderColor: `${iconColor}20`,
        }}
      >
        <svg
          className="empty-state-icon"
          viewBox="0 0 24 24"
          stroke={iconColor}
          aria-hidden="true"
        >
          {icon.split(" M").map((seg, i) => (
            <path key={i} d={i === 0 ? seg : "M" + seg} />
          ))}
        </svg>
      </div>

      {/* ── Texto ── */}
      <div className="empty-state-text">
        <p className="empty-state-title">{title}</p>
        {subtitle && (
          <p className="empty-state-subtitle">{subtitle}</p>
        )}
      </div>

      {/* ── Acción principal ── */}
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}

      {/* ── Slot secundario ── */}
      {secondary && (
        <div className="empty-state-secondary">
          {secondary}
        </div>
      )}

    </div>
  );
}

export default EmptyState;