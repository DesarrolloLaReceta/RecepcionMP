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
};
