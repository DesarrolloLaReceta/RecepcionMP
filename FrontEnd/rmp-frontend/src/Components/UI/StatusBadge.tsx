import { Badge, type BadgeSize, type BadgeColor } from "./Badge";

// ─── IMPORTACIONES DE ENUMS ───────────────────────────────────────────────────
// StatusBadge es el punto único donde se define el mapping visual de cada
// estado del sistema. Importa directamente de los servicios canónicos.

import { EstadoRecepcion } from "../../Types/api";
import { EstadoOC }        from "../../Services/ordenes-compra.service";
import { EstadoNC, PrioridadNC } from "../../Services/no-conformidades.service";
import { EstadoProveedor }  from "../../Services/maestros.service";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type StatusDomain =
  | "recepcion"
  | "oc"
  | "nc"
  | "prioridadNC"
  | "lote"
  | "proveedor";

type StatusValue = number | string;

interface StatusBadgeProps {
  domain:     StatusDomain;
  value:      StatusValue;
  size?:      BadgeSize;
  className?: string;
}

// ─── TIPOS INTERNOS ───────────────────────────────────────────────────────────

interface StatusConfig {
  color: BadgeColor;
  label: string;
  dot?: boolean;
}

// ─── CONFIGURACIONES VISUALES ─────────────────────────────────────────────────

// ── Recepciones ─────────────────────────────────────────────────────────────
// EstadoRecepcion (api.ts): Iniciada=0 | InspeccionVehiculo=1 | RegistroLotes=2
//                           PendienteCalidad=3 | Liberada=4 | Rechazada=5
const RECEPCION_CFG: Record<EstadoRecepcion, StatusConfig> = {
  [EstadoRecepcion.Iniciada]:           { color: "amber",  label: "Iniciada",            dot: true },
  [EstadoRecepcion.InspeccionVehiculo]: { color: "amber",  label: "Insp. vehículo",      dot: true },
  [EstadoRecepcion.RegistroLotes]:      { color: "amber",  label: "Registro lotes",      dot: true },
  [EstadoRecepcion.PendienteCalidad]:   { color: "yellow", label: "Pendiente calidad",   dot: true },
  [EstadoRecepcion.Liberada]:           { color: "green",  label: "Liberada",            dot: true },
  [EstadoRecepcion.Rechazada]:          { color: "red",    label: "Rechazada",           dot: true },
};

// ── Órdenes de Compra ────────────────────────────────────────────────────────
// EstadoOC: Abierta=0 | ParcialmenteRecibida=1 | TotalmenteRecibida=2
//           Cerrada=3 | Cancelada=4 | Vencida=5
const OC_CFG: Record<EstadoOC, StatusConfig> = {
  [EstadoOC.Abierta]:              { color: "green",  label: "Abierta",               dot: true },
  [EstadoOC.ParcialmenteRecibida]: { color: "amber",  label: "Parcialmente recibida", dot: true },
  [EstadoOC.TotalmenteRecibida]:   { color: "blue",   label: "Totalmente recibida",   dot: true },
  [EstadoOC.Cerrada]:              { color: "slate",  label: "Cerrada" },
  [EstadoOC.Cancelada]:            { color: "slate",  label: "Cancelada" },
  [EstadoOC.Vencida]:              { color: "red",    label: "Vencida",               dot: true },
};

// ── No Conformidades ─────────────────────────────────────────────────────────
// EstadoNC: Abierta=0 | EnAnalisis=1 | EnEjecucion=2 | Cerrada=3 | Anulada=4
const NC_CFG: Record<EstadoNC, StatusConfig> = {
  [EstadoNC.Abierta]:     { color: "red",    label: "Abierta",       dot: true },
  [EstadoNC.EnAnalisis]:  { color: "purple", label: "En análisis",   dot: true },
  [EstadoNC.EnEjecucion]: { color: "amber",  label: "En ejecución",  dot: true },
  [EstadoNC.Cerrada]:     { color: "green",  label: "Cerrada",       dot: true },
  [EstadoNC.Anulada]:     { color: "slate",  label: "Anulada" },
};

// ── Prioridad NC ─────────────────────────────────────────────────────────────
// PrioridadNC: Baja=0 | Media=1 | Alta=2 | Critica=3
const PRIORIDAD_NC_CFG: Record<PrioridadNC, StatusConfig> = {
  [PrioridadNC.Baja]:    { color: "green",  label: "Baja"    },
  [PrioridadNC.Media]:   { color: "yellow", label: "Media"   },
  [PrioridadNC.Alta]:    { color: "red",    label: "Alta"    },
  [PrioridadNC.Critica]: { color: "red",    label: "Crítica" },
};

// ── Lote (estados textuales de la capa de liberación) ────────────────────────
const LOTE_CFG: Record<string, StatusConfig> = {
  Pendiente:          { color: "yellow", label: "Pendiente",   dot: true },
  PendienteCalidad:   { color: "yellow", label: "Pdte. calidad", dot: true },
  Liberado:           { color: "green",  label: "Liberado",    dot: true },
  Rechazado:          { color: "red",    label: "Rechazado",   dot: true },
  Cuarentena:         { color: "purple", label: "Cuarentena",  dot: true },
};

// ── Proveedor ────────────────────────────────────────────────────────────────
// EstadoProveedor: Activo=0 | Inactivo=1 | Suspendido=2
const PROVEEDOR_CFG: Record<EstadoProveedor, StatusConfig> = {
  [EstadoProveedor.Activo]:     { color: "green",  label: "Activo",     dot: true },
  [EstadoProveedor.Inactivo]:   { color: "slate",  label: "Inactivo" },
  [EstadoProveedor.Suspendido]: { color: "red",    label: "Suspendido", dot: true },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Obtiene la configuración visual para un dominio y valor específicos
 */
function getStatusConfig(domain: StatusDomain, value: StatusValue): StatusConfig | undefined {
  switch (domain) {
    case "recepcion":   return RECEPCION_CFG[value as EstadoRecepcion];
    case "oc":          return OC_CFG[value as EstadoOC];
    case "nc":          return NC_CFG[value as EstadoNC];
    case "prioridadNC": return PRIORIDAD_NC_CFG[value as PrioridadNC];
    case "lote":        return LOTE_CFG[String(value)];
    case "proveedor":   return PROVEEDOR_CFG[value as EstadoProveedor];
    default:            return undefined;
  }
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

/**
 * Badge semántico de dominio — punto único de verdad para colores de estado.
 * Utiliza el componente Badge base con los tokens del tema.
 *
 * @example
 * <StatusBadge domain="recepcion"   value={EstadoRecepcion.Liberada} />
 * <StatusBadge domain="oc"          value={EstadoOC.Abierta} size="xs" />
 * <StatusBadge domain="nc"          value={EstadoNC.EnEjecucion} />
 * <StatusBadge domain="prioridadNC" value={PrioridadNC.Critica} />
 * <StatusBadge domain="lote"        value="Cuarentena" />
 * <StatusBadge domain="proveedor"   value={EstadoProveedor.Suspendido} />
 */
export function StatusBadge({ 
  domain, 
  value, 
  size = "sm", 
  className 
}: StatusBadgeProps) {
  
  const config = getStatusConfig(domain, value);

  // Si no hay configuración, mostramos el valor raw con color slate
  if (!config) {
    return (
      <Badge color="slate" size={size} className={className}>
        {String(value)}
      </Badge>
    );
  }

  // Mostramos el badge con la configuración semántica
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