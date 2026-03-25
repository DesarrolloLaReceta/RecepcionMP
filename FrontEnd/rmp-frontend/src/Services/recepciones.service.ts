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
  UbicacionDestino,
} from "../Types/api";

// ─── TIPOS RESUMEN ────────────────────────────────────────────────────────────

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

// ─── TIPOS DETALLE ────────────────────────────────────────────────────────────

export interface LoteResumen {
  id: string;
  codigoLoteInterno: string;
  numeroLoteProveedor?: string;
  itemCodigo: string;
  itemNombre: string;
  fechaVencimiento: string;
  diasVidaUtilRestantes: number;
  estaVencido: boolean;
  cantidadRecibida: number;
  cantidadRechazada: number;
  estado: string;
  ubicacionDestino?: UbicacionDestino;
}

export interface InspeccionVehiculo {
  id: string;
  temperaturaInicial?: number;
  temperaturaDentroRango: boolean;
  integridadEmpaque: boolean;
  limpiezaVehiculo: boolean;
  presenciaOloresExtranos: boolean;
  plagasVisible: boolean;
  documentosTransporteOk: boolean;
  resultado: number;
  observaciones?: string;
  registradoPorNombre: string;
  fechaRegistro: string;
}

export interface DocumentoAdjunto {
  id: string;
  tipoDocumento: number;
  nombreArchivo: string;
  adjuntoUrl: string;
  fechaCarga: string;
  cargadoPorNombre: string;
  esValido?: boolean;
}

export interface RegistroTemperatura {
  id: string;
  temperatura: number;
  unidadMedida: string;
  fechaHora: string;
  origen: number;
  estaFueraDeRango: boolean;
  dispositivoId?: string;
  observacion?: string;
  registradoPorNombre: string;
}

export interface RecepcionDetalle extends RecepcionResumen {
  numeroOC: string;
  creadoPorNombre?: string;
  inspeccionVehiculo?: InspeccionVehiculo;
  lotes: LoteResumen[];
  documentos: DocumentoAdjunto[];
  registrosTemperatura: RegistroTemperatura[];
}

// ─── FILTROS ──────────────────────────────────────────────────────────────────

export interface RecepcionesFilter {
  estado?: EstadoRecepcion;
  proveedorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// ─── SERVICIO ─────────────────────────────────────────────────────────────────

export const recepcionesService = {
  async getAll(filter?: RecepcionesFilter): Promise<RecepcionResumen[]> {
    const { data } = await apiClient.get("/api/Recepciones", {
      params: filter ?? {},
    });
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

export { ordenesCompraService } from "./ordenes-compra.service";