import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ordenesCompraService,
  type OrdenCompraResumen,
  type OrdenCompra,
  type OrdenesCompraFilter,
  type CrearOCCommand,
  type ActualizarOCCommand,
  EstadoOC,
} from "../Services/ordenes-compra.service";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface OrdenesState {
  ordenes:   OrdenCompraResumen[];
  loading:   boolean;
  error:     string | null;
}

interface DetalleState {
  detalle:   OrdenCompra | null;
  loading:   boolean;
  error:     string | null;
}

interface MutacionState {
  saving:    boolean;
  error:     string | null;
}

export interface UseOrdenesOptions {
  /** Filtros aplicados en la carga inicial y en cada refresh */
  filter?:   OrdenesCompraFilter;
  /** Si true, carga al montar (default: true) */
  autoLoad?: boolean;
}

// ─── HOOK LISTA ───────────────────────────────────────────────────────────────

/**
 * Lista de órdenes de compra con filtros, KPIs derivados y mutaciones CRUD.
 *
 * @example
 * const {
 *   ordenes, loading, error,
 *   kpis, abiertas, vencidas,
 *   crear, cancelar, aprobar, cerrar,
 *   refresh,
 * } = useOrdenes({ filter: { soloAbiertas: true } });
 */
export function useOrdenes(options: UseOrdenesOptions = {}) {
  const { filter, autoLoad = true } = options;

  const [state, setState]     = useState<OrdenesState>({
    ordenes: [], loading: autoLoad, error: null,
  });
  const [mutacion, setMutacion] = useState<MutacionState>({
    saving: false, error: null,
  });

  // ── Carga ──────────────────────────────────────────────────────────────────

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await ordenesCompraService.getAll(filter);
      setState({ ordenes: data, loading: false, error: null });
    } catch {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "No se pudo cargar la lista de órdenes de compra.",
      }));
    }
  }, [JSON.stringify(filter)]);

  useEffect(() => {
    if (autoLoad) fetch();
  }, [fetch, autoLoad]);

  // ── KPIs derivados ─────────────────────────────────────────────────────────

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const kpis = useMemo(() => {
    const { ordenes } = state;
    return {
      total:               ordenes.length,
      abiertas:            ordenes.filter(oc => oc.estado === EstadoOC.Abierta).length,
      parcialmenteRecibidas: ordenes.filter(oc => oc.estado === EstadoOC.ParcialmenteRecibida).length,
      totalmenteRecibidas: ordenes.filter(oc => oc.estado === EstadoOC.TotalmenteRecibida).length,
      vencidas:            ordenes.filter(oc =>
        oc.fechaVencimiento &&
        new Date(oc.fechaVencimiento) < hoy &&
        oc.estado !== EstadoOC.TotalmenteRecibida &&
        oc.estado !== EstadoOC.Cancelada
      ).length,
      conCadenaFrio:       ordenes.filter(oc => oc.requiereCadenaFrio).length,
      valorTotalPendiente: ordenes
        .filter(oc => oc.estado === EstadoOC.Abierta || oc.estado === EstadoOC.ParcialmenteRecibida)
        .reduce((sum, oc) => sum + oc.valorTotal, 0),
    };
  }, [state.ordenes]);

  // ── Atajos de lista filtrada ───────────────────────────────────────────────

  const abiertas = useMemo(() =>
    state.ordenes.filter(oc =>
      oc.estado === EstadoOC.Abierta || oc.estado === EstadoOC.ParcialmenteRecibida
    ), [state.ordenes]);

  const vencidas = useMemo(() =>
    state.ordenes.filter(oc =>
      oc.fechaVencimiento &&
      new Date(oc.fechaVencimiento) < hoy &&
      oc.estado !== EstadoOC.TotalmenteRecibida &&
      oc.estado !== EstadoOC.Cancelada
    ), [state.ordenes]);

  // ── Helpers mutación ───────────────────────────────────────────────────────

  const startSave = () => setMutacion({ saving: true, error: null });
  const endSave   = () => setMutacion({ saving: false, error: null });
  const failSave  = (msg: string) => { setMutacion({ saving: false, error: msg }); };

  // ── Mutaciones ─────────────────────────────────────────────────────────────

  /**
   * Crea una nueva OC y la antepone en la lista local.
   * Retorna `{ id, numeroOC }` del registro creado.
   */
  const crear = useCallback(async (cmd: CrearOCCommand) => {
    startSave();
    try {
      const resultado = await ordenesCompraService.crear(cmd);
      await fetch(); // refresca para traer la OC completa desde el backend
      endSave();
      return resultado;
    } catch {
      failSave("No se pudo crear la orden de compra.");
      throw new Error("crear_oc_failed");
    }
  }, [fetch]);

  /**
   * Actualiza notas y fecha de entrega de una OC abierta.
   */
  const actualizar = useCallback(async (id: string, cmd: ActualizarOCCommand) => {
    startSave();
    try {
      await ordenesCompraService.actualizar(id, cmd);
      setState(prev => ({
        ...prev,
        ordenes: prev.ordenes.map(oc =>
          oc.id === id
            ? { ...oc, fechaEntregaEsperada: cmd.fechaEntregaEsperada ?? oc.fechaEntregaEsperada }
            : oc
        ),
      }));
      endSave();
    } catch {
      failSave("No se pudo actualizar la orden de compra.");
      throw new Error("actualizar_oc_failed");
    }
  }, []);

  /**
   * Aprueba la OC — la habilita para recibir mercancía.
   */
  const aprobar = useCallback(async (id: string) => {
    startSave();
    try {
      await ordenesCompraService.aprobar(id);
      // El estado visual no cambia (Abierta → sigue Abierta con aprobadoPor poblado)
      endSave();
    } catch {
      failSave("No se pudo aprobar la orden de compra.");
      throw new Error("aprobar_oc_failed");
    }
  }, []);

  /**
   * Cancela la OC con motivo obligatorio.
   * La actualiza optimistamente a Cancelada en la lista.
   */
  const cancelar = useCallback(async (id: string, motivo: string) => {
    startSave();
    try {
      await ordenesCompraService.cancelar(id, motivo);
      setState(prev => ({
        ...prev,
        ordenes: prev.ordenes.map(oc =>
          oc.id === id ? { ...oc, estado: EstadoOC.Cancelada } : oc
        ),
      }));
      endSave();
    } catch {
      failSave("No se pudo cancelar la orden de compra.");
      throw new Error("cancelar_oc_failed");
    }
  }, []);

  /**
   * Cierra administrativamente una OC totalmente recibida.
   */
  const cerrar = useCallback(async (id: string) => {
    startSave();
    try {
      await ordenesCompraService.cerrar(id);
      setState(prev => ({
        ...prev,
        ordenes: prev.ordenes.map(oc =>
          oc.id === id ? { ...oc, estado: EstadoOC.TotalmenteRecibida } : oc
        ),
      }));
      endSave();
    } catch {
      failSave("No se pudo cerrar la orden de compra.");
      throw new Error("cerrar_oc_failed");
    }
  }, []);

  const clearError = useCallback(() =>
    setMutacion(prev => ({ ...prev, error: null })), []);

  return {
    // Lista
    ordenes:   state.ordenes,
    loading:   state.loading,
    error:     state.error,
    // Derivados
    kpis,
    abiertas,
    vencidas,
    // Mutación
    saving:    mutacion.saving,
    saveError: mutacion.error,
    // Acciones
    crear,
    actualizar,
    aprobar,
    cancelar,
    cerrar,
    clearError,
    refresh:   fetch,
  };
}

// ─── HOOK DETALLE ─────────────────────────────────────────────────────────────

/**
 * Detalle completo de una OC con acciones de flujo integradas.
 * Para usar en DetalleOCPage.
 *
 * @example
 * const { oc, loading, error, aprobar, cancelar, cerrar, saving, refresh }
 *   = useOrdenDetalle(id);
 */
export function useOrdenDetalle(id: string | undefined) {
  const [state, setState] = useState<DetalleState>({
    detalle: null, loading: !!id, error: null,
  });
  const [mutacion, setMutacion] = useState<MutacionState>({
    saving: false, error: null,
  });

  const fetch = useCallback(async () => {
    if (!id) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await ordenesCompraService.getById(id);
      setState({ detalle: data, loading: false, error: null });
    } catch {
      setState(prev => ({
        ...prev, loading: false,
        error: "No se pudo cargar la orden de compra.",
      }));
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const startSave = () => setMutacion({ saving: true, error: null });
  const endSave   = () => setMutacion({ saving: false, error: null });
  const failSave  = (msg: string) => setMutacion({ saving: false, error: msg });

  const patchEstado = (nuevoEstado: EstadoOC) =>
    setState(prev => prev.detalle
      ? { ...prev, detalle: { ...prev.detalle, estado: nuevoEstado } }
      : prev
    );

  const aprobar = useCallback(async () => {
    if (!id) return;
    startSave();
    try {
      await ordenesCompraService.aprobar(id);
      endSave();
    } catch {
      failSave("No se pudo aprobar la OC."); throw new Error("aprobar_failed");
    }
  }, [id]);

  const cancelar = useCallback(async (motivo: string) => {
    if (!id) return;
    startSave();
    try {
      await ordenesCompraService.cancelar(id, motivo);
      patchEstado(EstadoOC.Cancelada);
      endSave();
    } catch {
      failSave("No se pudo cancelar la OC."); throw new Error("cancelar_failed");
    }
  }, [id]);

  const cerrar = useCallback(async () => {
    if (!id) return;
    startSave();
    try {
      await ordenesCompraService.cerrar(id);
      patchEstado(EstadoOC.TotalmenteRecibida);
      endSave();
    } catch {
      failSave("No se pudo cerrar la OC."); throw new Error("cerrar_failed");
    }
  }, [id]);

  return {
    oc:        state.detalle,
    loading:   state.loading,
    error:     state.error,
    saving:    mutacion.saving,
    saveError: mutacion.error,
    aprobar,
    cancelar,
    cerrar,
    refresh:   fetch,
  };
}