import { useState, useEffect, useCallback } from "react";
import {
  lotesService,
  type LotePendiente,
  type LoteKpis,
  type LiberarLoteCommand,
  type RechazarLoteCommand,
} from "../Services/lotes.service";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface LotesState {
  lotes:       LotePendiente[];
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

/**
 * Estado y acciones para el módulo de Liberación de Lotes.
 *
 * @example
 * const {
 *   lotes, kpis, loading, error,
 *   mutatingId, mutateError,
 *   liberar, rechazar, pasarACuarentena,
 *   refresh,
 * } = useLotes();
 *
 * // Liberar lote
 * await liberar({ loteId: "lot-001", observaciones: "Sin novedad" });
 *
 * // Rechazar
 * await rechazar({ loteId: "lot-002", motivoRechazo: "T° fuera de rango",
 *   tipoRechazo: "Total", generaNoConformidad: true });
 *
 * // Cuarentena
 * await pasarACuarentena("lot-003", "Análisis microbiológico pendiente");
 */
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

      // KPIs derivados del array (no hay endpoint separado en el servicio)
      const kpis: LoteKpis = {
        pendientes:    lotes.filter(l => l.estado === "PendienteCalidad").length,
        liberadosHoy:  lotes.filter(l => l.estado === "Liberado").length,
        rechazadosHoy: lotes.filter(l => l.estado === "Rechazado").length,
        enCuarentena:  lotes.filter(l => l.estado === "Cuarentena").length,
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

  /** Marca un lote como mutando y limpia errores previos. */
  const startMutation = (loteId: string) =>
    setState(prev => ({ ...prev, mutatingId: loteId, mutateError: null }));

  /** Quita el lote de la lista localmente (actualización optimista). */
  const removeLoteLocal = (loteId: string) =>
    setState(prev => ({
      ...prev,
      mutatingId: null,
      lotes: prev.lotes.filter(l => l.id !== loteId),
    }));

  /** Actualiza el estado de un lote en la lista local. */
  const updateLoteEstado = (loteId: string, nuevoEstado: LotePendiente["estado"]) =>
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

  /**
   * Libera un lote e ingresa al inventario productivo.
   * El lote desaparece optimistamente de la lista al confirmar.
   */
  const liberar = useCallback(async (cmd: LiberarLoteCommand) => {
    startMutation(cmd.loteId);
    try {
      await lotesService.liberar(cmd);
      removeLoteLocal(cmd.loteId);
    } catch {
      handleMutateError("No se pudo liberar el lote. Intenta de nuevo.");
      throw new Error("liberar_failed");
    }
  }, []);

  /**
   * Rechaza un lote total o parcialmente.
   * Si `generaNoConformidad` es true, el backend crea la NC automáticamente.
   */
  const rechazar = useCallback(async (cmd: RechazarLoteCommand) => {
    startMutation(cmd.loteId);
    try {
      await lotesService.rechazar(cmd);
      updateLoteEstado(cmd.loteId, "Rechazado");
    } catch {
      handleMutateError("No se pudo rechazar el lote. Intenta de nuevo.");
      throw new Error("rechazar_failed");
    }
  }, []);

  /**
   * Mueve un lote a cuarentena para análisis adicional.
   */
  const pasarACuarentena = useCallback(async (loteId: string, motivo: string) => {
    startMutation(loteId);
    try {
      await lotesService.pasarACuarentena(loteId, motivo);
      updateLoteEstado(loteId, "Cuarentena");
    } catch {
      handleMutateError("No se pudo mover el lote a cuarentena. Intenta de nuevo.");
      throw new Error("cuarentena_failed");
    }
  }, []);

  /** Limpia el error de mutación manualmente (ej.: al cerrar un modal). */
  const clearMutateError = useCallback(() =>
    setState(prev => ({ ...prev, mutateError: null })), []);

  // ── Lotes filtrados por estado — atajos para la UI ─────────────────────────

  const lotesPendientes  = state.lotes.filter(l => l.estado === "PendienteCalidad");
  const lotesEnCuarentena = state.lotes.filter(l => l.estado === "Cuarentena");

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
    pasarACuarentena,
    clearMutateError,
    refresh:          fetch,
  };
}