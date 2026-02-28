import { apiClient } from "./apiClient";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export enum EstadoNC {
  Abierta      = 0,
  EnAnalisis   = 1,
  EnEjecucion  = 2,
  Cerrada      = 3,
  Anulada      = 4,
}

export enum TipoNC {
  Rechazo                 = 0,
  MermaParcial            = 1,
  TemperaturaFueraRango   = 2,
  RotuladoNoConforme      = 3,
  DocumentacionIncompleta = 4,
  CalidadSensorial        = 5,
  Otro                    = 6,
}

export enum PrioridadNC {
  Baja    = 0,
  Media   = 1,
  Alta    = 2,
  Critica = 3,
}

// ─── LABELS ───────────────────────────────────────────────────────────────────

export const EstadoNCLabels: Record<EstadoNC, string> = {
  [EstadoNC.Abierta]:     "Abierta",
  [EstadoNC.EnAnalisis]:  "En análisis",
  [EstadoNC.EnEjecucion]: "En ejecución",
  [EstadoNC.Cerrada]:     "Cerrada",
  [EstadoNC.Anulada]:     "Anulada",
};

export const TipoNCLabels: Record<TipoNC, string> = {
  [TipoNC.Rechazo]:                 "Rechazo de lote",
  [TipoNC.MermaParcial]:            "Merma parcial",
  [TipoNC.TemperaturaFueraRango]:   "Temperatura fuera de rango",
  [TipoNC.RotuladoNoConforme]:      "Rotulado no conforme",
  [TipoNC.DocumentacionIncompleta]: "Documentación incompleta",
  [TipoNC.CalidadSensorial]:        "Calidad sensorial",
  [TipoNC.Otro]:                    "Otro",
};

export const PrioridadNCLabels: Record<PrioridadNC, string> = {
  [PrioridadNC.Baja]:    "Baja",
  [PrioridadNC.Media]:   "Media",
  [PrioridadNC.Alta]:    "Alta",
  [PrioridadNC.Critica]: "Crítica",
};

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type EstadoAccion = "Pendiente" | "EnCurso" | "Completada";

export interface AccionCorrectiva {
  id:              string;
  descripcion:     string;
  responsable:     string;
  fechaCompromiso: string;
  fechaCierre?:    string;
  estado:          EstadoAccion;
  evidencia?:      string;
}

/** Entrada en el hilo de seguimiento de una NC. */
export interface ComentarioNC {
  id:             string;
  texto:          string;
  autor:          string;
  fechaRegistro:  string;   // ISO 8601
}

export interface NoConformidad {
  id:               string;
  numero:           string;
  tipo:             TipoNC;
  prioridad:        PrioridadNC;
  estado:           EstadoNC;
  titulo:           string;
  descripcion:      string;
  proveedorNombre?: string;
  loteId?:          string;
  numeroLote?:      string;
  itemNombre?:      string;
  recepcionId?:     string;
  numeroRecepcion?: string;
  cantidadAfectada?: number;
  unidadMedida?:    string;
  fechaDeteccion:   string;
  /** Fecha límite para resolver la NC — "YYYY-MM-DD" */
  fechaLimite?:     string;
  fechaCierre?:     string;
  /** Usuario que detectó / reportó la NC */
  detectadoPor:     string;
  asignadoA?:       string;
  causaRaiz?:       string;
  accionesCorrectivas: AccionCorrectiva[];
  /** Hilo de comentarios / seguimiento de la NC */
  comentarios:      ComentarioNC[];
  observacionesCierre?: string;
  notificarProveedor: boolean;
  creadoEn:         string;
  actualizadoEn?:   string;
}

// ─── COMMANDS ─────────────────────────────────────────────────────────────────

export interface CrearNCCommand {
  tipo:               TipoNC;
  prioridad:          PrioridadNC;
  titulo:             string;
  descripcion:        string;
  proveedorId?:       string;
  loteId?:            string;
  recepcionId?:       string;
  cantidadAfectada?:  number;
  unidadMedida?:      string;
  fechaLimite?:       string;
  asignadoA?:         string;
  notificarProveedor: boolean;
}

/**
 * Transición de estado de una NC.
 * `causaRaiz` es requerida por negocio al pasar a EnEjecucion.
 * `comentario` queda registrado en el hilo de seguimiento.
 */
export interface CambiarEstadoCommand {
  ncId:          string;
  nuevoEstado:   EstadoNC;
  causaRaiz?:    string;
  comentario?:   string;
}

export interface AgregarAccionCommand {
  ncId:            string;
  descripcion:     string;
  responsable:     string;
  fechaCompromiso: string;
}

export interface CerrarNCCommand {
  ncId:           string;
  observaciones?: string;
}

export interface NoConformidadesFilter {
  estado?:    EstadoNC;
  tipo?:      TipoNC;
  prioridad?: PrioridadNC;
}

// ─── SERVICIO ─────────────────────────────────────────────────────────────────

export const noConformidadesService = {
  async getAll(filter?: NoConformidadesFilter): Promise<NoConformidad[]> {
    const { data } = await apiClient.get("/api/NoConformidades", { params: filter ?? {} });
    return data;
  },

  async getById(id: string): Promise<NoConformidad> {
    const { data } = await apiClient.get(`/api/NoConformidades/${id}`);
    return data;
  },

  async crear(cmd: CrearNCCommand): Promise<{ id: string }> {
    const { data } = await apiClient.post("/api/NoConformidades", cmd);
    return data;
  },

  /**
   * Cambia el estado de una NC con causa raíz y comentario opcionales.
   * Reemplaza al antiguo actualizarEstado(id, estado, causaRaiz?).
   */
  async cambiarEstado(cmd: CambiarEstadoCommand): Promise<void> {
    await apiClient.put(`/api/NoConformidades/${cmd.ncId}/estado`, cmd);
  },

  async agregarAccion(cmd: AgregarAccionCommand): Promise<void> {
    await apiClient.post(`/api/NoConformidades/${cmd.ncId}/acciones`, cmd);
  },

  async cerrarAccion(ncId: string, accionId: string, evidencia?: string): Promise<void> {
    await apiClient.post(`/api/NoConformidades/${ncId}/acciones/${accionId}/cerrar`, { evidencia });
  },

  async cerrar(cmd: CerrarNCCommand): Promise<void> {
    await apiClient.post(`/api/NoConformidades/${cmd.ncId}/cerrar`, { observaciones: cmd.observaciones });
  },

  async agregarComentario(ncId: string, texto: string): Promise<ComentarioNC> {
    const { data } = await apiClient.post(`/api/NoConformidades/${ncId}/comentarios`, { texto });
    return data;
  },
};