import "./StylesUI/Icon.css";

interface IconProps {
  path: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

/**
 * Componente Icon reutilizable para SVG paths
 * 
 * @example
 * <Icon path="M12 2v20M12 2l-4 4M12 2l4 4" size={16} color="var(--primary)" />
 */
export function Icon({ 
  path, 
  size = 14, 
  color = "currentColor",
  strokeWidth = 1.8,
  className = "" 
}: IconProps) {
  
  // Divide el path en segmentos (maneja paths que empiezan con " M")
  const pathSegments = path.split(" M").map((seg, i) => 
    i === 0 ? seg : "M" + seg
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={`icon ${className}`}
    >
      {pathSegments.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export default Icon;