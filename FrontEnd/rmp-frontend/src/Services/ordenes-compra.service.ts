import { apiClient } from "./apiClient";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export enum EstadoOC {
  Abierta               = 0,
  ParcialmenteRecibida  = 1,
  TotalmenteRecibida    = 2,
  Cerrada               = 3,
  Cancelada             = 4,
  Vencida               = 5,
}

export const EstadoOCLabels: Record<EstadoOC, string> = {
  [EstadoOC.Abierta]:              "Abierta",
  [EstadoOC.ParcialmenteRecibida]: "Parcialmente recibida",
  [EstadoOC.TotalmenteRecibida]:   "Totalmente recibida",
  [EstadoOC.Cerrada]:              "Cerrada",
  [EstadoOC.Cancelada]:            "Cancelada",
  [EstadoOC.Vencida]:              "Vencida",
};

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface DetalleOC {
  id: string;
  itemId: string;
  itemNombre: string;
  itemCodigo: string;
  categoriaId: string;
  categoriaNombre: string;
  cantidadSolicitada: number;
  cantidadRecibida: number;
  cantidadPendiente: number;
  unidadMedida: string;
  precioUnitario: number;
  subtotal: number;
  requiereCadenaFrio: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
}

export interface OrdenCompraResumen {
  id: string;
  numeroOC: string;
  proveedorId: string;
  proveedorNombre: string;
  proveedorNit: string;
  fechaEmision: string;
  fechaEntregaEsperada?: string;
  fechaVencimiento?: string;
  estado: EstadoOC;
  totalItems: number;
  valorTotal: number;
  detalles: DetalleOC[];
  requiereCadenaFrio: boolean;
}

export interface OrdenCompra extends OrdenCompraResumen {
  notas?: string;
  creadoPor: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  recepciones: { id: string; numeroRecepcion: string; fecha: string }[];
}

// ─── FILTROS ──────────────────────────────────────────────────────────────────

export interface OrdenesCompraFilter {
  estado?: EstadoOC;
  proveedorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  soloAbiertas?: boolean;
}

// ─── COMMANDS ────────────────────────────────────────────────────────────────

export interface CrearOCDetalleCommand {
  itemId: string;
  cantidadSolicitada: number;
  precioUnitario: number;
  unidadMedida: string;
}

export interface CrearOCCommand {
  numeroOC: string;
  proveedorId: string;
  fechaEntregaEsperada?: string;
  fechaEmision?: string;
  notas?: string;
  detalles: CrearOCDetalleCommand[];
}

export interface ActualizarOCCommand {
  fechaEntregaEsperada?: string;
  notas?: string;
}

// ─── SERVICIO ─────────────────────────────────────────────────────────────────

export const ordenesCompraService = {
  /** Lista completa con filtros — rol Compras / Administrador */
  async getAll(filter?: OrdenesCompraFilter): Promise<OrdenCompraResumen[]> {
    const { data } = await apiClient.get("/api/OrdenesCompra/todas", {
      params: filter ?? {},
    });
    return data;
  },

  /** Solo las OC en estado Abierta o ParcialmenteRecibida — para el wizard de recepción */
  async getAbiertas(proveedorId?: string): Promise<OrdenCompraResumen[]> {
    const { data } = await apiClient.get("/api/OrdenesCompra/abiertas", {
      params: proveedorId ? { proveedorId } : {},
    });
    return data;
  },

  async getById(id: string): Promise<OrdenCompra> {
    const { data } = await apiClient.get(`/api/OrdenesCompra/${id}`);
    return data;
  },

  async crear(cmd: CrearOCCommand): Promise<{ id: string; numeroOC: string }> {
    const { data } = await apiClient.post("/api/OrdenesCompra", cmd);
    return data;
  },

  async actualizar(id: string, cmd: ActualizarOCCommand): Promise<void> {
    await apiClient.put(`/api/OrdenesCompra/${id}`, cmd);
  },

  async aprobar(id: string): Promise<void> {
    await apiClient.post(`/api/OrdenesCompra/${id}/aprobar`);
  },

  async cancelar(id: string, motivo: string): Promise<void> {
    await apiClient.post(`/api/OrdenesCompra/${id}/cancelar`, { motivo });
  },

  async cerrar(id: string): Promise<void> {
    await apiClient.post(`/api/OrdenesCompra/${id}/cerrar`);
  },
};