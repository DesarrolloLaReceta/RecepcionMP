import { Badge, type BadgeSize, type BadgeColor } from "./Badge";

// ─── CONSTANTES LOCALES (basadas en el backend real) ─────────────────────────

// Recepción: 0=Iniciada, 1=InspeccionVehiculo, 2=RegistroLotes, 3=PendienteCalidad, 4=Finalizada, 5=Rechazada
const ESTADO_RECEPCION = {
  Iniciada: 0,
  InspeccionVehiculo: 1,
  RegistroLotes: 2,
  PendienteCalidad: 3,
  Finalizada: 4,
  Rechazada: 5,
} as const;

// OC: 0=Abierta, 1=ParcialmenteRecibida, 2=TotalmenteRecibida, 3=Cancelada
const ESTADO_OC = {
  Abierta: 0,
  ParcialmenteRecibida: 1,
  TotalmenteRecibida: 2,
  Cancelada: 3,
} as const;

// NC: 0=Abierta, 1=EnAnalisis, 2=EnProceso, 3=Cerrada, 4=Anulada
const ESTADO_NC = {
  Abierta: 0,
  EnAnalisis: 1,
  EnProceso: 2,
  Cerrada: 3,
  Anulada: 4,
} as const;

// Prioridad NC: 0=Baja, 1=Media, 2=Alta, 3=Critica
const PRIORIDAD_NC = {
  Baja: 0,
  Media: 1,
  Alta: 2,
  Critica: 3,
} as const;

// Proveedor: 0=Activo, 1=Inactivo, 2=Suspendido
const ESTADO_PROVEEDOR = {
  Activo: 0,
  Inactivo: 1,
  Suspendido: 2,
} as const;

// Item: 0=Activo, 1=Inactivo (en realidad es booleano, pero lo tratamos como número para consistencia)
const ESTADO_ITEM = {
  Activo: 0,
  Inactivo: 1,
} as const;

// ─── CONFIGURACIONES VISUALES ─────────────────────────────────────────────────

const RECEPCION_CFG: Record<number, StatusConfig> = {
  [ESTADO_RECEPCION.Iniciada]:           { color: "amber",  label: "Iniciada",            dot: true },
  [ESTADO_RECEPCION.InspeccionVehiculo]: { color: "amber",  label: "Insp. vehículo",      dot: true },
  [ESTADO_RECEPCION.RegistroLotes]:      { color: "amber",  label: "Registro lotes",      dot: true },
  [ESTADO_RECEPCION.PendienteCalidad]:   { color: "yellow", label: "Pendiente calidad",   dot: true },
  [ESTADO_RECEPCION.Finalizada]:         { color: "green",  label: "Finalizada",          dot: true },
  [ESTADO_RECEPCION.Rechazada]:          { color: "red",    label: "Rechazada",           dot: true },
};

const OC_CFG: Record<number, StatusConfig> = {
  [ESTADO_OC.Abierta]:              { color: "green",  label: "Abierta",               dot: true },
  [ESTADO_OC.ParcialmenteRecibida]: { color: "amber",  label: "Parcialmente recibida", dot: true },
  [ESTADO_OC.TotalmenteRecibida]:   { color: "blue",   label: "Totalmente recibida",   dot: true },
  [ESTADO_OC.Cancelada]:            { color: "slate",  label: "Cancelada" },
};

const NC_CFG: Record<number, StatusConfig> = {
  [ESTADO_NC.Abierta]:     { color: "red",    label: "Abierta",       dot: true },
  [ESTADO_NC.EnAnalisis]:  { color: "purple", label: "En análisis",   dot: true },
  [ESTADO_NC.EnProceso]:   { color: "amber",  label: "En proceso",    dot: true },
  [ESTADO_NC.Cerrada]:     { color: "green",  label: "Cerrada",       dot: true },
  [ESTADO_NC.Anulada]:     { color: "slate",  label: "Anulada" },
};

const PRIORIDAD_NC_CFG: Record<number, StatusConfig> = {
  [PRIORIDAD_NC.Baja]:    { color: "green",  label: "Baja"    },
  [PRIORIDAD_NC.Media]:   { color: "yellow", label: "Media"   },
  [PRIORIDAD_NC.Alta]:    { color: "red",    label: "Alta"    },
  [PRIORIDAD_NC.Critica]: { color: "red",    label: "Crítica" },
};

const LOTE_CFG: Record<string, StatusConfig> = {
  PendienteCalidad:   { color: "yellow", label: "Pdte. calidad", dot: true },
  Liberado:           { color: "green",  label: "Liberado",      dot: true },
  RechazadoTotal:     { color: "red",    label: "Rechazado total", dot: true },
  RechazadoParcial:   { color: "red",    label: "Rechazado parcial", dot: true },
  EnCuarentena:       { color: "purple", label: "Cuarentena",    dot: true },
};

const PROVEEDOR_CFG: Record<number, StatusConfig> = {
  [ESTADO_PROVEEDOR.Activo]:     { color: "green",  label: "Activo",     dot: true },
  [ESTADO_PROVEEDOR.Inactivo]:   { color: "slate",  label: "Inactivo" },
  [ESTADO_PROVEEDOR.Suspendido]: { color: "red",    label: "Suspendido", dot: true },
};

const ITEM_CFG: Record<number, StatusConfig> = {
  [ESTADO_ITEM.Activo]:   { color: "green",  label: "Activo",   dot: true },
  [ESTADO_ITEM.Inactivo]: { color: "slate",  label: "Inactivo", dot: false },
};

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type StatusDomain =
  | "recepcion"
  | "oc"
  | "nc"
  | "prioridadNC"
  | "lote"
  | "proveedor"
  | "item";

type StatusValue = number | string;

interface StatusBadgeProps {
  domain:     StatusDomain;
  value:      StatusValue;
  size?:      BadgeSize;
  className?: string;
}

interface StatusConfig {
  color: BadgeColor;
  label: string;
  dot?: boolean;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getStatusConfig(domain: StatusDomain, value: StatusValue): StatusConfig | undefined {
  switch (domain) {
    case "recepcion":   return RECEPCION_CFG[value as number];
    case "oc":          return OC_CFG[value as number];
    case "nc":          return NC_CFG[value as number];
    case "prioridadNC": return PRIORIDAD_NC_CFG[value as number];
    case "lote":        return LOTE_CFG[String(value)];
    case "proveedor":   return PROVEEDOR_CFG[value as number];
    case "item":        return ITEM_CFG[value as number];
    default:            return undefined;
  }
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

/**
 * Badge semántico de dominio — punto único de verdad para colores de estado.
 * Utiliza el componente Badge base con los tokens del tema.
 *
 * @example
 * <StatusBadge domain="recepcion"   value={0} /> // Iniciada
 * <StatusBadge domain="oc"          value={0} /> // Abierta
 * <StatusBadge domain="nc"          value={2} /> // En proceso
 * <StatusBadge domain="prioridadNC" value={3} /> // Crítica
 * <StatusBadge domain="lote"        value="Liberado" />
 * <StatusBadge domain="proveedor"   value={0} /> // Activo
 */
export function StatusBadge({ 
  domain, 
  value, 
  size = "sm", 
  className 
}: StatusBadgeProps) {
  
  const config = getStatusConfig(domain, value);

  if (!config) {
    return (
      <Badge color="slate" size={size} className={className}>
        {String(value)}
      </Badge>
    );
  }

  return (
    <Badge 
      color={config.color} 
      size={size} 
      dot={config.dot} 
      className={className}
    >
      {config.label}
    </Badge>
  );
}

export default StatusBadge;