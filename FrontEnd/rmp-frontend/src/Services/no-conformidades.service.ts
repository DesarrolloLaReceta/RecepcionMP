import { apiClient } from "./apiClient";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export enum EstadoNC {
  Abierta     = 0,
  EnAnalisis  = 1,
  EnProceso   = 2,
  Cerrada     = 3,
  Anulada     = 4,
}

export enum TipoNC {
  Merma                   = 0,
  RechazoParcial          = 1,
  RechazoTotal            = 2,
  Cuarentena              = 3,
  TemperaturaFueraRango   = 4,
  RotuladoNoConforme      = 5,
  DocumentacionIncompleta = 6,
  CalidadSensorial        = 7,
  Otro                    = 8,
}

export enum PrioridadNC {
  Baja    = 0,
  Media   = 1,
  Alta    = 2,
  Critica = 3,
}

// ─── LABELS ───────────────────────────────────────────────────────────────────

export const EstadoNCLabels: Record<EstadoNC, string> = {
  [EstadoNC.Abierta]:    "Abierta",
  [EstadoNC.EnAnalisis]: "En análisis",
  [EstadoNC.EnProceso]:  "En proceso",
  [EstadoNC.Cerrada]:    "Cerrada",
  [EstadoNC.Anulada]:    "Anulada",
};

export const TipoNCLabels: Record<TipoNC, string> = {
  [TipoNC.Merma]:                   "Merma",
  [TipoNC.RechazoParcial]:          "Rechazo parcial",
  [TipoNC.RechazoTotal]:            "Rechazo total",
  [TipoNC.Cuarentena]:              "Cuarentena",
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
  id:            string;
  texto:         string;
  autorNombre:   string;
  fechaRegistro: string;
}

export interface NoConformidad {
  id:               string;
  numero:           string;
  titulo:           string;
  tipo:             TipoNC;
  prioridad:        PrioridadNC;
  estado:           EstadoNC;
  descripcion:      string;
  causalNombre:     string;
  proveedorNombre?: string;
  numeroLote?:      string;
  itemNombre?:      string;
  cantidadAfectada?: number;
  asignadoA?:       string;
  fechaLimite?:     string;
  fechaCierre?:     string;
  causaRaiz?:       string;
  observacionesCierre?: string;
  creadoEn:         string;
  creadoPorNombre:  string;
  totalAcciones:    number;
  accionesPendientes: number;
  accionesCorrectivas: AccionCorrectiva[];
  comentarios:      ComentarioNC[];
}

// ─── COMMANDS ─────────────────────────────────────────────────────────────────

export interface CrearNCCommand {
  loteRecibidoId:   string;
  titulo:           string;
  tipo:             TipoNC;
  prioridad:        PrioridadNC;
  causalId:         string;
  descripcion:      string;
  cantidadAfectada: number;
  asignadoA?:       string;
  fechaLimite?:     string;
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
  ncId:             string;
  descripcionAccion: string;
  responsableId:    string;
  fechaCompromiso:  string;
}

export interface AgregarComentarioCommand {
  ncId:  string;
  texto: string;
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

  async agregarAccion(cmd: AgregarAccionCommand): Promise<{ id: string }> {
    const { data } = await apiClient.post(
      `/api/NoConformidades/${cmd.ncId}/acciones-correctivas`,
      {
        descripcionAccion: cmd.descripcionAccion,
        responsableId:     cmd.responsableId,
        fechaCompromiso:   cmd.fechaCompromiso,
      }
    );
    return data;
  },

  async agregarComentario(cmd: AgregarComentarioCommand): Promise<{ id: string }> {
    const { data } = await apiClient.post(
      `/api/NoConformidades/${cmd.ncId}/comentarios`,
      { texto: cmd.texto }
    );
    return data;
  },

  async cerrarAccion(ncId: string, accionId: string, evidencia?: string): Promise<void> {
    await apiClient.post(
      `/api/NoConformidades/${ncId}/acciones-correctivas/${accionId}/cerrar`,
      { evidenciaUrl: evidencia }
    );
  },

  async cerrar(cmd: { ncId: string; observaciones?: string }): Promise<void> {
    await apiClient.post(`/api/NoConformidades/${cmd.ncId}/cerrar`, {
      observaciones: cmd.observaciones,
    });
  },

  async getCausales(): Promise<{ id: string; nombre: string }[]> {
    const { data } = await apiClient.get("/api/NoConformidades/causales");
    return data;
  },
};