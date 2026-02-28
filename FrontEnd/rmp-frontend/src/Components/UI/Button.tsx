import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";
import { Spinner } from "./Spinner";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize    = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  /** Muestra spinner y deshabilita el botón */
  loading?:  boolean;
  /** SVG path para ícono a la izquierda */
  iconLeft?: string;
  /** SVG path para ícono a la derecha */
  iconRight?: string;
  /** Solo ícono (cuadrado), sin texto — usar con aria-label */
  iconOnly?: boolean;
  /** Ocupa todo el ancho del padre */
  fullWidth?: boolean;
  children?: ReactNode;
}

// ─── PALETA ───────────────────────────────────────────────────────────────────

const VARIANT_STYLE: Record<ButtonVariant, {
  base: React.CSSProperties;
  hover: React.CSSProperties;
  disabled: React.CSSProperties;
}> = {
  primary: {
    base:     { background: "#F59E0B", color: "#000", border: "1px solid #F59E0B" },
    hover:    { background: "#D97706" },
    disabled: { background: "rgba(245,158,11,0.3)", color: "rgba(0,0,0,0.4)", borderColor: "transparent" },
  },
  secondary: {
    base:     { background: "rgba(245,158,11,0.08)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" },
    hover:    { background: "rgba(245,158,11,0.15)" },
    disabled: { background: "rgba(245,158,11,0.03)", color: "rgba(245,158,11,0.3)", borderColor: "rgba(245,158,11,0.08)" },
  },
  ghost: {
    base:     { background: "transparent", color: "#64748B", border: "1px solid transparent" },
    hover:    { background: "rgba(255,255,255,0.04)", color: "#94A3B8" },
    disabled: { color: "rgba(100,116,139,0.4)" },
  },
  danger: {
    base:     { background: "rgba(239,68,68,0.08)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.2)" },
    hover:    { background: "rgba(239,68,68,0.15)" },
    disabled: { background: "rgba(239,68,68,0.03)", color: "rgba(252,165,165,0.3)", borderColor: "rgba(239,68,68,0.08)" },
  },
  success: {
    base:     { background: "rgba(34,197,94,0.08)", color: "#86EFAC", border: "1px solid rgba(34,197,94,0.2)" },
    hover:    { background: "rgba(34,197,94,0.15)" },
    disabled: { background: "rgba(34,197,94,0.03)", color: "rgba(134,239,172,0.3)", borderColor: "rgba(34,197,94,0.08)" },
  },
};

const SIZE_CLS: Record<ButtonSize, string> = {
  xs: "h-6  px-2    text-[10px] gap-1   rounded-lg",
  sm: "h-7  px-3    text-[11px] gap-1.5 rounded-lg",
  md: "h-9  px-4    text-[13px] gap-2   rounded-xl",
  lg: "h-11 px-5    text-[14px] gap-2   rounded-xl",
};

const SIZE_ICON_ONLY: Record<ButtonSize, string> = {
  xs: "h-6  w-6  rounded-lg",
  sm: "h-7  w-7  rounded-lg",
  md: "h-9  w-9  rounded-xl",
  lg: "h-11 w-11 rounded-xl",
};

const ICON_PX: Record<ButtonSize, number> = { xs: 10, sm: 11, md: 13, lg: 14 };

// ─── SVG ICON ─────────────────────────────────────────────────────────────────

function Icon({ path, size }: { path: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      className="shrink-0" aria-hidden="true">
      {path.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────

/**
 * @example
 * <Button variant="primary" onClick={guardar}>Guardar</Button>
 * <Button variant="secondary" iconLeft="M12 5v14M5 12h14">Agregar</Button>
 * <Button variant="danger" loading={deleting}>Eliminar</Button>
 * <Button variant="ghost" iconOnly iconLeft="M6 18L18 6M6 6l12 12" aria-label="Cerrar" />
 * <Button size="sm" fullWidth>Confirmar</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary", size = "md",
    loading, iconLeft, iconRight, iconOnly, fullWidth,
    children, disabled, style,
    onMouseEnter, onMouseLeave,
    ...rest
  },
  ref
) {
  const v      = VARIANT_STYLE[variant];
  const isDisabled = disabled || loading;
  const iconPx = ICON_PX[size];
  const baseCls = iconOnly ? SIZE_ICON_ONLY[size] : SIZE_CLS[size];

  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) Object.assign((e.currentTarget as HTMLElement).style, v.hover);
    onMouseEnter?.(e);
  };
  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) Object.assign((e.currentTarget as HTMLElement).style, v.base);
    onMouseLeave?.(e);
  };

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-150 shrink-0 select-none
        disabled:cursor-not-allowed
        ${baseCls}
        ${fullWidth ? "w-full" : ""}
      `}
      style={{
        ...(isDisabled ? v.disabled : v.base),
        ...style,
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {loading
        ? <Spinner size={size === "xs" || size === "sm" ? "xs" : "sm"}
            color={variant === "primary" ? "#000" : "currentColor"} />
        : iconLeft && <Icon path={iconLeft} size={iconPx} />
      }
      {!iconOnly && children && (
        <span className={loading ? "opacity-60" : ""}>{children}</span>
      )}
      {!loading && iconRight && <Icon path={iconRight} size={iconPx} />}
    </button>
  );
});

// ─── BUTTON GROUP ─────────────────────────────────────────────────────────────

/**
 * Grupo de botones pegados horizontalmente con bordes compartidos.
 *
 * @example
 * <ButtonGroup>
 *   <Button variant="ghost" size="sm">Lista</Button>
 *   <Button variant="ghost" size="sm">Tabla</Button>
 * </ButtonGroup>
 */
export function ButtonGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`inline-flex ${className}`}
      style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", overflow: "hidden" }}
      role="group"
    >
      {children}
    </div>
  );
}

export default Button;