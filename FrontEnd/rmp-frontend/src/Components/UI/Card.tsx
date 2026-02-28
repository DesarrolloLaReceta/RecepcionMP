import { type ReactNode, useState } from "react";
import "./StylesUI/Card.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type CardVariant = "default" | "inset" | "highlight" | "danger" | "warning" | "success" | "info";

export interface CardProps {
  children:    ReactNode;
  variant?:    CardVariant;
  /** Padding interno (default "md") */
  padding?:    "none" | "sm" | "md" | "lg";
  className?:  string;
  /** Si se pasa, el card tiene hover de borde y cursor pointer */
  onClick?:    () => void;
  /** Anima la entrada con fadeSlideUp */
  animate?:    boolean;
  /** Delay de animación en ms — para listas escalonadas */
  animDelay?:  number;
}

export interface CardHeaderProps {
  title:        string;
  subtitle?:    string;
  /** SVG path del ícono de sección */
  icon?:        string;
  /** Color hex/rgba del ícono — se aplica como style inline por ser dinámico */
  iconColor?:   string;
  /** Slot derecho: acciones, badges, etc. */
  actions?:     ReactNode;
  /** Agrega chevron y permite colapsar el contenido del Card */
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?:   string;
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

/**
 * @example
 * <Card>
 *   <CardHeader title="Documentos" icon="M9 5H7a2 2…" actions={<Button size="sm">Subir</Button>} />
 *   <CardSection>Contenido aquí</CardSection>
 * </Card>
 *
 * <Card variant="danger" animate animDelay={100}>…</Card>
 * <Card onClick={() => navigate("/detalle")} variant="inset">Clickable</Card>
 */
export function Card({
  children,
  variant   = "default",
  padding   = "md",
  className = "",
  onClick,
  animate,
  animDelay,
}: CardProps) {
  const cls = [
    "card",
    `card-${variant}`,
    `card-pad-${padding}`,
    onClick && "card-clickable",
    animate  && "card-animate",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      onClick={onClick}
      style={animDelay ? { animationDelay: `${animDelay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

// ─── CARD HEADER ──────────────────────────────────────────────────────────────

/**
 * Encabezado estandarizado con ícono, título, subtítulo y slot de acciones.
 * Con `collapsible` muestra chevron y gestiona el open/close internamente.
 *
 * @example
 * <CardHeader
 *   title="Criterios de aceptación"
 *   icon="M9 12l2 2 4-4"
 *   iconColor="#86EFAC"
 *   actions={<Badge color="green">5 criterios</Badge>}
 *   collapsible
 * />
 */
export function CardHeader({
  title,
  subtitle,
  icon,
  iconColor   = "#F59E0B",
  actions,
  collapsible,
  defaultOpen = true,
  className   = "",
}: CardHeaderProps) {
  const [open, setOpen] = useState(defaultOpen);

  const headerCls = [
    "card-header",
    collapsible && "card-header-collapsible",
    collapsible && !open && "card-header-collapsed",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={headerCls}
        onClick={collapsible ? () => setOpen(prev => !prev) : undefined}
      >
        {/* Izquierda: ícono + títulos */}
        <div className="card-header-left">
          {icon && (
            <div
              className="card-header-icon-wrap"
              style={{
                background:  `${iconColor}15`,
                borderColor: `${iconColor}25`,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={iconColor}
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {icon.split(" M").map((seg, i) => (
                  <path key={i} d={i === 0 ? seg : "M" + seg} />
                ))}
              </svg>
            </div>
          )}

          <div className="card-header-text">
            <p className="card-header-title">{title}</p>
            {subtitle && (
              <p className="card-header-subtitle">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Derecha: acciones + chevron */}
        <div className="card-header-right">
          {actions && (
            <div onClick={e => e.stopPropagation()}>
              {actions}
            </div>
          )}
          {collapsible && (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`card-header-chevron ${open ? "card-header-chevron-open" : "card-header-chevron-closed"}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
        </div>
      </div>

      {/* Ocultar contenido cuando está colapsado */}
      {collapsible && !open && null}
    </>
  );
}

// ─── CARD SECTION ─────────────────────────────────────────────────────────────

/**
 * Sección interna de Card con padding estándar y separador superior opcional.
 *
 * @example
 * <CardSection separator>Contenido separado</CardSection>
 * <CardSection padding="sm">Contenido compacto</CardSection>
 */
export function CardSection({
  children,
  separator = false,
  padding   = "md",
  className = "",
}: {
  children:   ReactNode;
  separator?: boolean;
  padding?:   "sm" | "md" | "lg";
  className?: string;
}) {
  const cls = [
    `card-section-${padding}`,
    separator && "card-section-separator",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      {children}
    </div>
  );
}

export default Card;