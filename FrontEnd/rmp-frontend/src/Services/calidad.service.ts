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
}

export interface RegistrarLavadoBotasManosPayload {
  fecha: string;
  turno: string;
  piso: string;
  entrada: string;
  personasRevisadas: number;
  novedades?: string;
  observaciones?: string;
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
    form.append("PersonasRevisadas", String(payload.personasRevisadas));
    if (payload.novedades?.trim()) form.append("Novedades", payload.novedades.trim());
    if (payload.observaciones?.trim()) form.append("Observaciones", payload.observaciones.trim());
    if (fotoEvidencia) form.append("FotoEvidencia", fotoEvidencia);

    const { data } = await apiClient.post("/api/Calidad/lavado-botas-manos", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
