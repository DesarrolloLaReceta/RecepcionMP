import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";
import { Spinner } from "./Spinner";
import "./StylesUI/Button.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize    = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  /** Muestra spinner y deshabilita el botón */
  loading?:   boolean;
  /** SVG path para ícono a la izquierda */
  iconLeft?:  string;
  /** SVG path para ícono a la derecha */
  iconRight?: string;
  /** Solo ícono cuadrado, sin texto — usar con aria-label */
  iconOnly?:  boolean;
  /** Ocupa todo el ancho del padre */
  fullWidth?: boolean;
  children?:  ReactNode;
}

// ─── TAMAÑO DE ÍCONO EN PX ────────────────────────────────────────────────────

const ICON_PX: Record<ButtonSize, number> = {
  xs: 10,
  sm: 11,
  md: 13,
  lg: 14,
};

// ─── SVG ICON ─────────────────────────────────────────────────────────────────

function Icon({ path, size }: { path: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="btn-icon"
      aria-hidden="true"
    >
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
    variant  = "secondary",
    size     = "md",
    loading,
    iconLeft,
    iconRight,
    iconOnly,
    fullWidth,
    children,
    disabled,
    className = "",
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;
  const iconPx     = ICON_PX[size];

  const cls = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    iconOnly   && "btn-icon-only",
    fullWidth  && "btn-full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cls}
      {...rest}
    >
      {loading
        ? <Spinner size={size === "xs" || size === "sm" ? "xs" : "sm"}
            color={variant === "primary" ? "#ffffff" : "currentColor"} />
        : iconLeft && <Icon path={iconLeft} size={iconPx} />
      }

      {!iconOnly && children && (
        <span className={loading ? "btn-label-loading" : ""}>
          {children}
        </span>
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
export function ButtonGroup({
  children,
  className = "",
}: {
  children:   ReactNode;
  className?: string;
}) {
  return (
    <div className={`btn-group ${className}`} role="group">
      {children}
    </div>
  );
}

export default Button;