import { apiClient } from "./apiClient";

const isMock = import.meta.env.VITE_USE_MOCK === "true";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export enum EstadoProveedor { Activo = 0, Inactivo = 1, Suspendido = 2 }
export enum EstadoItem      { Activo = 0, Inactivo = 1 }
export enum UnidadMedida    { Kg = "Kg", G = "g", L = "L", ML = "mL", Unidad = "Und", Caja = "Caja" }

export const EstadoProveedorLabels: Record<EstadoProveedor, string> = {
  [EstadoProveedor.Activo]:     "Activo",
  [EstadoProveedor.Inactivo]:   "Inactivo",
  [EstadoProveedor.Suspendido]: "Suspendido",
};
export const EstadoItemLabels: Record<EstadoItem, string> = {
  [EstadoItem.Activo]:   "Activo",
  [EstadoItem.Inactivo]: "Inactivo",
};

// ─── TIPOS: PROVEEDOR ─────────────────────────────────────────────────────────

export interface DocumentoProveedor {
  id: string;
  tipoDocumento: number;
  numeroDocumento: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  adjuntoUrl?: string;
  diasParaVencer?: number;
  estaVigente?: boolean;
  estadoVigencia?: number;
}

export interface Proveedor {
  id: string;
  razonSocial: string;
  nit: string;
  telefono?: string;
  emailContacto?: string;
  direccion?: string;
  estado: EstadoProveedor;
  categorias: string[];
  contactos: {
    id: string;
    nombre: string;
    cargo?: string;
    telefono?: string;
    email?: string;
    esPrincipal: boolean;
  }[];
  documentosSanitarios: DocumentoProveedor[];
  totalRecepciones: number;
  ultimaRecepcion?: string;
  tasaAceptacion?: number;
  creadoEn: string;
}

export interface ProveedorResumen {
  id: string;
  razonSocial: string;
  nit: string;
  direccion?: string;
  estado: EstadoProveedor;
  categorias: string[];
  documentosVigentes: number;
  documentosPorVencer: number;
  documentosVencidos: number;
  totalRecepciones: number;
  tasaAceptacion: number;
}

export interface CrearProveedorCommand {
  razonSocial: string;
  nit: string;
  telefono?: string;
  emailContacto?: string;
  direccion?: string;
  // Contacto principal
  nombreContacto?: string;
  cargoContacto?: string;
  telefonoContacto?: string;
  emailContactoProveedor?: string;
}

export interface ActualizarProveedorCommand {
  id: string;
  razonSocial: string;
  telefono?: string;
  emailContacto?: string;
  direccion?: string;
  estado?: EstadoProveedor;
}



// ─── TIPOS: ITEM ──────────────────────────────────────────────────────────────

export interface DocumentoRequerido {
  tipoDocumento: number;
  nombreTipo: string;
  obligatorio: boolean;
  descripcion?: string;
}

export interface ItemResumen {
  id: string;
  categoriaId: string;
  codigo: string;
  nombre: string;
  categoriaNombre: string;
  unidadMedida: string;
  estado: boolean;
  requiereCadenaFrio: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  totalLotesRecibidos: number;
}

export interface Item extends ItemResumen {
  descripcion?: string;
  categoriaId: string;
  vidaUtilDias: number;
  criteriosAceptacion?: string;
  documentosRequeridos: DocumentoRequerido[];
}

export interface CrearItemCommand {
  codigoInterno: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  unidadMedida: string;
  vidaUtilDias?: number;
  requiereCadenaFrio: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  criteriosAceptacion?: string;
}

// ─── TIPOS: CATEGORÍA ─────────────────────────────────────────────────────────
export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  requiereCadenaFrio: boolean;
  requierePresenciaCalidad: boolean;
  vidaUtilMinimaDias: number;
  rangoTemperaturaMinima?: number;
  rangoTemperaturaMaxima?: number;
  color?: string;
}

// ─── TIPOS: CHECKLIST ─────────────────────────────────────────────────────────

export enum TipoCriterio {
  SiNo     = 0,
  Numerico = 1,
  Texto    = 2,
}

export const TipoCriterioLabels: Record<TipoCriterio, string> = {
  [TipoCriterio.SiNo]:     "Sí / No",
  [TipoCriterio.Numerico]: "Numérico",
  [TipoCriterio.Texto]:    "Texto libre",
};

export interface CriterioChecklist {
  id: string;
  orden: number;
  criterio: string;
  descripcion?: string;
  esCritico: boolean;
  tipoCriterio: TipoCriterio;
  valorMinimo?: number;
  valorMaximo?: number;
  unidad?: string;
}

export interface Checklist {
  id: string;
  nombre: string;
  categoriaId: string;
  categoriaNombre: string;
  version: number;
  estado: boolean;
  creadoEn: string;
  items: CriterioChecklist[];
}

export interface ChecklistResumen {
  id: string;
  nombre: string;
  categoriaId: string;
  categoriaNombre: string;
  version: number;
  estado: boolean;
  totalCriterios: number;
  obligatorios: number;
  creadoEn: string;
}

// ─── SERVICIOS ────────────────────────────────────────────────────────────────

export const proveedoresService = {
  async getAll(params?: { soloActivos?: boolean }): Promise<ProveedorResumen[]> {
    const { data } = await apiClient.get("/api/Proveedores", {
      params: { soloActivos: params?.soloActivos ?? false }
    });
    return data;
  },
  async getById(id: string): Promise<Proveedor> {
    const { data } = await apiClient.get(`/api/Proveedores/${id}`);
    return data;
  },
  async crear(cmd: CrearProveedorCommand): Promise<{ id: string }> {
    const { data } = await apiClient.post("/api/Proveedores", cmd);
    return data;
  },
  async actualizar(cmd: ActualizarProveedorCommand): Promise<void> {
    await apiClient.put(`/api/Proveedores/${cmd.id}`, cmd);
  },
  async subirDocumento(
    id: string,
    tipoDocumento: string,
    numeroDocumento: string,
    fechaExpedicion: string,
    fechaVencimiento: string,
    archivo: File
  ): Promise<void> {
    const form = new FormData();
    form.append("TipoDocumento", tipoDocumento);       // número del enum ej: "3"
    form.append("NumeroDocumento", numeroDocumento);
    form.append("FechaExpedicion", fechaExpedicion);   // formato YYYY-MM-DD
    form.append("FechaVencimiento", fechaVencimiento); // formato YYYY-MM-DD
    form.append("Archivo", archivo);
    await apiClient.post(`/api/Proveedores/${id}/documentos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  eliminarDocumentoSanitario: async (
    proveedorId: string, 
    documentoId: string
  ): Promise<void> => {
    if (isMock) return;
    await apiClient.delete(
      `/api/Proveedores/${proveedorId}/documentos/${documentoId}`
    );
  },
};

export const itemsService = {
  async getAll(params?: { soloActivos?: boolean }): Promise<ItemResumen[]> {
    const { data } = await apiClient.get("/api/Items", { 
      params: { soloActivos: params?.soloActivos ?? false }
    });
    return data.map((i: any) => ({ ...i, codigo: i.codigoInterno }));
  },
  async getById(id: string): Promise<Item> {
    const { data } = await apiClient.get(`/api/Items/${id}`);
    return { ...data, codigo: data.codigoInterno };
  },
  async crear(cmd: CrearItemCommand): Promise<{ id: string }> {
    const { data } = await apiClient.post("/api/Items", cmd);
    return data;
  },
  async actualizar(id: string, cmd: Partial<CrearItemCommand> & { estado?: boolean }): Promise<void> {
    await apiClient.put(`/api/Items/${id}`, cmd);
  },
};

export const categoriasService = {
  async getAll(): Promise<Categoria[]> {
    const { data } = await apiClient.get("/api/Categorias");
    return data;
  },
};

export const checklistsService = {
  async getAll(): Promise<ChecklistResumen[]> {
    const { data } = await apiClient.get("/api/Checklists");
    return data.map((c: any) => ({
      ...c,
      totalCriterios: c.totalCriterios ?? c.items?.length ?? 0,
      obligatorios:   c.obligatorios   ?? c.items?.filter((i: any) => i.esCritico).length ?? 0,
    }));
  },

  async getById(id: string): Promise<Checklist> {
    const { data } = await apiClient.get(`/api/Checklists/${id}`);
    return data;
  },

  async crear(payload: { nombre: string; categoriaId: string; items: Omit<CriterioChecklist, "id">[] }): Promise<{ id: string }> {
    const { data } = await apiClient.post("/api/Checklists", {
      nombre:      payload.nombre,
      categoriaId: payload.categoriaId,
      items:       payload.items.map(i => ({
        criterio:     i.criterio,
        descripcion:  i.descripcion,
        esCritico:    i.esCritico,
        orden:        i.orden,
        tipoCriterio: i.tipoCriterio,
        valorMinimo:  i.valorMinimo,
        valorMaximo:  i.valorMaximo,
        unidad:       i.unidad,
      })),
    });
    return data;
  },

  async actualizarCriterios(id: string, criterios: Omit<CriterioChecklist, "id">[]): Promise<void> {
    await apiClient.put(`/api/Checklists/${id}/criterios`, {
      criterios: criterios.map(c => ({
        criterio:     c.criterio,
        descripcion:  c.descripcion,
        esCritico:    c.esCritico,
        orden:        c.orden,
        tipoCriterio: c.tipoCriterio,
        valorMinimo:  c.valorMinimo,
        valorMaximo:  c.valorMaximo,
        unidad:       c.unidad,
      })),
    });
  },

  async publicar(id: string): Promise<void> {
    await apiClient.post(`/api/Checklists/${id}/publicar`);
  },

  async actualizarChecklist(id: string, payload: { nombre: string; categoriaId: string }): Promise<void> {
    await apiClient.put(`/api/Checklists/${id}`, payload);
  },

  async desactivar(id: string): Promise<void> {
    await apiClient.patch(`/api/Checklists/${id}/desactivar`);
  },

  async activar(id: string): Promise<void> {
    await apiClient.patch(`/api/Checklists/${id}/activar`);
  },

  async eliminar(id: string): Promise<void> {
    await apiClient.delete(`/api/Checklists/${id}`);
  },
};