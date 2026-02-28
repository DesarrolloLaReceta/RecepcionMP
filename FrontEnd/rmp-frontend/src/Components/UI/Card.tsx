import { type ReactNode, useState } from "react";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type CardVariant = "default" | "inset" | "highlight" | "danger" | "warning" | "success" | "info";

export interface CardProps {
  children:     ReactNode;
  variant?:     CardVariant;
  /** Padding interno (default "md") */
  padding?:     "none" | "sm" | "md" | "lg";
  className?:   string;
  /** Si se pasa, el card tiene sombra de hover y cursor pointer */
  onClick?:     () => void;
  /** Anima la entrada con fadeSlideUp */
  animate?:     boolean;
  /** Delay de animación en ms (para listas escalonadas) */
  animDelay?:   number;
}

export interface CardHeaderProps {
  title:         string;
  subtitle?:     string;
  /** SVG path del ícono de sección */
  icon?:         string;
  iconColor?:    string;
  /** Slot derecho: acciones, badges, etc. */
  actions?:      ReactNode;
  /** Si es true, el header tiene un toggle para colapsar el Card */
  collapsible?:  boolean;
  defaultOpen?:  boolean;
  className?:    string;
}

// ─── PALETA DE VARIANTES ──────────────────────────────────────────────────────

const VARIANT_STYLE: Record<CardVariant, { bg: string; border: string }> = {
  default: {
    bg:     "rgba(15,23,42,0.85)",
    border: "rgba(255,255,255,0.07)",
  },
  inset: {
    bg:     "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.05)",
  },
  highlight: {
    bg:     "rgba(245,158,11,0.04)",
    border: "rgba(245,158,11,0.12)",
  },
  danger: {
    bg:     "rgba(239,68,68,0.05)",
    border: "rgba(239,68,68,0.15)",
  },
  warning: {
    bg:     "rgba(245,158,11,0.05)",
    border: "rgba(245,158,11,0.18)",
  },
  success: {
    bg:     "rgba(34,197,94,0.05)",
    border: "rgba(34,197,94,0.15)",
  },
  info: {
    bg:     "rgba(59,130,246,0.05)",
    border: "rgba(59,130,246,0.15)",
  },
};

const PAD: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm:   "p-3",
  md:   "p-5",
  lg:   "p-7",
};

// ─── CARD ─────────────────────────────────────────────────────────────────────

/**
 * @example
 * <Card>
 *   <CardHeader title="Documentos" icon="M9 5H7a2 2..." actions={<Button size="sm">Subir</Button>} />
 *   <p>Contenido aquí</p>
 * </Card>
 *
 * <Card variant="danger" animate animDelay={100}>...</Card>
 * <Card onClick={() => navigate("/detalle")} variant="inset">Clickable</Card>
 */
export function Card({
  children, variant = "default", padding = "md",
  className = "", onClick, animate, animDelay,
}: CardProps) {
  const v = VARIANT_STYLE[variant];

  return (
    <div
      className={`
        rounded-2xl overflow-hidden
        ${PAD[padding]}
        ${onClick ? "cursor-pointer transition-all duration-200" : ""}
        ${className}
      `}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        animation: animate ? `fadeSlideUp 0.3s ease ${animDelay ?? 0}ms both` : undefined,
      }}
      onClick={onClick}
      onMouseEnter={onClick ? e => {
        (e.currentTarget as HTMLElement).style.borderColor = v.border.replace("0.07", "0.15").replace("0.05", "0.12");
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      } : undefined}
      onMouseLeave={onClick ? e => {
        (e.currentTarget as HTMLElement).style.borderColor = v.border;
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      } : undefined}
    >
      {children}
    </div>
  );
}

// ─── CARD HEADER ──────────────────────────────────────────────────────────────

/**
 * Encabezado estandarizado para Card con ícono, título, subtítulo y slot de acciones.
 * Si `collapsible` es true devuelve el toggle y necesita que el padre controle la visibilidad.
 *
 * @example
 * function MyCard() {
 *   return (
 *     <Card>
 *       <CardHeader
 *         title="Criterios de aceptación"
 *         icon="M9 12l2 2 4-4"
 *         iconColor="#86EFAC"
 *         actions={<Badge color="green">5 criterios</Badge>}
 *         collapsible
 *       />
 *       <p className="px-5 pb-5 text-sm text-slate-400">Contenido…</p>
 *     </Card>
 *   );
 * }
 */
export function CardHeader({
  title, subtitle, icon, iconColor = "#F59E0B", actions,
  collapsible, defaultOpen = true, className = "",
}: CardHeaderProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <div
        className={`
          flex items-center justify-between px-5 py-4
          ${collapsible ? "cursor-pointer select-none" : ""}
          ${className}
        `}
        style={{ borderBottom: open || !collapsible ? "1px solid rgba(255,255,255,0.06)" : "none" }}
        onClick={collapsible ? () => setOpen(p => !p) : undefined}
      >
        {/* Left: icon + titles */}
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}25` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                {icon.split(" M").map((seg, i) => (
                  <path key={i} d={i === 0 ? seg : "M" + seg} />
                ))}
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{title}</p>
            {subtitle && (
              <p className="text-[10px] text-[#475569] font-mono mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: actions + collapse toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
          {collapsible && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="#475569" strokeWidth="2.5" strokeLinecap="round"
              className="transition-transform duration-200"
              style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
              aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
        </div>
      </div>

      {/* Slot de contenido cuando es collapsible */}
      {collapsible && !open && null}
    </>
  );
}

// ─── CARD SECTION ─────────────────────────────────────────────────────────────

/** Sección interna de Card con padding estándar y separador superior opcional. */
export function CardSection({
  children, separator = false, padding = "md", className = "",
}: { children: ReactNode; separator?: boolean; padding?: "sm" | "md" | "lg"; className?: string }) {
  const p = { sm: "px-4 py-3", md: "px-5 py-4", lg: "px-6 py-5" }[padding];
  return (
    <div
      className={`${p} ${className}`}
      style={separator ? { borderTop: "1px solid rgba(255,255,255,0.05)" } : undefined}
    >
      {children}
    </div>
  );
}

export default Card;