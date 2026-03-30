import { apiClient } from "./apiClient";
import type {
  LiberarLoteCommand,
  RechazarLoteCommand,
  PonerEnCuarentenaCommand,
  RegistrarTemperaturaCommand,
  TipoDocumento,
} from "../Types";

// ─── DTOs DE RESPUESTA (basados en el backend) ───────────────────────────────

// Basado en LotePendienteDto del backend (ajusta según el real)
export interface LotePendienteDto {
  id: string;
  numeroLoteInterno: string;
  numeroLoteProveedor?: string;
  itemId: string;
  itemNombre: string;
  itemCodigo: string;
  categoriaNombre: string;
  proveedorNombre: string;
  recepcionId: string;
  numeroRecepcion: string;
  fechaRecepcion: string; // "YYYY-MM-DD"
  fechaFabricacion?: string;
  fechaVencimiento: string;
  diasParaVencer: number;
  cantidadRecibida: number;
  // cantidadEsperada: number; // verificar existencia en backend
  unidadMedida: string;
  requiereCadenaFrio: boolean;
  temperaturaMedida?: number;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  temperaturaDentroRango?: boolean;
  estadoSensorial: number; // 0=Optimo, 1=Aceptable, 2=Deficiente
  estadoRotulado: number;   // 0=Conforme, 1=NoConforme, 2=SinRotulo
  ubicacionDestino: number; // 0=CD, 1=CP
  estado: string; // "PendienteCalidad", "Liberado", "RechazadoTotal", etc.
  tieneDocumentosFaltantes: boolean;
  documentosFaltantes: string[];
  observacionesRecepcion?: string;
}

// Basado en TrazabilidadLoteDto del backend
export interface TrazabilidadLoteDto {
  id: string;
  codigoLoteInterno: string;
  numeroLoteProveedor?: string;
  codigoQr: string;
  estado: number; // EstadoLote
  itemCodigo: string;
  itemNombre: string;
  categoriaNombre: string;
  numeroOC: string;
  numeroRecepcion: string;
  proveedorNombre: string;
  proveedorNit: string;
  fechaFabricacion?: string;
  fechaVencimiento: string;
  diasVidaUtilRestantes: number;
  fechaRecepcion: string;
  cantidadRecibida: number;
  cantidadRechazada: number;
  unidadMedida: string;
  temperaturaMedida?: number;
  estadoSensorial: number;
  estadoRotulado: number;
  ubicacionDestino?: number;
  inspeccionVehiculo?: InspeccionVehiculoResumenDto;
  liberacion?: LiberacionLoteResumenDto;
  cuarentena?: CuarentenaResumenDto;
  historialTemperaturas: TemperaturaRegistroResumenDto[];
  resultadosChecklist: ResultadoChecklistResumenDto[];
  noConformidades: NoConformidadResumenDto[];
  documentos: DocumentoResumenDto[];
  registradoPorNombre: string;
  fechaRegistro: string;
}

// Interfaces anidadas para trazabilidad (simplificadas)
export interface InspeccionVehiculoResumenDto {
  resultado: number; // 0=Conforme, 1=NoConforme
  temperaturaInicial?: number;
  temperaturaDentroRango: boolean;
  limpiezaVehiculo: boolean;
  plagasVisible: boolean;
  observaciones?: string;
}

export interface LiberacionLoteResumenDto {
  decision: number; // 0=Liberado, 1=RechazadoDefinitivo
  observaciones?: string;
  liberadoPorNombre: string;
  fechaLiberacion: string;
}

export interface CuarentenaResumenDto {
  fechaCuarentena: string;
  fechaLiberacion?: string;
  motivo: string;
  decision?: number; // 0=Liberar, 1=Rechazar
  estaActiva: boolean;
}

export interface TemperaturaRegistroResumenDto {
  temperatura: number;
  fechaHora: string;
  origen: number; // 0=Manual, 1=SensorBluetooth, 2=Importado
  estaFueraDeRango: boolean;
  observacion?: string;
}

export interface ResultadoChecklistResumenDto {
  criterio: string;
  esCritico: boolean;
  resultado: number; // 0=Cumple, 1=NoCumple, 2=NoAplica
  observacion?: string;
}

export interface NoConformidadResumenDto {
  tipo: number;
  causalNombre: string;
  descripcion: string;
  estado: number;
  creadoEn: string;
}

export interface DocumentoResumenDto {
  tipoDocumento: number;
  nombreArchivo: string;
  adjuntoUrl: string;
  esValido?: boolean;
}

// ─── SERVICIO ─────────────────────────────────────────────────────────────────

export const lotesService = {
  // Trazabilidad completa de un lote
  async getTrazabilidad(id: string): Promise<TrazabilidadLoteDto> {
    const { data } = await apiClient.get(`/api/Lotes/${id}/trazabilidad`);
    return data;
  },

  // Lotes pendientes de liberación
  async getPendientes(): Promise<LotePendienteDto[]> {
    const { data } = await apiClient.get("/api/Lotes/pendientes-liberacion");
    return data;
  },

  // Liberar o rechazar definitivamente un lote
  async liberar(cmd: LiberarLoteCommand): Promise<void> {
    // El comando ya tiene loteId, decision y observaciones
    await apiClient.post(`/api/Lotes/${cmd.loteId}/liberar`, cmd);
  },

  // Rechazar un lote (parcial/total) generando una no conformidad
  async rechazar(cmd: RechazarLoteCommand): Promise<void> {
    await apiClient.post(`/api/Lotes/${cmd.loteId}/rechazar`, cmd);
  },

  // Poner en cuarentena
  async ponerEnCuarentena(cmd: PonerEnCuarentenaCommand): Promise<{ id: string }> {
    const { data } = await apiClient.post(`/api/Lotes/${cmd.loteId}/cuarentena`, cmd);
    return data; // { id: string }
  },

  // Registrar temperatura en un lote específico
  async registrarTemperatura(
    loteId: string,
    cmd: Omit<RegistrarTemperaturaCommand, 'loteRecibidoId'>
  ): Promise<{ id: string }> {
    const payload = { ...cmd, loteRecibidoId: loteId, recepcionId: undefined };
    const { data } = await apiClient.post(`/api/Lotes/${loteId}/temperaturas`, payload);
    return data;
  },

  // Adjuntar documento a un lote
  async subirDocumento(
    loteId: string,
    tipoDocumento: TipoDocumento,
    archivo: File
  ): Promise<{ id: string }> {
    const form = new FormData();
    form.append("TipoDocumento", String(tipoDocumento));
    form.append("Archivo", archivo);
    const { data } = await apiClient.post(`/api/Lotes/${loteId}/documentos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};