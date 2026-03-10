import { apiClient } from "./apiClient";

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
  tipo: string;
  nombre: string;
  numeroDocumento?: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  urlArchivo?: string;
  diasParaVencer?: number;
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

export interface ActualizarProveedorCommand extends CrearProveedorCommand {
  id: string;
  estado: EstadoProveedor;
}

// ─── TIPOS: ITEM ──────────────────────────────────────────────────────────────

export interface DocumentoRequerido {
  tipoDocumento: number;
  nombreTipo: string;
  obligatorio: boolean;
}

export interface Item {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  categoriaNombre: string;
  unidadMedida: string;
  estado: EstadoItem;
  requiereCadenaFrio: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  vidaUtilMinimaDias?: number;
  documentosRequeridos: DocumentoRequerido[];
  criteriosAceptacion?: string;
  createdAt: string;
}

export interface ItemResumen {
  id: string;
  codigo: string;
  nombre: string;
  categoriaNombre: string;
  unidadMedida: string;
  estado: EstadoItem;
  requiereCadenaFrio: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  totalLotesRecibidos: number;
}

export interface CrearItemCommand {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  unidadMedida: string;
  requiereCadenaFrio: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  vidaUtilMinimaDias?: number;
  criteriosAceptacion?: string;
}

// ─── TIPOS: CATEGORÍA ─────────────────────────────────────────────────────────

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  requiereCadenaFrio: boolean;
  color: string;
}

// ─── TIPOS: CHECKLIST ─────────────────────────────────────────────────────────

export interface CriterioChecklist {
  id: string;
  orden: number;
  descripcion: string;
  obligatorio: boolean;
  tipoCriterio: "SiNo" | "Numerico" | "Texto";
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
  activo: boolean;
  criterios: CriterioChecklist[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistResumen {
  id: string;
  nombre: string;
  categoriaNombre: string;
  version: number;
  activo: boolean;
  totalCriterios: number;
  obligatorios: number;
  updatedAt: string;
}

// ─── SERVICIOS ────────────────────────────────────────────────────────────────

export const proveedoresService = {
  async getAll(): Promise<ProveedorResumen[]> {
    const { data } = await apiClient.get("/api/Proveedores");
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
  async subirDocumento(id: string, tipo: string, archivo: File): Promise<void> {
    const form = new FormData();
    form.append("Tipo", tipo);
    form.append("Archivo", archivo);
    await apiClient.post(`/api/Proveedores/${id}/documentos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const itemsService = {
  async getAll(): Promise<ItemResumen[]> {
    const { data } = await apiClient.get("/api/Items");
    return data;
  },
  async getById(id: string): Promise<Item> {
    const { data } = await apiClient.get(`/api/Items/${id}`);
    return data;
  },
  async crear(cmd: CrearItemCommand): Promise<{ id: string }> {
    const { data } = await apiClient.post("/api/Items", cmd);
    return data;
  },
  async actualizar(id: string, cmd: Partial<CrearItemCommand> & { estado?: EstadoItem }): Promise<void> {
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
    return data;
  },
  async getById(id: string): Promise<Checklist> {
    const { data } = await apiClient.get(`/api/Checklists/${id}`);
    return data;
  },
  async crear(payload: Omit<Checklist, "id" | "version" | "createdAt" | "updatedAt">): Promise<{ id: string }> {
    const { data } = await apiClient.post("/api/Checklists", payload);
    return data;
  },
  async actualizarCriterios(id: string, criterios: Omit<CriterioChecklist, "id">[]): Promise<void> {
    await apiClient.put(`/api/Checklists/${id}/criterios`, { criterios });
  },
  async publicar(id: string): Promise<void> {
    await apiClient.post(`/api/Checklists/${id}/publicar`);
  },
};