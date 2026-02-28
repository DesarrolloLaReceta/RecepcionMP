import "./StylesUI/Skeleton.css";

interface SkeletonProps {
  /** Número de filas skeleton a renderizar */
  rows?: number;
  /** Variante de layout: "list" (filas), "card" (bloque), "table" (grilla) */
  variant?: "list" | "card" | "table";
  className?: string;
}

/**
 * Skeleton loader para listas, cards y tablas
 * 
 * @example
 * <Skeleton rows={5} variant="list" />
 * <Skeleton variant="card" />
 * <Skeleton rows={3} variant="table" />
 */
export function Skeleton({ 
  rows = 4, 
  variant = "list", 
  className = "" 
}: SkeletonProps) {
  
  // Variante Card
  if (variant === "card") {
    return (
      <div className={`skeleton-card skeleton-pulse ${className}`}>
        <div className="skeleton-card-title" />
        <div className="skeleton-card-subtitle" />
        <div className="skeleton-card-line" />
        <div className="skeleton-card-line" />
      </div>
    );
  }

  // Variante Table
  if (variant === "table") {
    return (
      <div className={`skeleton-table ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-table-row">
            <div className="skeleton-table-cell" />
            <div className="skeleton-table-cell" />
            <div className="skeleton-table-cell" />
            <div className="skeleton-table-cell" />
          </div>
        ))}
      </div>
    );
  }

  // Variante List (default)
  return (
    <div className={`skeleton-list ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <div className="skeleton-list-title skeleton-pulse" />
          <div className="skeleton-list-subtitle skeleton-pulse" />
        </div>
      ))}
    </div>
  );
}