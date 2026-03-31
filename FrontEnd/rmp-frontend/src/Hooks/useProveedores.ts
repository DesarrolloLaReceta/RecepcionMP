import { useState, useEffect, useCallback, useMemo } from "react";
import {
  proveedoresService,
  itemsService,
  categoriasService,
  type ProveedorResumen,
  type Proveedor,
  type ItemResumen,
  type Categoria,
  EstadoProveedor,
  type CrearProveedorCommand,
  type ActualizarProveedorCommand,
  type CrearItemCommand,
} from "../Services/maestros.service";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface ProveedoresState {
  proveedores: ProveedorResumen[];
  loading:     boolean;
  error:       string | null;
}

interface ProveedorDetalleState {
  proveedor: Proveedor | null;
  loading:   boolean;
  error:     string | null;
}

interface ItemsState {
  items:   ItemResumen[];
  loading: boolean;
  error:   string | null;
}

interface CategoriasState {
  categorias: Categoria[];
  loading:    boolean;
}

interface MutacionState {
  saving: boolean;
  error:  string | null;
}

// ─── HOOK PROVEEDORES ─────────────────────────────────────────────────────────

/**
 * Lista de proveedores con KPIs de cumplimiento documental y acciones CRUD.
 *
 * @example
 * const {
 *   proveedores, loading, error,
 *   kpis, activos, conDocumentosVencidos,
 *   crear, actualizar,
 *   saving, saveError,
 *   refresh,
 * } = useProveedores();
 */
export function useProveedores() {
  const [state, setState]       = useState<ProveedoresState>({
    proveedores: [], loading: true, error: null,
  });
  const [mutacion, setMutacion] = useState<MutacionState>({
    saving: false, error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await proveedoresService.getAll();
      setState({ proveedores: data, loading: false, error: null });
    } catch {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "No se pudo cargar la lista de proveedores.",
      }));
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // ── KPIs derivados ─────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const { proveedores } = state;
    return {
      total:              proveedores.length,
      activos:            proveedores.filter(p => p.estado === EstadoProveedor.Activo).length,
      suspendidos:        proveedores.filter(p => p.estado === EstadoProveedor.Suspendido).length,
      conDocsVencidos:    proveedores.filter(p => p.documentosVencidos > 0).length,
      conDocsPorVencer:   proveedores.filter(p => p.documentosPorVencer > 0 && p.documentosVencidos === 0).length,
      /** Promedio de tasa de aceptación entre proveedores activos */
      tasaAceptacionMedia: (() => {
        const activos = proveedores.filter(p => p.estado === EstadoProveedor.Activo);
        if (!activos.length) return 0;
        return Math.round(activos.reduce((s, p) => s + p.tasaAceptacion, 0) / activos.length);
      })(),
    };
  }, [state.proveedores]);

  /** Proveedores activos ordenados por documentos vencidos desc */
  const activos = useMemo(() =>
    state.proveedores
      .filter(p => p.estado === EstadoProveedor.Activo)
      .sort((a, b) => b.documentosVencidos - a.documentosVencidos),
    [state.proveedores]
  );

  /** Proveedores con al menos un documento vencido */
  const conDocumentosVencidos = useMemo(() =>
    state.proveedores.filter(p => p.documentosVencidos > 0),
    [state.proveedores]
  );

  // ── Mutaciones ─────────────────────────────────────────────────────────────

  const startSave = () => setMutacion({ saving: true, error: null });
  const endSave   = () => setMutacion({ saving: false, error: null });
  const failSave  = (msg: string) => setMutacion({ saving: false, error: msg });

  /** Crea un proveedor y refresca la lista. Retorna `{ id }`. */
  const crear = useCallback(async (cmd: CrearProveedorCommand) => {
    startSave();
    try {
      const res = await proveedoresService.crear(cmd);
      await fetch();
      endSave();
      return res;
    } catch {
      failSave("No se pudo crear el proveedor.");
      throw new Error("crear_proveedor_failed");
    }
  }, [fetch]);

  /** Actualiza los datos del proveedor y refleja el cambio en la lista local. */
  const actualizar = useCallback(async (cmd: ActualizarProveedorCommand) => {
    startSave();
    try {
      await proveedoresService.actualizar(cmd);
      setState(prev => ({
        ...prev,
        proveedores: prev.proveedores.map(p =>
          p.id === cmd.id
            ? { ...p, razonSocial: cmd.razonSocial ?? p.razonSocial }
            : p
        ),
      }));
      endSave();
    } catch {
      failSave("No se pudo actualizar el proveedor.");
      throw new Error("actualizar_proveedor_failed");
    }
  }, []);

  /**
   * Sube un documento al proveedor.
   * Después del upload refresca el detalle (si aplica) pero no toda la lista.
   */
  const subirDocumento = useCallback(async (
    proveedorId: string,
    tipoDocumento: string,
    numeroDocumento: string,
    fechaExpedicion: string,
    fechaVencimiento: string,
    archivo: File
  ) => {
    startSave();
    try {
      await proveedoresService.subirDocumento(
        proveedorId, tipoDocumento, numeroDocumento,
        fechaExpedicion, fechaVencimiento, archivo
      );
      endSave();
    } catch {
      failSave("No se pudo subir el documento.");
      throw new Error("subir_doc_failed");
    }
  }, []);

  const clearError = useCallback(() =>
    setMutacion(prev => ({ ...prev, error: null })), []);

  return {
    proveedores:       state.proveedores,
    loading:           state.loading,
    error:             state.error,
    kpis,
    activos,
    conDocumentosVencidos,
    saving:            mutacion.saving,
    saveError:         mutacion.error,
    crear,
    actualizar,
    subirDocumento,
    clearError,
    refresh:           fetch,
  };
}

// ─── HOOK DETALLE PROVEEDOR ───────────────────────────────────────────────────

/**
 * Detalle completo de un proveedor (con documentos y histórico).
 * Para usar en el panel lateral de ProveedoresPage.
 *
 * @example
 * const { proveedor, loading, error, refresh } = useProveedorDetalle(selectedId);
 */
export function useProveedorDetalle(id: string | null | undefined) {
  const [state, setState] = useState<ProveedorDetalleState>({
    proveedor: null, loading: false, error: null,
  });

  const fetch = useCallback(async () => {
    if (!id) { setState({ proveedor: null, loading: false, error: null }); return; }
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await proveedoresService.getById(id);
      setState({ proveedor: data, loading: false, error: null });
    } catch {
      setState(prev => ({
        ...prev, loading: false,
        error: "No se pudo cargar el detalle del proveedor.",
      }));
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { proveedor: state.proveedor, loading: state.loading, error: state.error, refresh: fetch };
}

// ─── HOOK ÍTEMS ───────────────────────────────────────────────────────────────

/**
 * Catálogo de ítems/materias primas con KPIs y CRUD.
 *
 * @example
 * const {
 *   items, loading, error,
 *   kpis, requierenFrio,
 *   crear, actualizar,
 *   refresh,
 * } = useItems();
 */
export function useItems() {
  const [state, setState]       = useState<ItemsState>({
    items: [], loading: true, error: null,
  });
  const [mutacion, setMutacion] = useState<MutacionState>({
    saving: false, error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await itemsService.getAll();
      setState({ items: data, loading: false, error: null });
    } catch {
      setState(prev => ({
        ...prev, loading: false,
        error: "No se pudo cargar el catálogo de ítems.",
      }));
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // ── KPIs ───────────────────────────────────────────────────────────────────

  const kpis = useMemo(() => ({
    total:         state.items.length,
    activos:       state.items.filter(i => i.estado === true).length,
    conCadenaFrio: state.items.filter(i => i.requiereCadenaFrio).length,
    sinCadenaFrio: state.items.filter(i => !i.requiereCadenaFrio).length,
  }), [state.items]);

  /** Ítems que requieren cadena de frío */
  const requierenFrio = useMemo(() =>
    state.items.filter(i => i.requiereCadenaFrio),
    [state.items]
  );

  // ── Mutaciones ─────────────────────────────────────────────────────────────

  const startSave = () => setMutacion({ saving: true, error: null });
  const endSave   = () => setMutacion({ saving: false, error: null });
  const failSave  = (msg: string) => setMutacion({ saving: false, error: msg });

  /** Crea un ítem y refresca el catálogo. Retorna `{ id }`. */
  const crear = useCallback(async (cmd: CrearItemCommand) => {
    startSave();
    try {
      const res = await itemsService.crear(cmd);
      await fetch();
      endSave();
      return res;
    } catch {
      failSave("No se pudo crear el ítem.");
      throw new Error("crear_item_failed");
    }
  }, [fetch]);

  /** Actualiza campos de un ítem y lo refleja en la lista local. */
  const actualizar = useCallback(async (
    id: string, cmd: Partial<CrearItemCommand> & { estado?: boolean }
  ) => {
    startSave();
    try {
      await itemsService.actualizar(id, cmd);
      setState(prev => ({
        ...prev,
        items: prev.items.map(i =>
          i.id === id
            ? {
                ...i,
                nombre:            cmd.nombre          ?? i.nombre,
                categoriaId:       cmd.categoriaId      ?? i.categoriaId,
                unidadMedida:      cmd.unidadMedida     ?? i.unidadMedida,
                estado:            cmd.estado           ?? i.estado,
                requiereCadenaFrio: cmd.requiereCadenaFrio ?? i.requiereCadenaFrio,
                temperaturaMinima: cmd.temperaturaMinima ?? i.temperaturaMinima,
                temperaturaMaxima: cmd.temperaturaMaxima ?? i.temperaturaMaxima,
              }
            : i
        ),
      }));
      endSave();
    } catch {
      failSave("No se pudo actualizar el ítem.");
      throw new Error("actualizar_item_failed");
    }
  }, []);

  const clearError = useCallback(() =>
    setMutacion(prev => ({ ...prev, error: null })), []);

  return {
    items:         state.items,
    loading:       state.loading,
    error:         state.error,
    kpis,
    requierenFrio,
    saving:        mutacion.saving,
    saveError:     mutacion.error,
    crear,
    actualizar,
    clearError,
    refresh:       fetch,
  };
}

// ─── HOOK CATEGORÍAS ──────────────────────────────────────────────────────────

/**
 * Catálogo de categorías — usado como dato maestro en selects de Ítems y Checklists.
 * Se cachea en una variable de módulo para no recargar entre renders.
 *
 * @example
 * const { categorias, loading } = useCategorias();
 * // En SelectField:
 * <SelectField
 *   options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
 * />
 */

let _categoriasCache: Categoria[] | null = null;

export function useCategorias() {
  const [state, setState] = useState<CategoriasState>({
    categorias: _categoriasCache ?? [],
    loading:    !_categoriasCache,
  });

  const fetch = useCallback(async () => {
    if (_categoriasCache) {
      setState({ categorias: _categoriasCache, loading: false });
      return;
    }
    setState(prev => ({ ...prev, loading: true }));
    try {
      const data = await categoriasService.getAll();
      _categoriasCache = data;
      setState({ categorias: data, loading: false });
    } catch {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  /** Limpia el caché (útil en tests o tras cambios de configuración). */
  const invalidarCache = useCallback(() => {
    _categoriasCache = null;
    fetch();
  }, [fetch]);

  return { categorias: state.categorias, loading: state.loading, invalidarCache };
}