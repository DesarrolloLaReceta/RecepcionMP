// ════════════════════════════════════════════════════════════════════════════
// TIPOS TYPESCRIPT — Sistema Recepción Materia Prima
// Generados a partir de swagger v1 (ASP.NET Core 8)
// ════════════════════════════════════════════════════════════════════════════

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export enum EstadoOrdenCompra {
  Borrador    = 0,
  Abierta     = 1,
  Cerrada     = 2,
  Anulada     = 3,
}

export const EstadoOrdenCompraLabels: Record<EstadoOrdenCompra, string> = {
  [EstadoOrdenCompra.Borrador]:  "Borrador",
  [EstadoOrdenCompra.Abierta]:   "Abierta",
  [EstadoOrdenCompra.Cerrada]:   "Cerrada",
  [EstadoOrdenCompra.Anulada]:   "Anulada",
};

export enum EstadoRecepcion {
  Iniciada          = 0,
  InspeccionVehiculo = 1,
  RegistroLotes     = 2,
  PendienteCalidad  = 3,
  Liberada          = 4,
  Rechazada         = 5,
}

export const EstadoRecepcionLabels: Record<EstadoRecepcion, string> = {
  [EstadoRecepcion.Iniciada]:           "Iniciada",
  [EstadoRecepcion.InspeccionVehiculo]: "Inspección vehículo",
  [EstadoRecepcion.RegistroLotes]:      "Registro de lotes",
  [EstadoRecepcion.PendienteCalidad]:   "Pendiente calidad",
  [EstadoRecepcion.Liberada]:           "Liberada",
  [EstadoRecepcion.Rechazada]:          "Rechazada",
};

export enum EstadoRotulado {
  Conforme    = 0,
  NoConforme  = 1,
  Incompleto  = 2,
}

export const EstadoRotuladoLabels: Record<EstadoRotulado, string> = {
  [EstadoRotulado.Conforme]:   "Conforme",
  [EstadoRotulado.NoConforme]: "No conforme",
  [EstadoRotulado.Incompleto]: "Incompleto",
};

export enum EstadoSensorial {
  Aceptable = 0,
  Dudoso    = 1,
  Rechazado = 2,
}

export const EstadoSensorialLabels: Record<EstadoSensorial, string> = {
  [EstadoSensorial.Aceptable]: "Aceptable",
  [EstadoSensorial.Dudoso]:    "Dudoso",
  [EstadoSensorial.Rechazado]: "Rechazado",
};

export enum TipoDocumento {
  RegistroSanitarioINVIMA    = 0,
  CertificadoAnalisis        = 1,
  CertificadoTransporte      = 2,
  BitacoraTemperatura        = 3,
  EvidenciaRotulado          = 4,
  HabilitacionCarnico        = 5,
  HabilitacionLacteo         = 6,
  Otro                       = 7,
}

export const TipoDocumentoLabels: Record<TipoDocumento, string> = {
  [TipoDocumento.RegistroSanitarioINVIMA]: "Registro sanitario INVIMA",
  [TipoDocumento.CertificadoAnalisis]:     "Certificado de análisis (COA)",
  [TipoDocumento.CertificadoTransporte]:   "Certificado de transporte",
  [TipoDocumento.BitacoraTemperatura]:     "Bitácora de temperatura",
  [TipoDocumento.EvidenciaRotulado]:       "Evidencia de rotulado",
  [TipoDocumento.HabilitacionCarnico]:     "Habilitación cárnicos (Dec. 1500)",
  [TipoDocumento.HabilitacionLacteo]:      "Habilitación lácteos (Dec. 616)",
  [TipoDocumento.Otro]:                    "Otro",
};

export enum TipoNoConformidad {
  Merma          = 0,
  RechazoTotal   = 1,
  RechazoParcial = 2,
  Cuarentena     = 3,
}

export const TipoNoConformidadLabels: Record<TipoNoConformidad, string> = {
  [TipoNoConformidad.Merma]:          "Merma",
  [TipoNoConformidad.RechazoTotal]:   "Rechazo total",
  [TipoNoConformidad.RechazoParcial]: "Rechazo parcial",
  [TipoNoConformidad.Cuarentena]:     "Cuarentena",
};

export enum DecisionLiberacion {
  Liberar  = 0,
  Rechazar = 1,
}

export enum OrigenTemperatura {
  Manual    = 0,
  Bluetooth = 1,
  Sensor    = 2,
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
  Almacen    = 0,
  Cuarentena = 1,
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