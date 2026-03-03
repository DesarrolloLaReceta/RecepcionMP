import { useState, useCallback, useEffect } from "react";
import {
  checklistsService, categoriasService,
  type ChecklistResumen, type Checklist, type Categoria,
  type CriterioChecklist,
} from "../../Services/maestros.service";
import { Button, Modal, ModalFooter } from "../../Components/UI/Index";
import { TextField, SelectField } from "../../Components/Forms/Index";
import { formatDate } from "../../Utils/formatters";
import {
  MOCK_CHECKLISTS_LIST, MOCK_CHECKLIST_DETALLE, MOCK_CATEGORIAS,
} from "./MockData";
import "./StylesMaestros/MaestrosLayout.css";
import "./StylesMaestros/CheckListPage.css";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

const TIPO_CRITERIO_LABELS: Record<CriterioChecklist["tipoCriterio"], string> = {
  SiNo:     "Sí / No",
  Numerico: "Numérico",
  Texto:    "Texto libre",
};

// ─── CAT BADGE ────────────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  "Cárnicos":       { bg: "rgba(239,68,68,0.10)",   color: "#FCA5A5" },
  "Lácteos":        { bg: "rgba(59,130,246,0.10)",   color: "#93C5FD" },
  "Secos":          { bg: "rgba(245,158,11,0.10)",   color: "#FCD34D" },
  "Frutas/Verduras":{ bg: "rgba(34,197,94,0.10)",    color: "#86EFAC" },
  "Congelados":     { bg: "rgba(168,85,247,0.10)",   color: "#C4B5FD" },
};
function CatBadge({ nombre }: { nombre: string }) {
  const c = CAT_COLORS[nombre] ?? { bg: "rgba(255,255,255,0.05)", color: "#64748B" };
  return (
    <span className="cl-cat-badge" style={{ background: c.bg, color: c.color }}>
      {nombre}
    </span>
  );
}

// ─── FILA CHECKLIST ───────────────────────────────────────────────────────────

function ChecklistRow({
  cl, active, onClick,
}: {
  cl: ChecklistResumen;
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
      <div className="cl-row-inner">
        <div
          className="cl-icon"
          style={{
            background: cl.activo ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${cl.activo ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.07)"}`,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={cl.activo ? "#F59E0B" : "#475569"} strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <div className="cl-row-info">
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.125rem" }}>
            <p className="cl-nombre">{cl.nombre}</p>
            {!cl.activo && <span className="cl-inactive-badge">INACTIVO</span>}
          </div>
          <div className="cl-meta">
            <CatBadge nombre={cl.categoriaNombre} />
            <span className="cl-version">v{cl.version}</span>
            <span className="cl-criterios-count">
              {cl.totalCriterios} criterios · {cl.obligatorios} obl.
            </span>
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "0.125rem" }}>
            Actualizado {formatDate(cl.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── CRITERIO EDITOR ──────────────────────────────────────────────────────────

function CriterioEditor({
  criterio, index, totalItems, onChange, onDelete, onMove,
}: {
  criterio:   CriterioChecklist;
  index:      number;
  totalItems: number;
  onChange:   (updated: CriterioChecklist) => void;
  onDelete:   () => void;
  onMove:     (dir: "up" | "down") => void;
}) {
  const upd = (k: keyof CriterioChecklist, v: unknown) =>
    onChange({ ...criterio, [k]: v });

  return (
    <div className="cl-criterio-card">
      {/* Header */}
      <div className="cl-criterio-header">
        {/* Mover */}
        <div className="cl-move-btns">
          <button className="cl-move-btn" onClick={() => onMove("up")} disabled={index === 0} aria-label="Subir">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <button className="cl-move-btn" onClick={() => onMove("down")} disabled={index === totalItems - 1} aria-label="Bajar">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Número */}
        <span className="cl-criterio-num">{index + 1}</span>

        {/* Tipo */}
        <select
          className="cl-tipo-select"
          value={criterio.tipoCriterio}
          onChange={e => upd("tipoCriterio", e.target.value)}
        >
          {Object.entries(TIPO_CRITERIO_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {/* Toggle obligatorio */}
        <div className="cl-toggle-wrap">
          <span className="cl-toggle-label">Obligatorio</span>
          <button
            type="button"
            className="cl-toggle"
            style={{ background: criterio.obligatorio ? "#F59E0B" : "rgba(255,255,255,0.08)" }}
            onClick={() => upd("obligatorio", !criterio.obligatorio)}
            aria-pressed={criterio.obligatorio}
            aria-label="Marcar como obligatorio"
          >
            <span
              className="cl-toggle-knob"
              style={{ left: criterio.obligatorio ? "1rem" : "0.125rem" }}
            />
          </button>
        </div>

        {/* Eliminar */}
        <button className="cl-delete-btn" onClick={onDelete} aria-label="Eliminar criterio">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="cl-criterio-body">
        <input
          className="cl-desc-input"
          value={criterio.descripcion}
          onChange={e => upd("descripcion", e.target.value)}
          placeholder="Descripción del criterio de inspección…"
        />

        {criterio.tipoCriterio === "Numerico" && (
          <div className="cl-num-grid">
            {([
              { label: "Mín.", key: "valorMinimo" as keyof CriterioChecklist },
              { label: "Máx.", key: "valorMaximo" as keyof CriterioChecklist },
            ]).map(f => (
              <div key={f.key}>
                <p className="cl-num-label">{f.label}</p>
                <input
                  type="number"
                  className="cl-num-input"
                  value={String(criterio[f.key] ?? "")}
                  onChange={e => upd(f.key, e.target.value === "" ? undefined : Number(e.target.value))}
                />
              </div>
            ))}
            <div>
              <p className="cl-num-label">Unidad</p>
              <input
                className="cl-num-input"
                value={criterio.unidad ?? ""}
                onChange={e => upd("unidad", e.target.value)}
                placeholder="°C, %, g…"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PANEL EDITOR ─────────────────────────────────────────────────────────────

function PanelEditor({
  cl, onClose, onGuardado,
}: {
  cl:          Checklist;
  onClose:     () => void;
  onGuardado:  (updated: Checklist) => void;
}) {
  const [criterios,   setCriterios]   = useState<CriterioChecklist[]>(cl.criterios);
  const [dirty,       setDirty]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [publishing,  setPublishing]  = useState(false);
  const [savedOk,     setSavedOk]     = useState(false);

  const update = (idx: number, updated: CriterioChecklist) => {
    setCriterios(prev => prev.map((c, i) => i === idx ? updated : c));
    setDirty(true); setSavedOk(false);
  };

  const deleteCriterio = (idx: number) => {
    setCriterios(prev =>
      prev.filter((_, i) => i !== idx).map((c, i) => ({ ...c, orden: i + 1 }))
    );
    setDirty(true); setSavedOk(false);
  };

  const moveCriterio = (idx: number, dir: "up" | "down") => {
    const next = [...criterios];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setCriterios(next.map((c, i) => ({ ...c, orden: i + 1 })));
    setDirty(true); setSavedOk(false);
  };

  const addCriterio = () => {
    setCriterios(prev => [...prev, {
      id: `cr-${Date.now()}`,
      orden: prev.length + 1,
      descripcion: "",
      obligatorio: false,
      tipoCriterio: "SiNo",
    }]);
    setDirty(true); setSavedOk(false);
  };

  const guardar = async () => {
    setSaving(true);
    try {
      if (!isMock) {
        await checklistsService.actualizarCriterios(cl.id, criterios);
      } else {
        await new Promise(r => setTimeout(r, 500));
      }
      const updated: Checklist = { ...cl, criterios };
      onGuardado(updated);
      setDirty(false); setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const publicar = async () => {
    setPublishing(true);
    try {
      if (!isMock) {
        if (dirty) await checklistsService.actualizarCriterios(cl.id, criterios);
        await checklistsService.publicar(cl.id);
      } else {
        await new Promise(r => setTimeout(r, 600));
      }
      const updated: Checklist = { ...cl, criterios, version: cl.version + 1, activo: true };
      onGuardado(updated);
      setDirty(false); setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="cl-panel-header">
        <div className="cl-panel-title">
          <p className="cl-panel-nombre">{cl.nombre}</p>
          <div className="cl-panel-meta">
            <CatBadge nombre={cl.categoriaNombre} />
            <span className="cl-version">v{cl.version}</span>
            {!cl.activo && <span className="cl-inactive-badge">BORRADOR</span>}
          </div>
        </div>
        <button className="cl-panel-close" onClick={onClose} aria-label="Cerrar editor">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Acciones */}
      <div className="cl-panel-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={guardar}
          loading={saving}
          disabled={!dirty || publishing}
        >
          {dirty ? "Guardar cambios" : "Sin cambios"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={publicar}
          loading={publishing}
          disabled={saving}
        >
          {dirty ? "Guardar y publicar" : `Publicar v${cl.version + 1}`}
        </Button>
        {savedOk && (
          <span className="cl-save-ok">✓ Guardado</span>
        )}
      </div>

      {/* Lista de criterios */}
      <div className="cl-panel-scroll">
        {criterios.length === 0 && (
          <div className="cl-empty-criterios">
            <p style={{ fontSize: "var(--text-md)", color: "var(--text-tertiary)" }}>
              Sin criterios. Agrega el primero.
            </p>
          </div>
        )}

        {criterios.map((cr, idx) => (
          <CriterioEditor
            key={cr.id}
            criterio={cr}
            index={idx}
            totalItems={criterios.length}
            onChange={updated => update(idx, updated)}
            onDelete={() => deleteCriterio(idx)}
            onMove={dir => moveCriterio(idx, dir)}
          />
        ))}

        <button className="cl-add-btn" onClick={addCriterio} type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar criterio
        </button>

        <p className="cl-norm-note">
          Los criterios marcados como obligatorios bloquean la recepción si no se completan.
          Al publicar se incrementa la versión y queda trazabilidad del cambio. Res. 2674/2013.
        </p>
      </div>
    </>
  );
}

// ─── MODAL NUEVO CHECKLIST ────────────────────────────────────────────────────

function ModalNuevo({
  categorias, onClose, onCreado,
}: {
  categorias: Categoria[];
  onClose:    () => void;
  onCreado:   (cl: ChecklistResumen) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [catId,  setCatId]  = useState("");
  const [saving, setSaving] = useState(false);
  const valid = nombre.trim() && catId;

  const crear = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const cat = categorias.find(c => c.id === catId);
      if (!isMock) {
        await checklistsService.crear({
          nombre,
          categoriaId: catId,
          categoriaNombre: cat?.nombre ?? "",
          activo: false,
          criterios: [],
        });
      } else {
        await new Promise(r => setTimeout(r, 600));
      }
      onCreado({
        id: `cl-${Date.now()}`,
        nombre,
        categoriaNombre: cat?.nombre ?? "",
        version: 1,
        activo: false,
        totalCriterios: 0,
        obligatorios: 0,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Nuevo checklist BPM"
      subtitle="Se creará como borrador (v1) para luego agregar criterios y publicar"
      icon="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
      size="sm"
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={crear}
          loading={saving}
          disabled={!valid}
          confirmLabel="Crear checklist"
        />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <TextField
          label="Nombre del checklist"
          required
          placeholder="Ej: Inspección cárnicos frescos"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <SelectField
          label="Categoría"
          required
          placeholder="Selecciona una categoría"
          options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
          value={catId}
          onChange={e => setCatId(e.target.value)}
        />
        <div style={{
          padding: "0.75rem",
          borderRadius: "var(--radius-md)",
          background: "rgba(245,158,11,0.04)",
          border: "1px solid rgba(245,158,11,0.10)",
        }}>
          <p style={{ fontSize: "var(--text-sm)", color: "#94A3B8", lineHeight: 1.6 }}>
            El checklist se creará como borrador (v1). Podrás agregar criterios en el editor
            antes de publicarlo y asociarlo a recepciones.
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function ChecklistsPage() {
  const [lista,           setLista]           = useState<ChecklistResumen[]>([]);
  const [categorias,      setCategorias]      = useState<Categoria[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedId,      setSelectedId]      = useState<string | null>(null);
  const [detalle,         setDetalle]         = useState<Checklist | null>(null);
  const [loadingDet,      setLoadingDet]      = useState(false);
  const [search,          setSearch]          = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [showModal,       setShowModal]       = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, cats] = isMock
        ? [MOCK_CHECKLISTS_LIST, MOCK_CATEGORIAS]
        : await Promise.all([checklistsService.getAll(), categoriasService.getAll()]);
      setLista(cls);
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
        const d = isMock ? MOCK_CHECKLIST_DETALLE : await checklistsService.getById(selectedId);
        setDetalle(d);
      } finally { setLoadingDet(false); }
    };
    load();
  }, [selectedId]);

  const filtrados = lista.filter(cl => {
    const q = search.toLowerCase();
    return (
      (filtroCategoria === "" || cl.categoriaNombre === filtroCategoria) &&
      (!q || cl.nombre.toLowerCase().includes(q) || cl.categoriaNombre.toLowerCase().includes(q))
    );
  });

  const catOptions = [...new Set(lista.map(c => c.categoriaNombre))];
  const activos    = lista.filter(c => c.activo).length;

  return (
    <div className="ms-page">

      {/* Header */}
      <div className="ms-header">
        <div>
          <p className="ms-breadcrumb">Maestros</p>
          <h1 className="ms-title">Checklists BPM</h1>
          <p className="ms-subtitle">Criterios de inspección por categoría — versionados y auditables</p>
        </div>
        <div className="ms-header-actions">
          <Button variant="ghost" size="sm" onClick={cargar} loading={loading}
            iconLeft="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15">
            Actualizar
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}
            iconLeft="M12 5v14M5 12h14">
            Nuevo checklist
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="ms-kpi-grid">
        {[
          { label: "Total",      value: lista.length,              color: "#CBD5E1" },
          { label: "Activos",    value: activos,                   color: "#86EFAC" },
          { label: "Borradores", value: lista.length - activos,    color: "#FCD34D" },
          { label: "Categorías", value: catOptions.length,         color: "#C4B5FD" },
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
          <input type="text" placeholder="Buscar checklist…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="ms-input ms-input-search" aria-label="Buscar checklist" />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="ms-select" data-empty={filtroCategoria === ""} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Body */}
      <div className="ms-body">

        <div className="ms-list" style={{ width: selectedId ? "300px" : "100%" }}>
          <div className="ms-list-header">
            <p className="ms-list-count">
              {filtrados.length} checklist{filtrados.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="ms-list-scroll">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="ms-skeleton-row">
                  <div className="ms-skeleton-line" style={{ height: "0.875rem", width: "65%", marginBottom: "0.5rem" }} />
                  <div className="ms-skeleton-line" style={{ height: "0.625rem", width: "40%" }} />
                </div>
              ))
              : filtrados.length === 0
              ? <div className="ms-list-empty"><p className="ms-list-empty-text">Sin checklists.</p></div>
              : filtrados.map(cl => (
                <ChecklistRow
                  key={cl.id}
                  cl={cl}
                  active={selectedId === cl.id}
                  onClick={() => setSelectedId(prev => prev === cl.id ? null : cl.id)}
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
              <PanelEditor
                cl={detalle}
                onClose={() => setSelectedId(null)}
                onGuardado={updated => {
                  setDetalle(updated);
                  setLista(prev => prev.map(cl =>
                    cl.id === updated.id
                      ? {
                          ...cl,
                          version:        updated.version,
                          activo:         updated.activo,
                          totalCriterios: updated.criterios.length,
                          obligatorios:   updated.criterios.filter(c => c.obligatorio).length,
                          updatedAt:      updated.updatedAt,
                        }
                      : cl
                  ));
                }}
              />
            ) : null}
          </div>
        )}

      </div>

      {showModal && (
        <ModalNuevo
          categorias={categorias}
          onClose={() => setShowModal(false)}
          onCreado={cl => {
            setLista(prev => [...prev, cl]);
            setShowModal(false);
            setSelectedId(cl.id);
          }}
        />
      )}
    </div>
  );
}