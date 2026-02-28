import { useState, useEffect, useCallback } from "react";
import {
  dashboardService,
  type DashboardKpis,
  type LoteVencimiento,
  type DocumentoPorVencer,
  type TemperaturaFueraRango,
} from "../Services/dashboard.service";

interface DashboardState {
  kpis: DashboardKpis | null;
  vencimientos: LoteVencimiento[];
  documentos: DocumentoPorVencer[];
  temperaturas: TemperaturaFueraRango[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseDashboardOptions {
  año?: number;
  mes?: number;
  diasUmbral?: number;
  autoRefreshMs?: number;   // 0 = sin auto-refresh
}

export function useDashboard(options: UseDashboardOptions = {}) {
  const { año, mes, diasUmbral = 30, autoRefreshMs = 0 } = options;

  const [state, setState] = useState<DashboardState>({
    kpis: null,
    vencimientos: [],
    documentos: [],
    temperaturas: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [kpis, vencimientos, documentos, temperaturas] = await Promise.all([
        dashboardService.getKpis(año, mes),
        dashboardService.getVencimientos(diasUmbral, true),
        dashboardService.getDocumentosPorVencer(diasUmbral),
        dashboardService.getTemperaturasFueraRango(24),
      ]);
      setState({
        kpis,
        vencimientos,
        documentos,
        temperaturas,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "No se pudo cargar la información del Dashboard.",
      }));
    }
  }, [año, mes, diasUmbral]);

  useEffect(() => {
    fetch();
    if (autoRefreshMs > 0) {
      const interval = setInterval(fetch, autoRefreshMs);
      return () => clearInterval(interval);
    }
  }, [fetch, autoRefreshMs]);

  return { ...state, refresh: fetch };
}