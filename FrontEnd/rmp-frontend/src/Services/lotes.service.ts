import { apiClient } from "./apiClient";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type EstadoLote = "PendienteCalidad" | "Liberado" | "Rechazado" | "Cuarentena";

export interface LotePendiente {
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
  fechaRecepcion: string;
  fechaFabricacion?: string;
  fechaVencimiento: string;
  diasParaVencer: number;
  cantidadRecibida: number;
  cantidadEsperada: number;
  unidadMedida: string;
  requiereCadenaFrio: boolean;
  temperaturaMedida?: number;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  temperaturaDentroRango?: boolean;
  estadoSensorial: number;
  estadoRotulado: number;
  ubicacionDestino: number;
  estado: EstadoLote;
  tieneDocumentosFaltantes: boolean;
  documentosFaltantes: string[];
  observacionesRecepcion?: string;
}

export type TipoRechazo = "Total" | "Parcial" | "Cuarentena";

export const TipoRechazoLabels: Record<TipoRechazo, string> = {
  Total:      "Rechazo total — devolución al proveedor",
  Parcial:    "Rechazo parcial — ingresa cantidad aceptada",
  Cuarentena: "Cuarentena — análisis adicional requerido",
};

export interface LiberarLoteCommand {
  loteId: string;
  observaciones?: string;
}

export interface RechazarLoteCommand {
  loteId: string;
  motivoRechazo: string;
  tipoRechazo: TipoRechazo;
  accionCorrectiva?: string;
  generaNoConformidad: boolean;
}

export interface LoteKpis {
  pendientes: number;
  liberadosHoy: number;
  rechazadosHoy: number;
  enCuarentena: number;
}

// ─── SERVICIO ─────────────────────────────────────────────────────────────────

export const lotesService = {
  async getPendientes(): Promise<LotePendiente[]> {
    const { data } = await apiClient.get("/api/Lotes/pendientes-liberacion");
    return data;
  },
  async liberar(cmd: LiberarLoteCommand): Promise<void> {
    await apiClient.post(`/api/Lotes/${cmd.loteId}/liberar`, cmd);
  },
  async rechazar(cmd: RechazarLoteCommand): Promise<void> {
    await apiClient.post(`/api/Lotes/${cmd.loteId}/rechazar`, cmd);
  },
  async pasarACuarentena(loteId: string, motivo: string): Promise<void> {
    await apiClient.post(`/api/Lotes/${loteId}/cuarentena`, { loteId, motivo });
  },
};