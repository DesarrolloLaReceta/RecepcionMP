import { apiClient } from "./apiClient";

// ─── TIPOS DE RESPUESTA ───────────────────────────────────────────────────────

export interface DashboardKpis {
  totalRecepciones: number;
  recepcionesAceptadas: number;
  recepcionesRechazadas: number;
  recepcionesCuarentena: number;
  recepcionesPendienteCalidad: number;
  totalLotes: number;
  lotesLiberados: number;
  lotesRechazados: number;
  lotesCuarentena: number;
  lotesPendientes: number;
  tasaAceptacion: number;        // %
  tasaRechazo: number;           // %
  proveedoresActivos: number;
  noConformidadesAbiertas: number;
}

export interface LoteVencimiento {
  loteId: string;
  numeroLote: string;
  itemNombre: string;
  proveedorNombre: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estado: string;
}

export interface DocumentoPorVencer {
  entidad: string;              // "Proveedor" | "Lote"
  entidadNombre: string;
  tipoDocumento: string;
  fechaVencimiento: string;
  diasRestantes: number;
}

export interface TemperaturaFueraRango {
  loteId: string;
  itemNombre: string;
  recepcionId: string;
  temperatura: number;
  temperaturaMinima: number;
  temperaturaMaxima: number;
  fechaRegistro: string;
  origen: string;
}

// ─── SERVICIO ─────────────────────────────────────────────────────────────────

export const dashboardService = {
  async getKpis(año?: number, mes?: number): Promise<DashboardKpis> {
    const params: Record<string, number> = {};
    if (año) params.año = año;
    if (mes) params.mes = mes;
    const { data } = await apiClient.get("/api/Dashboard/kpis", { params });
    return data;
  },

  async getVencimientos(
    diasUmbral = 30,
    incluirVencidos = true
  ): Promise<LoteVencimiento[]> {
    const { data } = await apiClient.get("/api/Dashboard/vencimientos", {
      params: { diasUmbral, incluirVencidos },
    });
    return data;
  },

  async getDocumentosPorVencer(diasUmbral = 30): Promise<DocumentoPorVencer[]> {
    const { data } = await apiClient.get("/api/Dashboard/documentos-por-vencer", {
      params: { diasUmbral },
    });
    return data;
  },

  async getTemperaturasFueraRango(
    ultimasHoras = 24,
    recepcionId?: string
  ): Promise<TemperaturaFueraRango[]> {
    const params: Record<string, unknown> = { ultimasHoras };
    if (recepcionId) params.recepcionId = recepcionId;
    const { data } = await apiClient.get("/api/Dashboard/temperaturas-fuera-rango", {
      params,
    });
    return data;
  },
};