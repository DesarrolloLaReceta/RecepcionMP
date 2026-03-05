import { useState, useEffect, useCallback } from "react";
import {
  noConformidadesService,
  type NoConformidad,
  EstadoNC, EstadoNCLabels,
  PrioridadNC, PrioridadNCLabels,
  TipoNC, TipoNCLabels,
  type CrearNCCommand,
  type AgregarAccionCommand,
  type AccionCorrectiva,
} from "../../Services/no-conformidades.service";
import { Button, Modal, ModalFooter } from "../../Components/UI/Index";
import {
  TextField, SelectField, DateField,
  NumberField, TextAreaField,
} from "../../Components/Forms/Index";
import { formatDate, formatDateTime } from "../../Utils/formatters";
import { MOCK_NC } from "./MockData";
import "./StylesNoC/NoConformidadesPage.css";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// helpers
function diasRestantes(f?: string): number | null {
  if (!f) return null;
  return Math.ceil((new Date(f).getTime() - Date.now()) / 86_400_000);
}

const ESTADO_CFG: Record<EstadoNC, { color: string; bg: string; dot: string }> = {
  [EstadoNC.Abierta]:     { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",   dot: "#EF4444" },
  [EstadoNC.EnAnalisis]:  { color: "#93C5FD", bg: "rgba(59,130,246,0.08)",  dot: "#3B82F6" },
  [EstadoNC.EnEjecucion]: { color: "#FCD34D", bg: "rgba(245,158,11,0.08)",  dot: "#F59E0B" },
  [EstadoNC.Cerrada]:     { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",   dot: "#22C55E" },
  [EstadoNC.Anulada]:     { color: "#94A3B8", bg: "rgba(100,116,139,0.1)",  dot: "#64748B" },
};
const PRIORIDAD_CFG: Record<PrioridadNC, { color: string; bg: string; border: string }> = {
  [PrioridadNC.Baja]:    { color: "#86EFAC", bg: "rgba(34,197,94,0.06)",  border: "rgba(34,197,94,0.15)"  },
  [PrioridadNC.Media]:   { color: "#FCD34D", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)" },
  [PrioridadNC.Alta]:    { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"   },
  [PrioridadNC.Critica]: { color: "#F87171", bg: "rgba(239,68,68,0.14)",  border: "rgba(239,68,68,0.35)"  },
};
const ACCION_CFG: Record<string, { color: string; bg: string; label: string }> = {
  Pendiente:  { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",  label: "Pendiente"  },
  EnCurso:    { color: "#FCD34D", bg: "rgba(245,158,11,0.08)", label: "En curso"   },
  Completada: { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",  label: "Completada" },
};

// badge compartido NC
function NCBadge({ label, color, bg, dot }: { label: string; color: string; bg: string; dot?: string }) {
  return (
    <span className="nc-badge" style={{ background: bg, color }}>
      {dot && <span className="nc-badge-dot" style={{ background: dot }} />}
      {label}
    </span>
  );
}

// fila tabla
function NCRow({ nc, selected, onClick }: { nc: NoConformidad; selected: boolean; onClick: () => void }) {
  const ec   = ESTADO_CFG[nc.estado];
  const pc   = PRIORIDAD_CFG[nc.prioridad];
  const dias = diasRestantes(nc.fechaLimite);
  const cerrada = nc.estado === EstadoNC.Cerrada || nc.estado === EstadoNC.Anulada;
  let diasClass = "nc-dias-na", diasLabel = cerrada ? formatDate(nc.fechaCierre) : "—";
  if (!cerrada && nc.fechaLimite) {
    if (dias === null || dias > 3) { diasClass = "nc-dias-ok";  diasLabel = dias != null ? `${dias}d` : "—"; }
    else if (dias > 0)             { diasClass = "nc-dias-warn"; diasLabel = `${dias}d`; }
    else                           { diasClass = "nc-dias-late"; diasLabel = "VENCIDA"; }
  }
  return (
    <tr className="ncp-row" data-selected={selected} onClick={onClick}>
      <td style={{ padding: 0, width: 2 }}>
        <span className="ncp-row-indicator" style={{ background: selected ? "var(--primary)" : "transparent" }} />
      </td>
      <td style={{ padding: "1rem 1.25rem" }}>
        <p className="ncp-numero">{nc.numero}</p>
        <p className="ncp-tipo">{TipoNCLabels[nc.tipo]}</p>
      </td>
      <td style={{ padding: "1rem" }}>
        <p style={{ fontSize: "var(--text-sm)", color: "#CBD5E1" }}>{nc.proveedorNombre ?? "—"}</p>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{nc.itemNombre ?? "—"}</p>
      </td>
      <td style={{ padding: "1rem" }}>
        <span className="nc-prioridad-pill" style={{ background: pc.bg, color: pc.color, borderColor: pc.border }}>
          {PrioridadNCLabels[nc.prioridad]}
        </span>
      </td>
      <td style={{ padding: "1rem" }}>
        <NCBadge label={EstadoNCLabels[nc.estado]} {...ec} />
      </td>
      <td style={{ padding: "1rem" }}>
        <span className={diasClass}>{diasLabel}</span>
      </td>
      <td style={{ padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            {nc.accionesCorrectivas.length}
          </span>
          {nc.accionesCorrectivas.some(a => a.estado !== "Completada") && (
            <span className="nc-capa-dot" />
          )}
        </div>
      </td>
    </tr>
  );
}

// panel lateral
function DetallePanel({ nc, onClose, onAgregarAccion, onCerrar, saving }: {
  nc: NoConformidad; onClose: () => void;
  onAgregarAccion: (cmd: AgregarAccionCommand) => void;
  onCerrar: (cmd: { ncId: string; observaciones?: string }) => void;
  saving: boolean;
}) {
  const [activeTab,      setActiveTab]      = useState<"acciones" | "comentarios">("acciones");
  const [showAccionForm, setShowAccionForm] = useState(false);
  const [showCierreForm, setShowCierreForm] = useState(false);
  const [accion,  setAccion]  = useState({ descripcion: "", responsable: "", fechaCompromiso: "" });
  const [obsCierre, setObsCierre] = useState("");
  const cerrada = nc.estado === EstadoNC.Cerrada || nc.estado === EstadoNC.Anulada;
  const ec = ESTADO_CFG[nc.estado];
  const pc = PRIORIDAD_CFG[nc.prioridad];
  const submitAccion = () => {
    if (!accion.descripcion || !accion.responsable || !accion.fechaCompromiso) return;
    onAgregarAccion({ ncId: nc.id, ...accion });
    setAccion({ descripcion: "", responsable: "", fechaCompromiso: "" });
    setShowAccionForm(false);
  };
  return (
    <>
      <div className="ncp-panel-header">
        <button className="ncp-panel-close" onClick={onClose} aria-label="Cerrar panel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <p className="ncp-panel-numero">{nc.numero}</p>
        <p className="ncp-panel-titulo">{nc.titulo}</p>
        <div className="ncp-panel-meta">
          <NCBadge label={EstadoNCLabels[nc.estado]} {...ec} />
          <span className="nc-prioridad-pill" style={{ background: pc.bg, color: pc.color, borderColor: pc.border }}>
            {PrioridadNCLabels[nc.prioridad]}
          </span>
        </div>
      </div>
      <div className="ncp-panel-tabs">
        {([
          { key: "acciones",    label: `Acciones CAPA (${nc.accionesCorrectivas.length})` },
          { key: "comentarios", label: `Comentarios (${nc.comentarios.length})` },
        ] as const).map(t => (
          <button key={t.key} className="ncp-panel-tab" data-active={activeTab === t.key}
            onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>
      <div className="ncp-panel-scroll">
        {activeTab === "acciones" && (
          <>
            {!cerrada && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="ghost" size="sm" onClick={() => setShowAccionForm(v => !v)}>
                  {showAccionForm ? "Cancelar" : "+ Agregar"}
                </Button>
              </div>
            )}
            {showAccionForm && (
              <div className="ncp-form-box">
                <TextAreaField label="Descripción" required placeholder="Describe la acción…" rows={2}
                  value={accion.descripcion}
                  onChange={e => setAccion(p => ({ ...p, descripcion: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <TextField label="Responsable" required placeholder="Nombre y área"
                    value={accion.responsable}
                    onChange={e => setAccion(p => ({ ...p, responsable: e.target.value }))} />
                  <DateField label="Fecha compromiso" required
                    min={new Date().toISOString().slice(0, 10)}
                    value={accion.fechaCompromiso}
                    onChange={e => setAccion(p => ({ ...p, fechaCompromiso: e.target.value }))} />
                </div>
                <Button variant="secondary" size="sm" fullWidth loading={saving}
                  disabled={!accion.descripcion || !accion.responsable || !accion.fechaCompromiso}
                  onClick={submitAccion}>
                  Agregar acción
                </Button>
              </div>
            )}
            {nc.accionesCorrectivas.length === 0
              ? <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", textAlign: "center", padding: "1rem" }}>Sin acciones correctivas.</p>
              : nc.accionesCorrectivas.map((ac: AccionCorrectiva, i: number) => {
                  const c = ACCION_CFG[ac.estado] ?? ACCION_CFG["Pendiente"];
                  return (
                    <div key={ac.id} className="ncp-accion-card">
                      <div className="ncp-accion-header">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flex: 1 }}>
                          <span className="ncp-accion-idx">{i + 1}</span>
                          <span className="ncp-accion-desc">{ac.descripcion}</span>
                        </div>
                        <NCBadge label={c.label} color={c.color} bg={c.bg} />
                      </div>
                      <div className="ncp-accion-meta">
                        <span className="ncp-accion-meta-item">👤 {ac.responsable}</span>
                        <span className="ncp-accion-meta-item">📅 {formatDate(ac.fechaCompromiso)}</span>
                      </div>
                    </div>
                  );
                })
            }
          </>
        )}
        {activeTab === "comentarios" && (
          nc.comentarios.length === 0
            ? <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", textAlign: "center", padding: "1rem" }}>Sin comentarios.</p>
            : nc.comentarios.map(c => (
              <div key={c.id} className="ncp-comment">
                <p className="ncp-comment-autor">{c.autor}</p>
                <p className="ncp-comment-texto">{c.texto}</p>
                <p className="ncp-comment-fecha">{formatDateTime(c.fechaRegistro)}</p>
              </div>
            ))
        )}
      </div>
      {!cerrada && (
        <div className="ncp-panel-footer">
          {showCierreForm ? (
            <>
              <TextAreaField label="Observaciones de cierre" placeholder="Resolución final…" rows={2}
                value={obsCierre} onChange={e => setObsCierre(e.target.value)} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button variant="ghost" size="sm" onClick={() => setShowCierreForm(false)}>Cancelar</Button>
                <Button variant="success" size="sm" fullWidth loading={saving}
                  onClick={() => onCerrar({ ncId: nc.id, observaciones: obsCierre })}>
                  Confirmar cierre
                </Button>
              </div>
            </>
          ) : (
            <Button variant="success" size="sm" fullWidth onClick={() => setShowCierreForm(true)}>
              Cerrar no conformidad
            </Button>
          )}
          <p className="ncp-footer-meta">
            Creada: {formatDateTime(nc.creadoEn)}
            {nc.actualizadoEn ? ` · Actualizada: ${formatDateTime(nc.actualizadoEn)}` : ""}
          </p>
        </div>
      )}
    </>
  );
}

// modal crear
function ModalCrear({ onClose, onCrear, saving }: {
  onClose: () => void; onCrear: (cmd: CrearNCCommand) => void; saving: boolean;
}) {
  const [form, setForm] = useState<CrearNCCommand>({
    tipo: TipoNC.Rechazo, prioridad: PrioridadNC.Media,
    titulo: "", descripcion: "", proveedorId: "", loteId: "", recepcionId: "",
    cantidadAfectada: undefined, unidadMedida: "", fechaLimite: "",
    asignadoA: "", notificarProveedor: false,
  });
  const upd = <K extends keyof CrearNCCommand>(k: K, v: CrearNCCommand[K]) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.descripcion.trim().length > 5;
  const tipoOptions      = Object.entries(TipoNCLabels).map(([k, v]) => ({ value: k, label: v }));
  const prioridadOptions = Object.entries(PrioridadNCLabels).map(([k, v]) => ({ value: k, label: v }));
  return (
    <Modal open onClose={onClose} title="Nueva no conformidad"
      icon="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      size="lg"
      footer={<ModalFooter onCancel={onClose} onConfirm={() => onCrear(form)} loading={saving} disabled={!valid} confirmLabel="Registrar NC" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <SelectField label="Tipo de NC" required options={tipoOptions}
            value={String(form.tipo)} onChange={e => upd("tipo", Number(e.target.value) as TipoNC)} />
          <SelectField label="Prioridad" required options={prioridadOptions}
            value={String(form.prioridad)} onChange={e => upd("prioridad", Number(e.target.value) as PrioridadNC)} />
        </div>
        <TextField label="Título" required placeholder="Resumen corto de la NC"
          value={form.titulo} onChange={e => upd("titulo", e.target.value)} />
        <TextAreaField label="Descripción" required rows={3}
          placeholder="Describe detalladamente la no conformidad…"
          value={form.descripcion} onChange={e => upd("descripcion", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <NumberField label="Cantidad afectada" placeholder="0" min={0}
            value={form.cantidadAfectada ?? ""}
            onChange={e => upd("cantidadAfectada", e.target.value ? Number(e.target.value) : undefined)} />
          <TextField label="Unidad de medida" placeholder="Kg, L, Unidad…"
            value={form.unidadMedida ?? ""} onChange={e => upd("unidadMedida", e.target.value)} />
          <DateField label="Fecha límite"
            value={form.fechaLimite ?? ""} onChange={e => upd("fechaLimite", e.target.value)} />
        </div>
        <TextField label="Asignado a" placeholder="Nombre del responsable"
          value={form.asignadoA ?? ""} onChange={e => upd("asignadoA", e.target.value)} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button type="button"
            onClick={() => upd("notificarProveedor", !form.notificarProveedor)}
            style={{ width: "2.25rem", height: "1.25rem", borderRadius: "var(--radius-full)",
              background: form.notificarProveedor ? "#F59E0B" : "rgba(255,255,255,0.08)",
              border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
            aria-pressed={form.notificarProveedor} aria-label="Notificar al proveedor">
            <span style={{ position: "absolute", top: "0.125rem", width: "1rem", height: "1rem",
              borderRadius: "var(--radius-full)", background: "#fff",
              left: form.notificarProveedor ? "1.125rem" : "0.125rem", transition: "left 0.2s" }} />
          </button>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Notificar al proveedor</span>
        </div>
      </div>
    </Modal>
  );
}

// página principal
export default function NoConformidadesPage() {
  const [ncs,            setNcs]            = useState<NoConformidad[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [selected,       setSelected]       = useState<NoConformidad | null>(null);
  const [showCrear,      setShowCrear]      = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [search,         setSearch]         = useState("");
  const [filtroEstado,   setFiltroEstado]   = useState<EstadoNC | "">("");
  const [filtroPrioridad,setFiltroPrioridad]= useState<PrioridadNC | "">("");

  const cargar = useCallback(async () => {
    setLoading(true); setError(null);
    try { const data = isMock ? MOCK_NC : await noConformidadesService.getAll(); setNcs(data); }
    catch { setError("No se pudo cargar las no conformidades."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const filtered = ncs.filter(nc => {
    if (filtroEstado    !== "" && nc.estado    !== filtroEstado)    return false;
    if (filtroPrioridad !== "" && nc.prioridad !== filtroPrioridad) return false;
    if (search) {
      const q = search.toLowerCase();
      return nc.numero.toLowerCase().includes(q) ||
        (nc.proveedorNombre ?? "").toLowerCase().includes(q) ||
        (nc.itemNombre ?? "").toLowerCase().includes(q) ||
        TipoNCLabels[nc.tipo].toLowerCase().includes(q);
    }
    return true;
  });

  const abiertas  = ncs.filter(n => n.estado === EstadoNC.Abierta).length;
  const enGestion = ncs.filter(n => n.estado === EstadoNC.EnEjecucion || n.estado === EstadoNC.EnAnalisis).length;
  const criticas  = ncs.filter(n => n.prioridad === PrioridadNC.Critica && n.estado !== EstadoNC.Cerrada && n.estado !== EstadoNC.Anulada).length;

  const handleCrear = async (cmd: CrearNCCommand) => {
    setSaving(true);
    try {
      if (isMock) {
        await new Promise(r => setTimeout(r, 700));
        const nueva: NoConformidad = {
          id: `nc-mock-${Date.now()}`, numero: `NC-2026-${String(ncs.length + 1).padStart(4, "0")}`,
          tipo: cmd.tipo, prioridad: cmd.prioridad, estado: EstadoNC.Abierta,
          titulo: cmd.titulo, descripcion: cmd.descripcion,
          detectadoPor: "Usuario actual", fechaDeteccion: new Date().toISOString().slice(0, 10),
          accionesCorrectivas: [], cantidadAfectada: cmd.cantidadAfectada,
          unidadMedida: cmd.unidadMedida, fechaLimite: cmd.fechaLimite,
          notificarProveedor: cmd.notificarProveedor, creadoEn: new Date().toISOString(), comentarios: [],
        };
        setNcs(p => [nueva, ...p]);
      } else { await noConformidadesService.crear(cmd); await cargar(); }
      setShowCrear(false);
    } catch { setError("Error al crear la no conformidad."); }
    finally { setSaving(false); }
  };

  const handleAgregarAccion = async (cmd: AgregarAccionCommand) => {
    setSaving(true);
    try {
      if (isMock) {
        await new Promise(r => setTimeout(r, 500));
        const nueva: AccionCorrectiva = { id: `ac-${Date.now()}`, descripcion: cmd.descripcion,
          responsable: cmd.responsable, fechaCompromiso: cmd.fechaCompromiso, estado: "Pendiente" };
        const patch = (n: NoConformidad) => n.id === cmd.ncId
          ? { ...n, accionesCorrectivas: [...n.accionesCorrectivas, nueva] } : n;
        setNcs(p => p.map(patch));
        setSelected(p => p && p.id === cmd.ncId ? patch(p) : p);
      } else { await noConformidadesService.agregarAccion(cmd); await cargar(); }
    } catch { setError("No se pudo agregar la acción."); }
    finally { setSaving(false); }
  };

  const handleCerrar = async (cmd: { ncId: string; observaciones?: string }) => {
    setSaving(true);
    try {
      if (isMock) {
        await new Promise(r => setTimeout(r, 600));
        const patch = (n: NoConformidad) => n.id === cmd.ncId
          ? { ...n, estado: EstadoNC.Cerrada, fechaCierre: new Date().toISOString().slice(0, 10) } : n;
        setNcs(p => p.map(patch));
        setSelected(p => p && p.id === cmd.ncId ? patch(p) : p);
      } else { await noConformidadesService.cerrar({ ncId: cmd.ncId, observaciones: cmd.observaciones }); await cargar(); }
    } catch { setError("No se pudo cerrar la NC."); }
    finally { setSaving(false); }
  };

  const estadoOptions    = Object.entries(EstadoNCLabels).map(([k, v]) => ({ value: k, label: v }));
  const prioridadOptions = Object.entries(PrioridadNCLabels).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div className="ncp-page">
      <div className="ncp-header">
        <div>
          <p className="ncp-breadcrumb">Control de calidad</p>
          <h1 className="ncp-title">No conformidades</h1>
          <p className="ncp-subtitle">CAPA — Registro, seguimiento y cierre de no conformidades</p>
        </div>
        <div className="ncp-header-actions">
          <Button variant="ghost" size="sm" loading={loading} onClick={cargar}
            iconLeft="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"
            >Actualizar</Button>
          <Button variant="primary" size="sm" onClick={() => setShowCrear(true)}
            iconLeft="M12 5v14M5 12h14">Nueva NC</Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", flexShrink: 0,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          color: "#FCA5A5", fontSize: "var(--text-sm)" }}>
          {error}
        </div>
      )}

      <div className="ncp-kpi-grid">
        {[
          { label: "Total",      value: ncs.length, color: "#CBD5E1" },
          { label: "Abiertas",   value: abiertas,   color: "#FCA5A5" },
          { label: "En gestión", value: enGestion,  color: "#FCD34D" },
          { label: "Críticas",   value: criticas,   color: "#F87171" },
        ].map(k => (
          <div key={k.label} className="ncp-kpi-card">
            <p className="ncp-kpi-label">{k.label}</p>
            <p className="ncp-kpi-value" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="ncp-filters">
        <div className="ncp-search-wrap">
          <svg className="ncp-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input type="text" placeholder="Buscar número, proveedor, ítem…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="ncp-input ncp-input-search" aria-label="Buscar no conformidades" />
        </div>
        <select value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value === "" ? "" : Number(e.target.value) as EstadoNC)}
          className="ncp-select" data-empty={filtroEstado === ""} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {estadoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filtroPrioridad}
          onChange={e => setFiltroPrioridad(e.target.value === "" ? "" : Number(e.target.value) as PrioridadNC)}
          className="ncp-select" data-empty={filtroPrioridad === ""} aria-label="Filtrar por prioridad">
          <option value="">Todas las prioridades</option>
          {prioridadOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="ncp-body">
        <div className="ncp-table-wrap">
          <div className="ncp-table-scroll">
            <table className="ncp-table">
              <thead>
                <tr>
                  <th style={{ width: 2, padding: 0 }} />
                  {[["N.° / Tipo"], ["Proveedor"], ["Prioridad"], ["Estado"], ["Límite"], ["CAPA"]].map(([label]) => (
                    <th key={label} style={{ padding: "0.875rem 1rem" }}>
                      <span className="ncp-th-label">{label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td style={{ padding: 0, width: 2 }} />
                      {[65, 45, 30, 40, 25, 20].map((w, j) => (
                        <td key={j} style={{ padding: "1rem 1.25rem" }}>
                          <div className="ncp-skeleton-line" style={{ height: "0.75rem", width: `${w}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : filtered.length === 0
                  ? (<tr><td colSpan={8}><div className="ncp-empty"><p className="ncp-empty-text">
                      {search || filtroEstado !== "" || filtroPrioridad !== ""
                        ? "Sin resultados para este filtro."
                        : "No hay no conformidades registradas."}
                    </p></div></td></tr>)
                  : filtered.map(nc => (
                    <NCRow key={nc.id} nc={nc} selected={selected?.id === nc.id}
                      onClick={() => setSelected(selected?.id === nc.id ? null : nc)} />
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="ncp-panel">
            <DetallePanel nc={selected} onClose={() => setSelected(null)}
              onAgregarAccion={handleAgregarAccion} onCerrar={handleCerrar} saving={saving} />
          </div>
        )}
      </div>

      {showCrear && (
        <ModalCrear onClose={() => setShowCrear(false)} onCrear={handleCrear} saving={saving} />
      )}
    </div>
  );
}