import { useState, useEffect, useCallback } from "react";
import {
  lotesService,
  type LotePendienteDto,
} from "../Services/lotes.service";
import type { LiberarLoteCommand, RechazarLoteCommand } from "../Types";

// ─── TIPOS LOCALES ────────────────────────────────────────────────────────────

interface LoteKpis {
  pendientes: number;
  liberadosHoy: number;
  rechazadosHoy: number;
  enCuarentena: number;
}

interface LotesState {
  lotes:       LotePendienteDto[];
  kpis:        LoteKpis;
  loading:     boolean;
  error:       string | null;
  /** ID del lote cuya mutación está en curso (liberar/rechazar/cuarentena) */
  mutatingId:  string | null;
  mutateError: string | null;
}

interface UseLotesOptions {
  /** Si true, carga al montar automáticamente (default: true) */
  autoLoad?: boolean;
}

const KPIS_DEFAULT: LoteKpis = {
  pendientes:    0,
  liberadosHoy:  0,
  rechazadosHoy: 0,
  enCuarentena:  0,
};

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useLotes(options: UseLotesOptions = {}) {
  const { autoLoad = true } = options;

  const [state, setState] = useState<LotesState>({
    lotes:       [],
    kpis:        KPIS_DEFAULT,
    loading:     autoLoad,
    error:       null,
    mutatingId:  null,
    mutateError: null,
  });

  // ── Carga ──────────────────────────────────────────────────────────────────

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const lotes = await lotesService.getPendientes();

      const kpis: LoteKpis = {
        pendientes:    lotes.filter(l => l.estado === "PendienteCalidad").length,
        liberadosHoy:  lotes.filter(l => l.estado === "Liberado").length,
        rechazadosHoy: lotes.filter(l => l.estado === "RechazadoTotal" || l.estado === "RechazadoParcial").length,
        enCuarentena:  lotes.filter(l => l.estado === "EnCuarentena").length,
      };

      setState(prev => ({ ...prev, lotes, kpis, loading: false }));
    } catch {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "No se pudo cargar la lista de lotes pendientes.",
      }));
    }
  }, []);

  useEffect(() => {
    if (autoLoad) fetch();
  }, [fetch, autoLoad]);

  // ── Helpers de mutación ────────────────────────────────────────────────────

  const startMutation = (loteId: string) =>
    setState(prev => ({ ...prev, mutatingId: loteId, mutateError: null }));

  const removeLoteLocal = (loteId: string) =>
    setState(prev => ({
      ...prev,
      mutatingId: null,
      lotes: prev.lotes.filter(l => l.id !== loteId),
    }));

  const updateLoteEstado = (loteId: string, nuevoEstado: LotePendienteDto["estado"]) =>
    setState(prev => ({
      ...prev,
      mutatingId: null,
      lotes: prev.lotes.map(l =>
        l.id === loteId ? { ...l, estado: nuevoEstado } : l
      ),
    }));

  const handleMutateError = (msg: string) =>
    setState(prev => ({ ...prev, mutatingId: null, mutateError: msg }));

  // ── Acciones ───────────────────────────────────────────────────────────────

  const liberar = useCallback(async (cmd: LiberarLoteCommand) => {
    const loteId = cmd.loteId;
    if (!loteId) {
      handleMutateError("No se especificó el ID del lote.");
      throw new Error("missing_lote_id");
    }
    startMutation(loteId);
    try {
      await lotesService.liberar({ ...cmd, loteId });
      removeLoteLocal(loteId);
    } catch {
      handleMutateError("No se pudo liberar el lote. Intenta de nuevo.");
      throw new Error("liberar_failed");
    }
  }, []);

  const rechazar = useCallback(async (cmd: RechazarLoteCommand) => {
    const loteId = cmd.loteId;
    if (!loteId) {
      handleMutateError("No se especificó el ID del lote.");
      throw new Error("missing_lote_id");
    }
    startMutation(loteId);
    try {
      await lotesService.rechazar({ ...cmd, loteId });
      // El lote puede quedar como "RechazadoTotal" o "RechazadoParcial"
      updateLoteEstado(loteId, "RechazadoTotal"); // o "RechazadoParcial" según corresponda
    } catch {
      handleMutateError("No se pudo rechazar el lote. Intenta de nuevo.");
      throw new Error("rechazar_failed");
    }
  }, []);

  const ponerEnCuarentena = useCallback(async (loteId: string, motivo: string) => {
    if (!loteId) {
      handleMutateError("No se especificó el ID del lote.");
      throw new Error("missing_lote_id");
    }
    startMutation(loteId);
    try {
      await lotesService.ponerEnCuarentena({ loteId, motivo });
      updateLoteEstado(loteId, "EnCuarentena");
    } catch {
      handleMutateError("No se pudo mover el lote a cuarentena. Intenta de nuevo.");
      throw new Error("cuarentena_failed");
    }
  }, []);

  const clearMutateError = useCallback(() =>
    setState(prev => ({ ...prev, mutateError: null })), []);

  // ── Lotes filtrados por estado — atajos para la UI ─────────────────────────

  const lotesPendientes  = state.lotes.filter(l => l.estado === "PendienteCalidad");
  const lotesEnCuarentena = state.lotes.filter(l => l.estado === "EnCuarentena");

  return {
    // Estado
    lotes:            state.lotes,
    lotesPendientes,
    lotesEnCuarentena,
    kpis:             state.kpis,
    loading:          state.loading,
    error:            state.error,
    mutatingId:       state.mutatingId,
    mutateError:      state.mutateError,

    // Acciones
    liberar,
    rechazar,
    ponerEnCuarentena,
    clearMutateError,
    refresh:          fetch,
  };
}