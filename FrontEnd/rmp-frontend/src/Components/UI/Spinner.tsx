import "./StylesUI/Spinner.css";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerVariant = "ring" | "dots" | "bar";

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  /** Color del trazo (default: usa var(--primary)) */
  color?: string;
  /** Texto opcional que se muestra debajo */
  label?: string;
  /** Centra en el contenedor padre */
  centered?: boolean;
  className?: string;
}

/**
 * Spinner reutilizable con tokens del tema
 * 
 * @example
 * <Spinner size="lg" centered label="Cargando..." />
 * <Spinner size="sm" variant="dots" />
 */
export function Spinner({
  size = "md",
  variant = "ring",
  color = "var(--primary)",
  label,
  centered = false,
  className = "",
}: SpinnerProps) {

  const getRingClass = () => `spinner-ring spinner-ring-${size}`;
  const getDotsContainerClass = () => `spinner-dots spinner-dots-${size}`;
  const getDotClass = () => `spinner-dot spinner-dot-${size}`;
  const getBarContainerClass = () => `spinner-bar-container spinner-bar-${size}`;
  const getTextClass = () => `spinner-text spinner-text-${size}`;

  const inner = (
    <>
      {variant === "ring" && (
        <div
          className={getRingClass()}
          style={{ 
            borderColor: `color-mix(in srgb, ${color} 20%, transparent)`, 
            borderTopColor: color 
          }}
        />
      )}

      {variant === "dots" && (
        <div className={getDotsContainerClass()}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={getDotClass()}
              style={{ 
                background: color,
                animationDelay: `${i * 150}ms`
              }}
            />
          ))}
        </div>
      )}

      {variant === "bar" && (
        <div className={getBarContainerClass()}>
          <div
            className="spinner-bar-fill"
            style={{ background: color }}
          />
        </div>
      )}

      {label && (
        <p className={getTextClass()}>
          {label}
        </p>
      )}
    </>
  );

  if (centered) {
    return (
      <div className={`spinner-centered ${className}`}>
        {inner}
      </div>
    );
  }

  return (
    <span className={`spinner-wrapper ${className}`}>
      {inner}
    </span>
  );
}