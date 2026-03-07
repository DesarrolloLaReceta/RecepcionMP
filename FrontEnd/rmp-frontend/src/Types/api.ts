// ════════════════════════════════════════════════════════════════════════════
// TIPOS TYPESCRIPT — Sistema Recepción Materia Prima
// Generados a partir de swagger v1 (ASP.NET Core 8)
// ════════════════════════════════════════════════════════════════════════════

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export enum EstadoOrdenCompra {
  Abierta                  = 0,
  ParcialmenteRecibida     = 1,
  CompletamenteRecibida    = 2,
  Cancelada                = 3,
}

export const EstadoOrdenCompraLabels: Record<EstadoOrdenCompra, string> = {
  [EstadoOrdenCompra.Abierta]:  "Abierta",
  [EstadoOrdenCompra.ParcialmenteRecibida]:   "Parcialmente recibida",
  [EstadoOrdenCompra.CompletamenteRecibida]:   "Completamente recibida",
  [EstadoOrdenCompra.Cancelada]:   "Cancelada",
};

export enum EstadoRecepcion {
  Borrador = 0,
  EnInspeccion = 1,
  PendienteLiberacion = 2,
  Liberada = 3,
  Rechazada = 4,
  EnCuarentena = 5
}

export const EstadoRecepcionLabels: Record<EstadoRecepcion, string> = {
  [EstadoRecepcion.Borrador]: "Borrador",
  [EstadoRecepcion.EnInspeccion]: "En inspección",
  [EstadoRecepcion.PendienteLiberacion]: "Pendiente liberación",
  [EstadoRecepcion.Liberada]: "Liberada",
  [EstadoRecepcion.Rechazada]: "Rechazada",
  [EstadoRecepcion.EnCuarentena]: "En cuarentena",
};

export enum EstadoRotulado {
  Conforme    = 0,
  NoConforme  = 1,
  SinRotulo  = 2,
}

export const EstadoRotuladoLabels: Record<EstadoRotulado, string> = {
  [EstadoRotulado.Conforme]:   "Conforme",
  [EstadoRotulado.NoConforme]: "No Conforme",
  [EstadoRotulado.SinRotulo]: "Sin Rotulo",
};

export enum EstadoSensorial {
  Optimo = 0,
  Aceptable    = 1,
  Deficiente = 2,
}

export const EstadoSensorialLabels: Record<EstadoSensorial, string> = {
  [EstadoSensorial.Optimo]: "Optimo",
  [EstadoSensorial.Aceptable]:    "Aceptable",
  [EstadoSensorial.Deficiente]: "Deficiente",
};

export enum TipoDocumento {
  Factura                     = 0,
  OrdendeCompra               = 1,
  COA                         = 2,
  RegistroINVIMA              = 3,
  CertTransporte              = 4,
  BitacoraTemperatura         = 5,
  Rotulado                    = 6,
  Otros                       = 7,
}

export const TipoDocumentoLabels: Record<TipoDocumento, string> = {
  [TipoDocumento.Factura]: "Factura",
  [TipoDocumento.OrdendeCompra]: "Orden de compra",
  [TipoDocumento.COA]: "Certificado de análisis (COA)",
  [TipoDocumento.RegistroINVIMA]: "Registro INVIMA",
  [TipoDocumento.CertTransporte]:   "Certificado de transporte",
  [TipoDocumento.BitacoraTemperatura]: "Bitácora de temperatura",
  [TipoDocumento.Rotulado]:       "Rotulado",
  [TipoDocumento.Otros]:                    "Otro",
};

export enum TipoNoConformidad {
  Merma          = 0,
  RechazoParcial   = 1,
  RechazoTotal = 2,
  Cuarentena     = 3,
}

export const TipoNoConformidadLabels: Record<TipoNoConformidad, string> = {
  [TipoNoConformidad.Merma]:          "Merma",
  [TipoNoConformidad.RechazoParcial]:   "Rechazo parcial",
  [TipoNoConformidad.RechazoTotal]: "Rechazo total",
  [TipoNoConformidad.Cuarentena]:     "Cuarentena",
};

export enum DecisionLiberacion {
  Liberado  = 0,
  RechazadoDefinitivo = 1,
}

export enum OrigenTemperatura {
  Manual    = 0,
  SensorBluetooth = 1,
  Importado    = 2,
}

export enum ResultadoItem {
  Cumple    = 0,
  NoCumple  = 1,
  NoAplica  = 2,
}

export const ResultadoItemLabels: Record<ResultadoItem, string> = {
  [ResultadoItem.Cumple]:   "Cumple",
  [ResultadoItem.NoCumple]: "No cumple",
  [ResultadoItem.NoAplica]: "N/A",
};

export enum UbicacionDestino {
  CD    = 0,
  CP = 1,
}

// ─── COMMANDS (request DTOs) ─────────────────────────────────────────────────

export interface IniciarRecepcionCommand {
  ordenCompraId: string;
  fechaRecepcion: string;           // date YYYY-MM-DD
  horaLlegadaVehiculo: string;      // time HH:mm:ss
  placaVehiculo?: string;
  nombreTransportista?: string;
  observacionesGenerales?: string;
}

export interface RegistrarInspeccionVehiculoCommand {
  recepcionId: string;
  temperaturaInicial?: number;
  temperaturaDentroRango: boolean;
  integridadEmpaque: boolean;
  limpiezaVehiculo: boolean;
  presenciaOloresExtranos: boolean;
  plagasVisible: boolean;
  documentosTransporteOk: boolean;
  observaciones?: string;
}

export interface RegistrarLoteRecibidoCommand {
  recepcionId: string;
  detalleOcId: string;
  itemId: string;
  numeroLoteProveedor?: string;
  fechaFabricacion?: string;
  fechaVencimiento: string;
  cantidadRecibida: number;
  unidadMedida?: string;
  temperaturaMedida?: number;
  estadoSensorial: EstadoSensorial;
  estadoRotulado: EstadoRotulado;
  ubicacionDestino: UbicacionDestino;
}

export interface RegistrarTemperaturaCommand {
  recepcionId?: string;
  loteRecibidoId?: string;
  temperatura: number;
  unidadMedida?: string;
  origen: OrigenTemperatura;
  dispositivoId?: string;
  observacion?: string;
}

export interface LiberarLoteCommand {
  loteId: string;
  decision: DecisionLiberacion;
  observaciones?: string;
}

export interface RechazarLoteCommand {
  loteId: string;
  causalId: string;
  descripcion?: string;
  cantidadAfectada: number;
}

export interface PonerEnCuarentenaCommand {
  loteId: string;
  motivo?: string;
}

export interface CrearNoConformidadCommand {
  loteRecibidoId: string;
  tipo: TipoNoConformidad;
  causalId: string;
  descripcion?: string;
  cantidadAfectada: number;
}

export interface CrearAccionCorrectivaCommand {
  noConformidadId: string;
  descripcionAccion?: string;
  responsableId: string;
  fechaCompromiso: string;
}

export interface CerrarNoConformidadCommand {
  noConformidadId: string;
  accionCorrectivaId: string;
  evidenciaUrl?: string;
  observacionCierre?: string;
}

export interface CrearProveedorCommand {
  razonSocial: string;
  nit: string;
  telefono?: string;
  emailContacto?: string;
  direccion?: string;
}

export interface ActualizarProveedorCommand {
  id: string;
  razonSocial?: string;
  telefono?: string;
  emailContacto?: string;
  direccion?: string;
  estado: boolean;
}

export interface CrearItemCommand {
  codigoInterno?: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  unidadMedida: string;
  vidaUtilDias: number;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  requiereLoteProveedor: boolean;
}

export interface ActualizarItemCommand {
  id: string;
  nombre?: string;
  descripcion?: string;
  unidadMedida?: string;
  vidaUtilDias: number;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  requiereLoteProveedor: boolean;
  estado: boolean;
}

export interface CrearOrdenCompraCommand {
  numeroOC: string;
  proveedorId: string;
  fechaEmision: string;
  fechaEntregaEsperada?: string;
  observaciones?: string;
  detalles?: DetalleOrdenCompraRequest[];
}

export interface DetalleOrdenCompraRequest {
  itemId: string;
  cantidadSolicitada: number;
  unidadMedida?: string;
  precioUnitario: number;
}

export interface ActualizarEstadoOCCommand {
  id: string;
  nuevoEstado: EstadoOrdenCompra;
  motivo?: string;
}

export interface CrearChecklistCommand {
  nombre?: string;
  categoriaId: string;
  items?: ItemChecklistRequest[];
}

export interface ItemChecklistRequest {
  criterio?: string;
  descripcion?: string;
  esCritico: boolean;
  orden: number;
}

export interface RegistrarResultadoChecklistCommand {
  loteRecibidoId: string;
  checklistId: string;
  resultados?: ResultadoItemRequest[];
}

export interface ResultadoItemRequest {
  itemChecklistId: string;
  resultado: ResultadoItem;
  observacion?: string;
}