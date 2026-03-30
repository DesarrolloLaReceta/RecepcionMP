import { apiClient } from "./apiClient";
import type {
  IniciarRecepcionCommand,
  RegistrarInspeccionVehiculoCommand,
  RegistrarTemperaturaCommand,
  TipoDocumento,
  EstadoRecepcion,
  AgregarItemRecepcionCommand,
} from "../Types";

// ─── DTOs DE RESPUESTA (basados en el backend) ─────────────────────────────────

export interface RecepcionResumen {
  id: string;
  numeroRecepcion: string;
  ordenCompraNumero: string;
  proveedorId: string;
  proveedorNombre: string;
  fechaRecepcion: string;          // "YYYY-MM-DD"
  horaLlegadaVehiculo: string;     // "HH:MM:SS"
  placaVehiculo?: string;
  nombreTransportista?: string;
  estado: EstadoRecepcion;          // 0|1|2|3|4|5
  totalLotes: number;
  lotesLiberados: number;
  lotesRechazados: number;
  observacionesGenerales?: string;
}

// Interfaces para los DTOs anidados (puedes refinarlos después)
export interface FacturaDto {
  // Propiedades según el backend
  id: string;
  numeroFactura: string;
  fecha: string;
  valor: number;
}

export interface InspeccionVehiculoDto {
  id: string;
  temperaturaInicial?: number;
  temperaturaDentroRango: boolean;
  integridadEmpaque: boolean;
  limpiezaVehiculo: boolean;
  presenciaOloresExtranos: boolean;
  plagasVisible: boolean;
  documentosTransporteOk: boolean;
  resultado: number; // 0=Conforme, 1=NoConforme (puede ser enum)
  observaciones?: string;
  registradoPorNombre: string;
  fechaRegistro: string;
}

export interface LoteResumenDto {
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
  estado: string; // Puede ser "Liberado", "RechazadoTotal", etc.
  ubicacionDestino?: number; // 0=CD, 1=CP
}

export interface DocumentoRecepcionDto {
  id: string;
  tipoDocumento: TipoDocumento;
  nombreArchivo: string;
  adjuntoUrl: string;
  fechaCarga: string;
  cargadoPorNombre: string;
  esValido?: boolean;
}

export interface TemperaturaRegistroDto {
  id: string;
  temperatura: number;
  unidadMedida: string;
  fechaHora: string;
  origen: number; // 0=Manual, 1=SensorBluetooth, 2=Importado
  estaFueraDeRango: boolean;
  dispositivoId?: string;
  observacion?: string;
  registradoPorNombre: string;
}

export interface RecepcionDetalle extends RecepcionResumen {
  numeroOC: string;
  factura?: FacturaDto;
  inspeccionVehiculo?: InspeccionVehiculoDto;
  lotes: LoteResumenDto[];
  documentos: DocumentoRecepcionDto[];
  registrosTemperatura: TemperaturaRegistroDto[];
}

// ─── FILTROS ──────────────────────────────────────────────────────────────────

export interface RecepcionesFilter {
  estado?: EstadoRecepcion;
  proveedorId?: string;
  fechaDesde?: string; // "YYYY-MM-DD"
  fechaHasta?: string;
}

// ─── SERVICIO ─────────────────────────────────────────────────────────────────

export const recepcionesService = {
  // Lista recepciones con filtros opcionales
  async getAll(filter?: RecepcionesFilter): Promise<RecepcionResumen[]> {
    const { data } = await apiClient.get("/api/Recepciones", {
      params: filter ?? {},
    });
    return data;
  },

  // Obtiene detalle completo de una recepción
  async getById(id: string): Promise<RecepcionDetalle> {
    const { data } = await apiClient.get(`/api/Recepciones/${id}`);
    return data;
  },

  // Paso 1: Iniciar recepción
  async iniciar(cmd: IniciarRecepcionCommand): Promise<{ id: string }> {
    const { data } = await apiClient.post("/api/Recepciones", cmd);
    return data;
  },

  // Paso 2: Registrar inspección del vehículo
  async registrarInspeccionVehiculo(
    id: string,
    cmd: RegistrarInspeccionVehiculoCommand
  ): Promise<void> {
    await apiClient.post(`/api/Recepciones/${id}/inspeccion-vehiculo`, cmd);
  },

  // Nuevo: Agregar un ítem a la recepción
  async agregarItem(
    recepcionId: string,
    cmd: AgregarItemRecepcionCommand
  ): Promise<{ id: string }> {
    const { data } = await apiClient.post(`/api/Recepciones/${recepcionId}/items`, cmd);
    return data;
  },

  // Registrar temperatura a nivel de recepción (antes de descargar)
  async registrarTemperatura(
    recepcionId: string,
    cmd: RegistrarTemperaturaCommand
  ): Promise<{ id: string }> {
    // Forzamos que el comando no tenga loteRecibidoId
    const payload = { ...cmd, recepcionId, loteRecibidoId: undefined };
    const { data } = await apiClient.post(`/api/Recepciones/${recepcionId}/temperaturas`, payload);
    return data;
  },

  // Subir documento a la recepción
  async subirDocumento(
    recepcionId: string,
    tipoDocumento: TipoDocumento,
    archivo: File
  ): Promise<{ id: string }> {
    const form = new FormData();
    form.append("TipoDocumento", String(tipoDocumento));
    form.append("Archivo", archivo);
    const { data } = await apiClient.post(`/api/Recepciones/${recepcionId}/documentos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Finalizar recepción
  async finalizarRecepcion(recepcionId: string): Promise<void> {
    await apiClient.post(`/api/Recepciones/${recepcionId}/finalizar`);
  },
};