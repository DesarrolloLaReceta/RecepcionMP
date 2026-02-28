import { type ReactNode } from "react";
import "./StylesUI/Badge.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type BadgeColor =
  | "amber"    // acento primario del sistema
  | "green"
  | "red"
  | "blue"
  | "purple"
  | "yellow"
  | "slate"    // neutro / inactivo
  | "custom";  // usa colorToken directamente

export type BadgeSize   = "xs" | "sm" | "md";
export type BadgeRadius = "sm" | "md" | "full";

export interface BadgeProps {
  children: ReactNode;
  color?:      BadgeColor;
  size?:       BadgeSize;
  radius?:     BadgeRadius;
  /** Punto de estado a la izquierda */
  dot?:        boolean;
  /** Ícono SVG path a la izquierda (se renderiza como <svg>) */
  icon?:       string;
  /** Número en burbuja a la derecha (ej: conteo de alertas) */
  count?:      number;
  /** Para color="custom": hex / rgba del texto y borde */
  colorToken?: string;
  className?:  string;
  onClick?:    () => void;
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const ICON_SIZE: Record<BadgeSize, number> = { 
  xs: 9, 
  sm: 10, 
  md: 11 
};

// ─── BADGE ────────────────────────────────────────────────────────────────────

/**
 * Badge reutilizable con tokens del tema
 * 
 * @example
 * <Badge color="green" dot>Activo</Badge>
 * <Badge color="red" size="xs">Vencido</Badge>
 * <Badge color="amber" icon="M12 2v20M12 2l-4 4M12 2l4 4">Cadena frío</Badge>
 * <Badge color="blue" count={3}>Documentos</Badge>
 * <Badge color="custom" colorToken="#C4B5FD">Congelados</Badge>
 */
export function Badge({
  children,
  color = "slate",
  size = "sm",
  radius = "md",
  dot,
  icon,
  count,
  colorToken,
  className = "",
  onClick,
}: BadgeProps) {
  
  const iconSize = ICON_SIZE[size];
  const Tag = onClick ? "button" : "span";

  // Clases base
  const baseClasses = [
    "badge",
    `badge-${size}`,
    `badge-radius-${radius}`,
    onClick && "badge-clickable",
    color !== "custom" && `badge-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Estilos inline solo para color custom
  const customStyles = color === "custom" && colorToken ? {
    background: `${colorToken}15`,
    color: colorToken,
    borderColor: `${colorToken}30`,
  } : undefined;

  // Para custom, necesitamos pasar el color del dot por estilo inline
  const dotColor = color === "custom" ? colorToken : undefined;

  return (
    <Tag
      onClick={onClick}
      className={baseClasses}
      style={customStyles}
    >
      {dot && (
        <span
          className={`badge-dot badge-dot-${size}`}
          style={dotColor ? { background: dotColor } : undefined}
        />
      )}

      {icon && (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="badge-icon"
        >
          {icon.split(" M").map((seg, i) => (
            <path key={i} d={i === 0 ? seg : "M" + seg} />
          ))}
        </svg>
      )}

      {children}

      {count !== undefined && count > 0 && (
        <span className="badge-count">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Tag>
  );
}

export default Badge;