import { useState, useCallback, useEffect } from "react";
import {
  itemsService, categoriasService,
  type ItemResumen, type Item, type Categoria,
  type CrearItemCommand,
} from "../../Services/maestros.service";
import { Button, Modal, ModalFooter } from "../../Components/UI/Index";
import { TextField, SelectField, NumberField, TextAreaField } from "../../Components/Forms/Index";
import { formatTempRange } from "../../Utils/formatters";
import { MOCK_ITEMS_LIST, MOCK_ITEM_DETALLE, MOCK_CATEGORIAS } from "./MockData";
import "./StylesMaestros/MaestrosLayout.css";
import "./StylesMaestros/ItemsPage.css";

const isMock = import.meta.env.VITE_USE_MOCK === "true";

// ─── COLORES CATEGORÍA ────────────────────────────────────────────────────────

const COLORES_CATEGORIA: Record<string, string> = {
  "Cárnicos":        "#FCA5A5",
  "Lácteos":         "#93C5FD",
  "Secos":           "#FCD34D",
  "Frutas/Verduras": "#86EFAC",
  "Congelados":      "#C4B5FD",
};

// ─── TIPOS DE DOCUMENTO ───────────────────────────────────────────────────────

const TIPO_DOCUMENTO_LABELS: Record<number, string> = {
  0: "Factura",
  1: "Orden de Compra",
  2: "Certificado de Análisis (COA)",
  3: "Registro INVIMA",
  4: "Certificado de Transporte",
  5: "Bitácora de Temperatura",
  6: "Rotulado",
  7: "Otro",
};

function colorCategoria(nombre: string): string {
  return COLORES_CATEGORIA[nombre] ?? "#94A3B8";
}

// ─── FILA ÍTEM ────────────────────────────────────────────────────────────────

function ItemRow({
  item, active, onClick,
}: {
  item: ItemResumen;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="ms-row"
      data-active={active}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}
    >
      <div className="it-row-inner">
        <span className="it-codigo">{item.codigo}</span>
        <div className="it-row-info">
          <p className="it-nombre">{item.nombre}</p>
          <div className="it-meta">
            <span className="it-cat" style={{ color: colorCategoria(item.categoriaNombre) }}>
              {item.categoriaNombre}
            </span>
            {item.requiereCadenaFrio && (
              <>
                <svg className="it-frio-icon" width="10" height="10" viewBox="0 0 24 24"
                  fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" aria-label="Cadena de frío">
                  <path d="M12 2v20M12 2l-4 4M12 2l4 4M4.93 7.07l14.14 9.9M4.93 7.07L3 11M4.93 7.07l4 .93M19.07 7.07L21 11M19.07 7.07l-4 .93M4.93 16.93l14.14-9.9M4.93 16.93L3 13M4.93 16.93l4-.93M19.07 16.93L21 13M19.07 16.93l-4-.93" />
                </svg>
                {item.temperaturaMinima != null && item.temperaturaMaxima != null && (
                  <span className="it-temp-range">
                    {formatTempRange(item.temperaturaMinima, item.temperaturaMaxima)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <span style={{
          fontSize: "0.65rem", padding: "0.2rem 0.5rem",
          borderRadius: "9999px",
          background: item.estado ? "rgba(134,239,172,0.15)" : "rgba(148,163,184,0.15)",
          color: item.estado ? "#86EFAC" : "#94A3B8",
        }}>
          {item.estado ? "Activo" : "Inactivo"}
        </span>
      </div>
    </div>
  );
}

// ─── PANEL DETALLE ────────────────────────────────────────────────────────────

function PanelDetalle({
  item, categorias, onClose, onActualizado,
}: {
  item: Item;
  categorias: Categoria[];
  onClose: () => void;
  onActualizado: () => void;
}) {
  const [tab, setTab]           = useState<"info" | "docs">("info");
  const [editando, setEditando] = useState(false);
  const [saving, setSaving]     = useState(false);

  const [form, setForm] = useState({
    codigoInterno:      item.codigo,
    nombre:             item.nombre,
    descripcion:        item.descripcion ?? "",
    categoriaId:        item.categoriaId ?? "",
    unidadMedida:       item.unidadMedida,
    vidaUtilDias:       item.vidaUtilDias,
    temperaturaMinima:  item.temperaturaMinima,
    temperaturaMaxima:  item.temperaturaMaxima,
    criteriosAceptacion:item.criteriosAceptacion ?? "",
    requiereCadenaFrio: item.requiereCadenaFrio,
    estado:             item.estado,
  });

  console.log("item.categoriaId:", item.categoriaId);

  const upd = (k: keyof typeof form, v: unknown) =>
    setForm(p => ({ ...p, [k]: v }));

  const guardar = async () => {
    setSaving(true);
    try {
      await itemsService.actualizar(item.id, {
        codigoInterno:       form.codigoInterno,
        categoriaId:         form.categoriaId,
        nombre:              form.nombre,
        descripcion:         form.descripcion || undefined,
        unidadMedida:        form.unidadMedida,
        vidaUtilDias:        form.vidaUtilDias,
        temperaturaMinima:   form.requiereCadenaFrio ? form.temperaturaMinima : undefined,
        temperaturaMaxima:   form.requiereCadenaFrio ? form.temperaturaMaxima : undefined,
        criteriosAceptacion: form.criteriosAceptacion || undefined,
        estado:              form.estado,
      });
      setEditando(false);
      onActualizado();
    } catch (error: any) {
      alert(error.response?.data?.detail ?? "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = async () => {
    setSaving(true);
    try {
      await itemsService.actualizar(item.id, {
        codigoInterno:       form.codigoInterno,
        categoriaId:         form.categoriaId,
        nombre:              form.nombre,
        descripcion:         form.descripcion || undefined,
        unidadMedida:        form.unidadMedida,
        vidaUtilDias:        form.vidaUtilDias,
        temperaturaMinima:   form.requiereCadenaFrio ? form.temperaturaMinima : undefined,
        temperaturaMaxima:   form.requiereCadenaFrio ? form.temperaturaMaxima : undefined,
        criteriosAceptacion: form.criteriosAceptacion || undefined,
        estado:              !item.estado,   // ← solo este cambia
      });
      onActualizado();
    } catch (error: any) {
      alert(error.response?.data?.detail ?? "Error al cambiar estado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="it-panel-header">
        <div>
          <p className="it-panel-nombre">{item.nombre}</p>
          <p className="it-panel-codigo">{item.codigo} · {item.categoriaNombre}</p>
          <div style={{ marginTop: "0.375rem" }}>
            <span style={{
              fontSize: "0.7rem", padding: "0.25rem 0.625rem",
              borderRadius: "9999px",
              background: item.estado ? "rgba(134,239,172,0.15)" : "rgba(148,163,184,0.15)",
              color: item.estado ? "#86EFAC" : "#94A3B8",
            }}>
              {item.estado ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {!editando && (
            <>
              <button
                onClick={() => setEditando(true)}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem", borderRadius: "6px",
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        color: "var(--text-secondary)", cursor: "pointer" }}
              >
                Editar
              </button>
              <button
                onClick={toggleEstado}
                disabled={saving}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem", borderRadius: "6px",
                        background: item.estado ? "rgba(239,68,68,0.08)" : "rgba(134,239,172,0.08)",
                        border: `1px solid ${item.estado ? "rgba(239,68,68,0.3)" : "rgba(134,239,172,0.3)"}`,
                        color: item.estado ? "#FCA5A5" : "#86EFAC", cursor: "pointer" }}
              >
                {item.estado ? "Inactivar" : "Activar"}
              </button>
            </>
          )}
          <button className="it-panel-close" onClick={onClose} aria-label="Cerrar panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button className="it-panel-close" onClick={onClose} aria-label="Cerrar panel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="ms-tabs" style={{ marginTop: "0.75rem" }}>
        {([
          { key: "info", label: "Información" },
          { key: "docs", label: `Docs requeridos (${item.documentosRequeridos?.length ?? 0})` },
        ] as const).map(t => (
          <button key={t.key} className="ms-tab" data-active={tab === t.key}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="ms-panel-body">
        {tab === "info" && editando && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <TextField label="Código interno" required
                value={form.codigoInterno}
                onChange={e => upd("codigoInterno", e.target.value)} />
              <TextField label="Nombre" required
                value={form.nombre}
                onChange={e => upd("nombre", e.target.value)} />
            </div>

            <div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                Categoría
              </p>
              <select value={form.categoriaId}
                onChange={e => {
                  const cat = categorias.find(c => c.id === e.target.value);
                  upd("categoriaId", e.target.value);
                  upd("requiereCadenaFrio", cat?.requiereCadenaFrio ?? false);
                  if (!cat?.requiereCadenaFrio) {
                    upd("temperaturaMinima", undefined);
                    upd("temperaturaMaxima", undefined);
                  }
                }}
                className="ms-select" style={{ width: "100%" }}>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <TextField label="Unidad de medida"
                value={form.unidadMedida}
                onChange={e => upd("unidadMedida", e.target.value)} />
              <NumberField label="Vida útil (días)" min={1}
                value={form.vidaUtilDias}
                onChange={e => upd("vidaUtilDias", Number(e.target.value))} />
            </div>

            {form.requiereCadenaFrio && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <NumberField label="T° mínima (°C)"
                  value={form.temperaturaMinima ?? ""}
                  onChange={e => upd("temperaturaMinima", e.target.value ? Number(e.target.value) : undefined)} />
                <NumberField label="T° máxima (°C)"
                  value={form.temperaturaMaxima ?? ""}
                  onChange={e => upd("temperaturaMaxima", e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            )}

            <TextField label="Descripción"
              value={form.descripcion}
              onChange={e => upd("descripcion", e.target.value)} />

            <TextAreaField label="Criterios de aceptación / rechazo" rows={3}
              value={form.criteriosAceptacion}
              onChange={e => upd("criteriosAceptacion", e.target.value)} />

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <button onClick={() => setEditando(false)}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "6px",
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        color: "var(--text-secondary)", cursor: "pointer", fontSize: "var(--text-sm)" }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={saving || !form.nombre.trim() || !form.codigoInterno.trim()}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "6px",
                        background: "var(--primary)", border: "none",
                        color: "#fff", cursor: "pointer", fontSize: "var(--text-sm)",
                        opacity: saving ? 0.7 : 1 }}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {tab === "docs" && (
          <>
            {(item.documentosRequeridos?.length ?? 0) === 0 ? (
              <p style={{ fontSize: "var(--text-md)", color: "var(--text-tertiary)" }}>Sin documentos configurados.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {item.documentosRequeridos?.map(doc => (
                  <div key={doc.tipoDocumento} className="it-doc-row">
                    <span
                      className="it-doc-dot"
                      style={{ background: doc.obligatorio ? "#F59E0B" : "#334155" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="it-doc-nombre">
                        {TIPO_DOCUMENTO_LABELS[doc.tipoDocumento] ?? `Tipo ${doc.tipoDocumento}`}
                      </span>
                      {doc.descripcion && (
                        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>
                          {doc.descripcion}
                        </p>
                      )}
                    </div>
                    <span
                      className="it-doc-badge"
                      style={{
                        background: doc.obligatorio ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                        color: doc.obligatorio ? "#F59E0B" : "#475569",
                      }}
                    >
                      {doc.obligatorio ? "Obligatorio" : "Opcional"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── MODAL NUEVO ÍTEM ─────────────────────────────────────────────────────────

function ModalNuevoItem({
  categorias, onClose, onCreado,
}: {
  categorias: Categoria[];
  onClose: () => void;
  onCreado: (item: ItemResumen) => void;
}) {
  const [form, setForm] = useState<Partial<CrearItemCommand>>({
    requiereCadenaFrio: false, unidadMedida: "Kg",
  });
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof CrearItemCommand, v: unknown) =>
    setForm(p => ({ ...p, [k]: v }));
  const valid = form.codigoInterno?.trim() && form.nombre?.trim() && form.categoriaId;

  const crear = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const cat = categorias.find(c => c.id === form.categoriaId);
      
      let realId = `item-${Date.now()}`;
      if (!isMock) {
        const result = await itemsService.crear(form as CrearItemCommand);
        realId = result.id;
      } else {
        await new Promise(r => setTimeout(r, 700));
      }

      onCreado({
        id: realId,
        codigo: form.codigoInterno!,
        nombre: form.nombre!,
        categoriaId: form.categoriaId!,
        categoriaNombre: cat?.nombre ?? "",
        unidadMedida: form.unidadMedida ?? "Kg",
        estado: true,
        requiereCadenaFrio: form.requiereCadenaFrio ?? false,
        temperaturaMinima: form.temperaturaMinima,
        temperaturaMaxima: form.temperaturaMaxima,
        totalLotesRecibidos: 0,
      });
    } catch (error: any) {
      console.log("Errores:", JSON.stringify(error.response?.data, null, 2));
    } finally {
      setSaving(false);
    }
  };

  const catOptions = categorias.map(c => ({ value: c.id, label: c.nombre }));
  const umOptions  = ["Kg", "g", "L", "mL", "Unidad", "Caja"].map(v => ({ value: v, label: v }));

  return (
    <Modal
      open
      onClose={onClose}
      title="Nuevo ítem / materia prima"
      icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={crear}
          loading={saving}
          disabled={!valid}
          confirmLabel="Crear ítem"
        />
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <TextField
          label="Código"
          required
          placeholder="CAR-001"
          value={form.codigoInterno ?? ""}
          onChange={e => upd("codigoInterno", e.target.value)}
        />
        <TextField
          label="Nombre"
          required
          placeholder="Pechuga de pollo"
          value={form.nombre ?? ""}
          onChange={e => upd("nombre", e.target.value)}
        />
        <SelectField
          label="Categoría"
          required
          placeholder="Selecciona categoría"
          options={catOptions}
          value={form.categoriaId ?? ""}
          onChange={e => {
            const cat = categorias.find(c => c.id === e.target.value);
            upd("categoriaId", e.target.value);
            upd("requiereCadenaFrio", cat?.requiereCadenaFrio ?? false);
            upd("vidaUtilDias", cat?.vidaUtilMinimaDias ?? undefined);
            // Si la categoría no requiere frío, limpia las temperaturas
            if (!cat?.requiereCadenaFrio) {
              upd("temperaturaMinima", undefined);
              upd("temperaturaMaxima", undefined);
            } else {
              // Pre-rellena con el rango de la categoría si está disponible
              upd("temperaturaMinima", cat.rangoTemperaturaMinima ?? undefined);
              upd("temperaturaMaxima", cat.rangoTemperaturaMaxima ?? undefined);
            }
          }}
        />
        {form.categoriaId && (
          <span style={{
            display: "inline-block",
            width: "8px", height: "8px",
            borderRadius: "50%",
            marginTop: "1.25rem", // compensa la altura del label
            background: colorCategoria(
              categorias.find(c => c.id === form.categoriaId)?.nombre ?? ""
            ),
            flexShrink: 0,
          }} />
        )}
        <SelectField
          label="Unidad de medida"
          options={umOptions}
          value={form.unidadMedida ?? "Kg"}
          onChange={e => upd("unidadMedida", e.target.value)}
        />
        <NumberField
          label="Vida útil mínima (días)"
          placeholder="7"
          min={1}
          value={form.vidaUtilDias ?? ""}
          onChange={e => upd("vidaUtilDias", e.target.value ? Number(e.target.value) : undefined)}
        />
        {/* Toggle cadena de frío */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label className="field-label">Cadena de frío</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.375rem" }}>
            <button
              type="button"
              onClick={() => upd("requiereCadenaFrio", !form.requiereCadenaFrio)}
              style={{
                width: "2.25rem", height: "1.25rem",
                borderRadius: "var(--radius-full)",
                background: form.requiereCadenaFrio ? "#F59E0B" : "rgba(255,255,255,0.08)",
                border: "none", cursor: "pointer", position: "relative",
                transition: "background 0.2s",
              }}
              aria-pressed={form.requiereCadenaFrio}
              aria-label="Requiere cadena de frío"
            >
              <span style={{
                position: "absolute", top: "0.125rem",
                width: "1rem", height: "1rem",
                borderRadius: "var(--radius-full)",
                background: "#fff",
                left: form.requiereCadenaFrio ? "1.125rem" : "0.125rem",
                transition: "left 0.2s",
              }} />
            </button>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              {form.requiereCadenaFrio ? "Requiere" : "No requiere"}
            </span>
          </div>
        </div>

        {form.requiereCadenaFrio && (
          <>
            <NumberField
              label="T° mínima (°C)"
              placeholder="0"
              value={form.temperaturaMinima ?? ""}
              onChange={e => upd("temperaturaMinima", e.target.value ? Number(e.target.value) : undefined)}
            />
            <NumberField
              label="T° máxima (°C)"
              placeholder="4"
              value={form.temperaturaMaxima ?? ""}
              onChange={e => upd("temperaturaMaxima", e.target.value ? Number(e.target.value) : undefined)}
            />
          </>
        )}

        <div style={{ gridColumn: "1 / -1" }}>
          <TextAreaField
            label="Criterios de aceptación / rechazo"
            placeholder="Color, olor, temperatura, rotulado…"
            rows={3}
            value={form.criteriosAceptacion ?? ""}
            onChange={e => upd("criteriosAceptacion", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function ItemsPage() {
  const [lista,            setLista]           = useState<ItemResumen[]>([]);
  const [categorias,       setCategorias]      = useState<Categoria[]>([]);
  const [loading,          setLoading]         = useState(true);
  const [selectedId,       setSelectedId]      = useState<string | null>(null);
  const [detalle,          setDetalle]         = useState<Item | null>(null);
  const [loadingDet,       setLoadingDet]      = useState(false);
  const [search,           setSearch]          = useState("");
  const [filtroCategoria,  setFiltroCategoria] = useState("");
  const [filtroFrio,       setFiltroFrio]      = useState<"" | "si" | "no">("");
  const [showModal,        setShowModal]       = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [items, cats] = isMock
        ? [MOCK_ITEMS_LIST, MOCK_CATEGORIAS]
        : await Promise.all([itemsService.getAll(), categoriasService.getAll()]);
      setLista(items);
      setCategorias(cats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!selectedId) { setDetalle(null); return; }
    setLoadingDet(true);
    const load = async () => {
      try {
        const d = isMock ? MOCK_ITEM_DETALLE : await itemsService.getById(selectedId);
        setDetalle(d);
      } finally { setLoadingDet(false); }
    };
    load();
  }, [selectedId]);

  const filtrados = lista.filter(item => {
    const q = search.toLowerCase();
    return (
      (filtroCategoria === "" || item.categoriaNombre === filtroCategoria) &&
      (filtroFrio === "" || 
        (filtroFrio === "si" ? item.requiereCadenaFrio === true : item.requiereCadenaFrio === false)) &&
      (!q || item.nombre.toLowerCase().includes(q) || item.codigo.toLowerCase().includes(q))
    );
  });

  const catOptions = [...new Set(lista.map(i => i.categoriaNombre))];

  return (
    <div className="ms-page">

      {/* Header */}
      <div className="ms-header">
        <div>
          <p className="ms-breadcrumb">Maestros</p>
          <h1 className="ms-title">Ítems / Materias primas</h1>
          <p className="ms-subtitle">Catálogo de ítems con parámetros de calidad y documentos</p>
        </div>
        <div className="ms-header-actions">
          <Button variant="ghost" size="sm" onClick={cargar} loading={loading}
            iconLeft="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15">
            Actualizar
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}
            iconLeft="M12 5v14M5 12h14">
            Nuevo ítem
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="ms-kpi-grid">
        {[
          { label: "Total",         value: lista.length,                                            color: "#CBD5E1" },
          { label: "Activos",   value: lista.filter(i => i.estado === true).length,  color: "#86EFAC" },
          { label: "Cadena de frío",value: lista.filter(i => i.requiereCadenaFrio).length,           color: "#93C5FD" },
          { label: "Inactivos", value: lista.filter(i => i.estado === false).length, color: "#94A3B8" },
        ].map(k => (
          <div key={k.label} className="ms-kpi-card">
            <p className="ms-kpi-label">{k.label}</p>
            <p className="ms-kpi-value" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="ms-filters">
        <div className="ms-search-wrap">
          <svg className="ms-search-icon" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="#475569" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input type="text" placeholder="Buscar por nombre o código…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="ms-input ms-input-search" aria-label="Buscar ítem" />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="ms-select" data-empty={filtroCategoria === ""} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtroFrio} onChange={e => setFiltroFrio(e.target.value as "" | "si" | "no")}
          className="ms-select" data-empty={filtroFrio === ""} aria-label="Filtrar por cadena de frío">
          <option value="">Cadena de frío: todos</option>
          <option value="si">Requiere frío</option>
          <option value="no">Sin frío</option>
        </select>
      </div>

      {/* Body */}
      <div className="ms-body">
        <div className="ms-list" style={{ width: selectedId ? "320px" : "100%" }}>
          <div className="ms-list-header">
            <p className="ms-list-count">
              {filtrados.length} ítem{filtrados.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="ms-list-scroll">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="ms-skeleton-row">
                  <div className="ms-skeleton-line" style={{ height: "0.875rem", width: "55%", marginBottom: "0.5rem" }} />
                  <div className="ms-skeleton-line" style={{ height: "0.625rem", width: "30%" }} />
                </div>
              ))
              : filtrados.length === 0
              ? <div className="ms-list-empty"><p className="ms-list-empty-text">Sin resultados.</p></div>
              : filtrados.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  active={selectedId === item.id}
                  onClick={() => setSelectedId(prev => prev === item.id ? null : item.id)}
                />
              ))
            }
          </div>
        </div>

        {selectedId && (
          <div className="ms-panel">
            {loadingDet ? (
              <div className="ms-panel-loading">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : detalle ? (
              <PanelDetalle
                item={detalle}
                categorias={categorias}
                onClose={() => setSelectedId(null)}
                onActualizado={() => {
                  cargar();
                  if (selectedId) {
                    setLoadingDet(true);
                    itemsService.getById(selectedId)
                      .then(d => setDetalle(d))
                      .finally(() => setLoadingDet(false));
                  }
                }}
              />
            ) : null}
          </div>
        )}
      </div>

      {showModal && (
        <ModalNuevoItem
          categorias={categorias}
          onClose={() => setShowModal(false)}
          onCreado={item => { setLista(prev => [item, ...prev]); setShowModal(false); }}
        />
      )}
    </div>
  );
}