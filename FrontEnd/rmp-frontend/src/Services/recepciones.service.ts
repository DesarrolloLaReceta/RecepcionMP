import { apiClient } from "./apiClient";
import type {
  IniciarRecepcionCommand,
  RegistrarInspeccionVehiculoCommand,
  RegistrarLoteRecibidoCommand,
  RegistrarTemperaturaCommand,
  TipoDocumento,
  EstadoRecepcion,
  EstadoSensorial,
  EstadoRotulado,
} from "../Types/api";

// ─── TIPOS DE RESPUESTA ───────────────────────────────────────────────────────

export interface RecepcionResumen {
  id: string;
  numeroRecepcion: string;
  ordenCompraNumero: string;
  proveedorNombre: string;
  proveedorId: string;
  fechaRecepcion: string;
  horaLlegadaVehiculo: string;
  placaVehiculo?: string;
  nombreTransportista?: string;
  estado: EstadoRecepcion;
  totalLotes: number;
  lotesLiberados: number;
  lotesRechazados: number;
  observacionesGenerales?: string;
}

export interface RecepcionDetalle extends RecepcionResumen {
  ordenCompraId: string;
  inspeccionVehiculo?: InspeccionVehiculo;
  lotes: LoteRecibido[];
  documentos: DocumentoAdjunto[];
  temperaturas: RegistroTemperatura[];
}

export interface InspeccionVehiculo {
  temperaturaInicial?: number;
  temperaturaDentroRango: boolean;
  integridadEmpaque: boolean;
  limpiezaVehiculo: boolean;
  presenciaOloresExtranos: boolean;
  plagasVisible: boolean;
  documentosTransporteOk: boolean;
  observaciones?: string;
  fechaRegistro: string;
}

export interface LoteRecibido {
  id: string;
  itemId: string;
  itemNombre: string;
  itemCodigo: string;
  detalleOcId: string;
  numeroLoteProveedor?: string;
  numeroLoteInterno: string;
  fechaFabricacion?: string;
  fechaVencimiento: string;
  cantidadRecibida: number;
  cantidadEsperada: number;
  unidadMedida: string;
  temperaturaMedida?: number;
  estadoSensorial: EstadoSensorial;
  estadoRotulado: EstadoRotulado;
  ubicacionDestino: number;
  estado: string;
  documentos: DocumentoAdjunto[];
}

export interface DocumentoAdjunto {
  id: string;
  tipoDocumento: number;
  nombreArchivo: string;
  urlDescarga: string;
  fechaCarga: string;
}

export interface RegistroTemperatura {
  id: string;
  temperatura: number;         
  unidadMedida: string;
  fechaRegistro: string;        
  origen: number;               
  estaFueraDeRango: boolean;    
  dispositivoId?: string;
  observacion?: string;
  // Campos opcionales que puede proyectar el DTO de respuesta
  loteId?: string;
  loteNumero?: string;          
  itemNombre?: string;         
}

// ─── TIPOS OC — fuente canónica en ordenes-compra.service ───────────────────
export type { OrdenCompraResumen, DetalleOC } from "./ordenes-compra.service";

// ─── FILTROS ──────────────────────────────────────────────────────────────────

export interface RecepcionesFilter {
  estado?: EstadoRecepcion;
  proveedorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// ─── SERVICIO RECEPCIONES ────────────────────────────────────────────────────

export const recepcionesService = {
  async getAll(filter?: RecepcionesFilter): Promise<RecepcionResumen[]> {
    const { data } = await apiClient.get("/api/Recepciones", { params: filter ?? {} });
    return data;
  },

  async getById(id: string): Promise<RecepcionDetalle> {
    const { data } = await apiClient.get(`/api/Recepciones/${id}`);
    return data;
  },

  async iniciar(cmd: IniciarRecepcionCommand): Promise<{ id: string }> {
    const { data } = await apiClient.post("/api/Recepciones", cmd);
    return data;
  },

  async registrarInspeccionVehiculo(
    id: string,
    cmd: RegistrarInspeccionVehiculoCommand
  ): Promise<void> {
    await apiClient.post(`/api/Recepciones/${id}/inspeccion-vehiculo`, cmd);
  },

  async registrarLote(
    id: string,
    cmd: RegistrarLoteRecibidoCommand
  ): Promise<{ id: string }> {
    const { data } = await apiClient.post(`/api/Recepciones/${id}/lotes`, cmd);
    return data;
  },

  async registrarTemperatura(
    id: string,
    cmd: RegistrarTemperaturaCommand
  ): Promise<void> {
    await apiClient.post(`/api/Recepciones/${id}/temperaturas`, cmd);
  },

  async subirDocumento(
    id: string,
    tipoDocumento: TipoDocumento,
    archivo: File
  ): Promise<void> {
    const form = new FormData();
    form.append("TipoDocumento", String(tipoDocumento));
    form.append("Archivo", archivo);
    await apiClient.post(`/api/Recepciones/${id}/documentos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ─── SERVICIO OC — re-exportado desde ordenes-compra.service ────────────────
export { ordenesCompraService } from "./ordenes-compra.service";