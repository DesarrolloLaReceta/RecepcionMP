import { apiClient } from "./apiClient";

export interface VerificacionFilaPayload {
  item: string;
  calificacion: 1 | 2;
  hallazgos: string;
  planAccion: string;
}

export interface VerificacionSeccionPayload {
  seccion: string;
  filas: VerificacionFilaPayload[];
  cumplimiento: number;
}

export interface GuardarVerificacionPayload {
  zona: string;
  cumplimientoTotal: number;
  secciones: VerificacionSeccionPayload[];
  observacionesGenerales?: string;
  nombreResponsable: string;
  cargoResponsable: string;
}

export interface RegistrarLavadoBotasManosPayload {
  fecha: string;
  turno: string;
  piso: string;
  entrada: string;
  personasRevisadas: number;
  novedades?: string;
  observaciones?: string;
  nombreResponsable: string;
  cargoResponsable: string;
}

export interface RegistrarLiberacionCocinaPayload {
  fecha: string;
  turno: string;
  cocina: string;
  observacionesInspeccion: string;
  nombreResponsable: string;
  cargoResponsable: string;
  observacionesGenerales: string;
  inspeccion: {
    item: string;
    estado: string;
  }[];
}

// ─── DTOs Dashboard de Calidad ─────────────────────────────────────────────

export interface NovedadRecienteDto {
  titulo: string;
  fecha: string;
  responsable: string;
  tipoFormulario: string;
}

export interface DashboardCalidadDto {
  inspeccionesHoy: number;
  porcentajeCumplimiento: number;
  alertasCriticas: number;
  turnosPendientes: number;
  historialNovedades: NovedadRecienteDto[];
}

export interface LiberacionCocinaHistorialItem {
  id: number;
  fecha: string;
  cocina: string;
  nombreResponsable: string;
  tieneFallas: boolean;
}

export interface LiberacionCocinaDetalleInspeccion {
  item: string;
  estado: string;
}

export interface LiberacionCocinaDetalle {
  id: number;
  fecha: string;
  turno: string;
  cocina: string;
  nombreResponsable: string;
  cargoResponsable: string;
  observacionesInspeccion: string;
  observacionesGenerales: string;
  detalles: LiberacionCocinaDetalleInspeccion[];
}

export const calidadService = {
  async guardarVerificacionInstalaciones(
    payload: GuardarVerificacionPayload,
    fotos: File[]
  ): Promise<{ id: string }> {
    const form = new FormData();
    form.append("Zona", payload.zona);
    form.append("CumplimientoTotal", String(payload.cumplimientoTotal));
    form.append("DataJson", JSON.stringify(payload));

    if (payload.observacionesGenerales?.trim()) {
      form.append("ObservacionesGenerales", payload.observacionesGenerales.trim());
    }

    fotos.forEach((foto) => {
      form.append("Fotos", foto);
    });

    const { data } = await apiClient.post("/api/Calidad/verificacion-instalaciones", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  async registrarLavadoBotasManos(
    payload: RegistrarLavadoBotasManosPayload,
    fotoEvidencia: File | null
  ): Promise<{ id: string }> {
    const form = new FormData();
    form.append("Fecha", payload.fecha);
    form.append("Turno", payload.turno);
    form.append("Piso", payload.piso);
    form.append("Entrada", payload.entrada);
    form.append("NombreResponsable", payload.nombreResponsable);
    form.append("CargoResponsable", payload.cargoResponsable);
    form.append("PersonasRevisadas", String(payload.personasRevisadas));
    if (payload.novedades?.trim()) form.append("Novedades", payload.novedades.trim());
    if (payload.observaciones?.trim()) form.append("Observaciones", payload.observaciones.trim());
    if (fotoEvidencia) form.append("FotoEvidencia", fotoEvidencia);

    const { data } = await apiClient.post("/api/Calidad/lavado-botas-manos", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async registrarLiberacionCocina(
    payload: RegistrarLiberacionCocinaPayload
  ): Promise<{ id: string }> {
    // Al enviar el objeto directo, axios lo manda como application/json por defecto
    const { data } = await apiClient.post("/api/Calidad/liberacion-cocinas", payload);
    return data;
  },

  async getDashboardStats(): Promise<DashboardCalidadDto> {
    const { data } = await apiClient.get<DashboardCalidadDto>("/api/Calidad/stats");
    return data;
  },

  async getLiberacionesCocinasHistorial(): Promise<LiberacionCocinaHistorialItem[]> {
    const { data } = await apiClient.get<LiberacionCocinaHistorialItem[]>(
      "/api/Calidad/liberacion-cocinas"
    );
    return data;
  },

  async getLiberacionCocinaById(id: number): Promise<LiberacionCocinaDetalle> {
    const { data } = await apiClient.get<LiberacionCocinaDetalle>(
      `/api/Calidad/liberacion-cocinas/${id}`
    );
    return data;
  },
};
