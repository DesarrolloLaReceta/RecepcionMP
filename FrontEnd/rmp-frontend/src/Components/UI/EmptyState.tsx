import { type ReactNode } from "react";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  title:      string;
  subtitle?:  string;
  /** SVG path del ícono central (default: documento vacío) */
  icon?:      string;
  /** Color del ícono (default: #334155) */
  iconColor?: string;
  /** Slot para botón de acción principal */
  action?:    ReactNode;
  /** Slot secundario (ej: enlace de ayuda) */
  secondary?: ReactNode;
  className?: string;
  /** Tamaño del bloque: "sm" para tablas/listas, "md" para paneles */
  size?:      "sm" | "md" | "lg";
}

// ─── CONFIGURACIÓN DE TAMAÑO ──────────────────────────────────────────────────

const SIZE_CFG = {
  sm: { icon: 28, iconWrap: "w-10 h-10", title: "text-[13px]", sub: "text-[11px]", gap: "gap-2" },
  md: { icon: 36, iconWrap: "w-14 h-14", title: "text-[15px]", sub: "text-[12px]", gap: "gap-3" },
  lg: { icon: 44, iconWrap: "w-18 h-18", title: "text-[17px]", sub: "text-[13px]", gap: "gap-4" },
};

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
 *   action={<Button variant="primary" onClick={...}>Nueva OC</Button>}
 * />
 *
 * // Tab recepciones vacío
 * <EmptyState
 *   title="Sin recepciones para esta OC"
 *   icon="M9 5H7..."
 *   action={<Button variant="secondary" size="sm">Iniciar recepción</Button>}
 *   size="md"
 * />
 */
export function EmptyState({
  title, subtitle, icon = DEFAULT_ICON,
  iconColor = "#334155",
  action, secondary, className = "", size = "md",
}: EmptyStateProps) {
  const s = SIZE_CFG[size];

  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${s.gap} w-full ${className}
      `}
    >
      {/* Ícono */}
      <div
        className={`${s.iconWrap} rounded-2xl flex items-center justify-center shrink-0`}
        style={{ background: `${iconColor}12`, border: `1px solid ${iconColor}20` }}
      >
        <svg
          width={s.icon} height={s.icon}
          viewBox="0 0 24 24" fill="none"
          stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"
          aria-hidden="true"
        >
          {icon.split(" M").map((seg, i) => (
            <path key={i} d={i === 0 ? seg : "M" + seg} />
          ))}
        </svg>
      </div>

      {/* Texto */}
      <div className="flex flex-col gap-1 max-w-[280px]">
        <p className={`${s.title} font-semibold text-[#475569]`}>{title}</p>
        {subtitle && (
          <p className={`${s.sub} text-[#334155] leading-relaxed`}>{subtitle}</p>
        )}
      </div>

      {/* Acción */}
      {action && <div className="mt-1">{action}</div>}

      {/* Secundario */}
      {secondary && (
        <div className="text-[10px] text-[#2D3748] font-mono">{secondary}</div>
      )}
    </div>
  );
}

export default EmptyState;