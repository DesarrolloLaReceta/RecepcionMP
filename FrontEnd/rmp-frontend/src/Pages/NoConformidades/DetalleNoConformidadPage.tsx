import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  noConformidadesService,
  type NoConformidad, type ComentarioNC,
  EstadoNC, EstadoNCLabels,
  PrioridadNC, PrioridadNCLabels,
  TipoNC, TipoNCLabels,
  type CambiarEstadoCommand,
  type AgregarAccionCommand,
} from "../../Services/no-conformidades.service";
import { Button, Modal, ModalFooter } from "../../Components/UI/Index";
import { TextAreaField, TextField, DateField } from "../../Components/Forms/Index";
import { formatDate, formatDateTime } from "../../Utils/formatters";
import { MOCK_NC } from "./MockData";
import "./StylesNoC/DetalleNoConformidadPage.css";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function isVencida(fecha?: string) {
  return !!fecha && new Date(fecha) < new Date();
}
function diasDesde(iso: string) {
  const d = Math.ceil((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d === 0 ? "Hoy" : `Hace ${d}d`;
}
function calcDiasAbierta(fechaDeteccion: string, fechaCierre?: string): number {
  const desde = new Date(fechaDeteccion).getTime();
  const hasta = fechaCierre ? new Date(fechaCierre).getTime() : Date.now();
  return Math.ceil((hasta - desde) / 86_400_000);
}

// ─── CONFIG VISUAL ────────────────────────────────────────────────────────────

const ESTADO_CFG: Record<EstadoNC, { color: string; bg: string; dot: string; border: string }> = {
  [EstadoNC.Abierta]:     { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",   dot: "#EF4444", border: "rgba(239,68,68,0.2)"    },
  [EstadoNC.EnAnalisis]:  { color: "#C4B5FD", bg: "rgba(168,85,247,0.08)",  dot: "#A855F7", border: "rgba(168,85,247,0.2)"   },
  [EstadoNC.EnEjecucion]: { color: "#FCD34D", bg: "rgba(245,158,11,0.08)",  dot: "#F59E0B", border: "rgba(245,158,11,0.2)"   },
  [EstadoNC.Cerrada]:     { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",   dot: "#22C55E", border: "rgba(34,197,94,0.2)"    },
  [EstadoNC.Anulada]:     { color: "#94A3B8", bg: "rgba(100,116,139,0.08)", dot: "#64748B", border: "rgba(100,116,139,0.15)" },
};
const PRIORIDAD_CFG: Record<PrioridadNC, { color: string; bg: string; label: string }> = {
  [PrioridadNC.Baja]:    { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",  label: "Baja"    },
  [PrioridadNC.Media]:   { color: "#FCD34D", bg: "rgba(245,158,11,0.08)", label: "Media"   },
  [PrioridadNC.Alta]:    { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",  label: "Alta"    },
  [PrioridadNC.Critica]: { color: "#F87171", bg: "rgba(239,68,68,0.15)",  label: "CRÍTICA" },
};
const ACCION_CFG: Record<string, { color: string; bg: string; label: string }> = {
  Pendiente:  { color: "#FCD34D", bg: "rgba(245,158,11,0.08)", label: "Pendiente"  },
  EnCurso:    { color: "#93C5FD", bg: "rgba(59,130,246,0.08)", label: "En curso"   },
  Completada: { color: "#86EFAC", bg: "rgba(34,197,94,0.06)",  label: "Completada" },
};
const TRANSICIONES: Partial<Record<EstadoNC, EstadoNC[]>> = {
  [EstadoNC.Abierta]:     [EstadoNC.EnAnalisis, EstadoNC.Anulada],
  [EstadoNC.EnAnalisis]:  [EstadoNC.EnEjecucion, EstadoNC.Anulada],
  [EstadoNC.EnEjecucion]: [EstadoNC.Cerrada, EstadoNC.EnAnalisis],
};
const ESTADO_ORDEN = [EstadoNC.Abierta, EstadoNC.EnAnalisis, EstadoNC.EnEjecucion, EstadoNC.Cerrada];

// ─── BADGE ───────────────────────────────────────────────────────────────────

function NCBadge({ label, color, bg, dot }: { label: string; color: string; bg: string; dot?: string }) {
  return (
    <span className="nc-badge" style={{ background: bg, color }}>
      {dot && <span className="nc-badge-dot" style={{ background: dot }} />}
      {label}
    </span>
  );
}

// ─── SECCIÓN ──────────────────────────────────────────────────────────────────

function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="nc-section">
      <div className="nc-section-header">
        <h3 className="nc-section-title">{title}</h3>
        {action}
      </div>
      <div className="nc-section-body">{children}</div>
    </div>
  );
}

// ─── DATACELL ──────────────────────────────────────────────────────────────────

function DataCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="nc-datacell">
      <p className="nc-datacell-label">{label}</p>
      <div className="nc-datacell-val">{children}</div>
    </div>
  );
}

// ─── LÍNEA DE TIEMPO ─────────────────────────────────────────────────────────

function LineaTiempo({ estadoActual }: { estadoActual: EstadoNC }) {
  const anulada   = estadoActual === EstadoNC.Anulada;
  const idxActual = ESTADO_ORDEN.indexOf(estadoActual);
  return (
    <div className="nc-timeline">
      {ESTADO_ORDEN.map((estado, i) => {
        const pasado = anulada ? false : i < idxActual;
        const activo = anulada ? false : i === idxActual;
        const cfg    = ESTADO_CFG[estado];
        return (
          <div key={estado} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div className="nc-tl-step">
              <div className="nc-tl-circle" style={{
                background: pasado || activo ? cfg.bg  : "rgba(255,255,255,0.04)",
                border: `2px solid ${pasado || activo ? cfg.dot : "rgba(255,255,255,0.07)"}`,
              }}>
                {pasado
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={cfg.dot} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  : activo ? <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: cfg.dot, display: "block" }} />
                  : null
                }
              </div>
              <span className="nc-tl-label" style={{ color: activo ? cfg.color : pasado ? "#475569" : "#2D3748" }}>
                {EstadoNCLabels[estado]}
              </span>
            </div>
            {i < ESTADO_ORDEN.length - 1 && (
              <div className="nc-tl-line" style={{ background: pasado ? cfg.dot + "50" : "rgba(255,255,255,0.05)" }} />
            )}
          </div>
        );
      })}
      {anulada && (
        <div className="nc-tl-anulada">
          <div className="nc-tl-circle" style={{ background: ESTADO_CFG[EstadoNC.Anulada].bg, border: `2px solid ${ESTADO_CFG[EstadoNC.Anulada].dot}` }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ESTADO_CFG[EstadoNC.Anulada].dot} strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
          <span className="nc-tl-label" style={{ color: "#475569" }}>Anulada</span>
        </div>
      )}
    </div>
  );
}

// ─── MODAL CAMBIO ESTADO ─────────────────────────────────────────────────────

function ModalCambioEstado({ actual, destino, onClose, onConfirm, saving }: {
  actual: EstadoNC; destino: EstadoNC;
  onClose: () => void;
  onConfirm: (cmd: Omit<CambiarEstadoCommand, "ncId">) => void;
  saving: boolean;
}) {
  const [comentario, setComentario] = useState("");
  const [causaRaiz,  setCausaRaiz]  = useState("");
  const cfgDest       = ESTADO_CFG[destino];
  const necesitaCausa = destino === EstadoNC.EnEjecucion;
  const valid = necesitaCausa ? causaRaiz.trim().length > 5 : true;

  return (
    <Modal open onClose={onClose}
      title={`Cambiar estado → ${EstadoNCLabels[destino]}`}
      icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      iconColor={cfgDest.dot}
      size="sm"
      footer={
        <ModalFooter onCancel={onClose}
          onConfirm={() => onConfirm({ nuevoEstado: destino, causaRaiz: causaRaiz || undefined, comentario: comentario || undefined })}
          loading={saving} disabled={!valid}
          confirmLabel={`→ ${EstadoNCLabels[destino]}`} />
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {necesitaCausa && (
          <div className="nc-causa-needed">
            Pasar a "En ejecución" requiere documentar la causa raíz identificada.
          </div>
        )}
        {necesitaCausa && (
          <TextAreaField label="Causa raíz" required rows={3}
            placeholder="Describe la causa raíz identificada…"
            value={causaRaiz} onChange={e => setCausaRaiz(e.target.value)} />
        )}
        <TextAreaField label="Comentario (opcional)" rows={2}
          placeholder="Observaciones sobre el cambio de estado…"
          value={comentario} onChange={e => setComentario(e.target.value)} />
      </div>
    </Modal>
  );
}

// ─── MODAL NUEVA ACCIÓN ───────────────────────────────────────────────────────

function ModalNuevaAccion({ onClose, onConfirm, saving }: {
  onClose: () => void;
  onConfirm: (cmd: Omit<AgregarAccionCommand, "ncId">) => void;
  saving: boolean;
}) {
  const [desc,  setDesc]  = useState("");
  const [resp,  setResp]  = useState("");
  const [fecha, setFecha] = useState("");
  const minDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const valid   = desc.trim() && resp.trim() && fecha;
  return (
    <Modal open onClose={onClose}
      title="Nueva acción correctiva"
      icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      size="sm"
      footer={
        <ModalFooter onCancel={onClose}
          onConfirm={() => onConfirm({ descripcion: desc, responsable: resp, fechaCompromiso: fecha })}
          loading={saving} disabled={!valid}
          confirmLabel="Agregar acción" />
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <TextAreaField label="Descripción de la acción" required rows={3}
          placeholder="Qué se va a hacer, cómo y con qué recursos…"
          value={desc} onChange={e => setDesc(e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <TextField label="Responsable" required placeholder="Nombre y área"
            value={resp} onChange={e => setResp(e.target.value)} />
          <DateField label="Fecha compromiso" required min={minDate}
            value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

// ─── TIPO MODAL ───────────────────────────────────────────────────────────────

type ModalType = { tipo: "estado"; destino: EstadoNC } | { tipo: "accion" } | null;

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function DetalleNoConformidadPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [nc,      setNc]      = useState<NoConformidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [modal,   setModal]   = useState<ModalType>(null);
  const [saving,  setSaving]  = useState(false);
  const [comentario,       setComentario]       = useState("");
  const [savingComentario, setSavingComentario] = useState(false);
  const [activeTab, setActiveTab] = useState<"acciones" | "comentarios">("acciones");

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        let data: NoConformidad;
        if (isMock) {
          data = (MOCK_NC as NoConformidad[]).find(n => n.id === id) ?? (MOCK_NC as NoConformidad[])[0];
          if (!data) throw new Error("NC no encontrada.");
        } else {
          data = await noConformidadesService.getById(id!);
        }
        setNc(data);
      } catch {
        setError("No se pudo cargar la no conformidad.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="nc-state-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"
        style={{ animation: "spin 0.8s linear infinite" }}>
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p className="nc-loading-text">Cargando no conformidad…</p>
    </div>
  );

  if (error || !nc) return (
    <div className="nc-state-center">
      <p className="nc-error-text">{error ?? "NC no encontrada."}</p>
      <button className="nc-back-link" onClick={() => navigate("/no-conformidades")}>
        Volver a no conformidades
      </button>
    </div>
  );

  const cfg          = ESTADO_CFG[nc.estado];
  const prioridadCfg = PRIORIDAD_CFG[nc.prioridad];
  const transiciones = TRANSICIONES[nc.estado] ?? [];
  const cerrada      = nc.estado === EstadoNC.Cerrada || nc.estado === EstadoNC.Anulada;
  const diasAbierta  = calcDiasAbierta(nc.fechaDeteccion, nc.fechaCierre);
  const accionesCompletadas = nc.accionesCorrectivas.filter(a => a.estado === "Completada").length;
  const accionesPct = nc.accionesCorrectivas.length > 0
    ? Math.round((accionesCompletadas / nc.accionesCorrectivas.length) * 100) : 0;

  // handlers
  const handleCambioEstado = async (cmd: Omit<CambiarEstadoCommand, "ncId">) => {
    setSaving(true);
    try {
      if (!isMock) await noConformidadesService.cambiarEstado({ ncId: nc.id, ...cmd });
      else await new Promise(r => setTimeout(r, 700));
      setNc(prev => {
        if (!prev) return null;
        const nuevoComentario: ComentarioNC | null = cmd.comentario
          ? { id: `com-${Date.now()}`, texto: cmd.comentario, autor: "Usuario actual", fechaRegistro: new Date().toISOString() }
          : null;
        return {
          ...prev, estado: cmd.nuevoEstado,
          causaRaiz: cmd.causaRaiz ?? prev.causaRaiz,
          comentarios: nuevoComentario ? [...prev.comentarios, nuevoComentario] : prev.comentarios,
        };
      });
      setModal(null);
    } catch { setError("No se pudo cambiar el estado."); }
    finally { setSaving(false); }
  };

  const handleAgregarAccion = async (cmd: Omit<AgregarAccionCommand, "ncId">) => {
    setSaving(true);
    try {
      if (!isMock) await noConformidadesService.agregarAccion({ ncId: nc.id, ...cmd });
      else await new Promise(r => setTimeout(r, 600));
      setNc(prev => prev ? {
        ...prev, accionesCorrectivas: [...prev.accionesCorrectivas, {
          id: `ac-${Date.now()}`, descripcion: cmd.descripcion,
          responsable: cmd.responsable, fechaCompromiso: cmd.fechaCompromiso,
          estado: "Pendiente" as const,
        }],
      } : null);
      setModal(null);
    } catch { setError("No se pudo agregar la acción."); }
    finally { setSaving(false); }
  };

  const handleComentario = async () => {
    if (!comentario.trim()) return;
    setSavingComentario(true);
    try {
      const nuevo: ComentarioNC = isMock
        ? { id: `com-${Date.now()}`, texto: comentario, autor: "Usuario actual", fechaRegistro: new Date().toISOString() }
        : await noConformidadesService.agregarComentario(nc.id, comentario);
      setNc(prev => prev ? { ...prev, comentarios: [...prev.comentarios, nuevo] } : null);
      setComentario("");
    } catch { setError("No se pudo agregar el comentario."); }
    finally { setSavingComentario(false); }
  };

  return (
    <div className="nc-page">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="nc-hero">
        <div className="nc-hero-top">
          <button className="nc-back-btn" onClick={() => navigate("/no-conformidades")} aria-label="Volver">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <p className="nc-numero-hero">{nc.numero}</p>
            <div className="nc-hero-badges">
              <NCBadge label={EstadoNCLabels[nc.estado]} color={cfg.color} bg={cfg.bg} dot={cfg.dot} />
              <span className="nc-prioridad-pill" style={{ background: prioridadCfg.bg, color: prioridadCfg.color }}>
                {prioridadCfg.label}
              </span>
              {isMock && (
                <span style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
                  ⚙ Demo
                </span>
              )}
            </div>
          </div>
        </div>

        <h1 className="nc-titulo-hero">{nc.titulo}</h1>
        <p className="nc-meta-hero">
          {TipoNCLabels[nc.tipo]} · Detectada {diasDesde(nc.fechaDeteccion)}
          {nc.proveedorNombre && ` · ${nc.proveedorNombre}`}
        </p>

        <LineaTiempo estadoActual={nc.estado} />

        {nc.accionesCorrectivas.length > 0 && (
          <div className="nc-capa-bar-wrap">
            <div className="nc-capa-bar-header">
              <p className="nc-capa-label">Progreso CAPA</p>
              <p className="nc-capa-pct" style={{ color: accionesPct === 100 ? "#86EFAC" : "#64748B" }}>
                {accionesCompletadas}/{nc.accionesCorrectivas.length} · {accionesPct}%
              </p>
            </div>
            <div className="nc-capa-track">
              <div className="nc-capa-fill"
                style={{ width: `${accionesPct}%`, background: accionesPct === 100 ? "#22C55E" : "#F59E0B" }} />
            </div>
          </div>
        )}

        {/* Botones de transición */}
        {!cerrada && transiciones.length > 0 && (
          <div className="nc-transiciones" style={{ marginTop: "1rem" }}>
            {transiciones.map(sig => {
              const c = ESTADO_CFG[sig];
              return (
                <button key={sig} className="nc-trans-btn"
                  style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                  onClick={() => setModal({ tipo: "estado", destino: sig })}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  {EstadoNCLabels[sig]}
                </button>
              );
            })}
          </div>
        )}

        <p style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", marginTop: "0.875rem" }}>
          Res. 2674/2013 — INVIMA
        </p>
      </div>

      {/* ── GRID DE CONTENIDO ─────────────────────────────────────────────────── */}
      <div className="nc-content-grid">

        {/* ── COLUMNA IZQUIERDA ── */}
        <div className="nc-col nc-col-left">

          {/* Información general */}
          <Section title="Información general">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "var(--text-sm)", color: "#94A3B8", lineHeight: 1.6 }}>{nc.descripcion}</p>
              <div className="nc-datacell-grid">
                <DataCell label="Tipo">{TipoNCLabels[nc.tipo]}</DataCell>
                <DataCell label="Prioridad">
                  <span style={{ color: prioridadCfg.color }}>{prioridadCfg.label}</span>
                </DataCell>
                <DataCell label="Detectado por">{nc.detectadoPor}</DataCell>
                <DataCell label="Asignado a">{nc.asignadoA ?? "—"}</DataCell>
                <DataCell label="Detección">{formatDate(nc.fechaDeteccion)}</DataCell>
                <DataCell label="Límite">
                  <span style={{ color: isVencida(nc.fechaLimite) && !cerrada ? "#FCA5A5" : "#94A3B8" }}>
                    {formatDate(nc.fechaLimite)}
                  </span>
                </DataCell>
                {nc.fechaCierre && <DataCell label="Cerrada">{formatDate(nc.fechaCierre)}</DataCell>}
                <DataCell label="Días abierta">
                  <span style={{ fontFamily: "var(--font-mono)" }}>{diasAbierta === 0 ? "—" : `${diasAbierta}d`}</span>
                </DataCell>
              </div>
            </div>
          </Section>

          {/* Causa raíz */}
          <Section title="Causa raíz">
            {nc.causaRaiz
              ? <p style={{ fontSize: "var(--text-sm)", color: "#94A3B8", lineHeight: 1.6 }}>{nc.causaRaiz}</p>
              : <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                  Pendiente de análisis — se requiere al pasar a "En ejecución".
                </p>
            }
          </Section>

          {/* Referencias */}
          {(nc.numeroRecepcion || nc.numeroLote || nc.itemNombre) && (
            <Section title="Referencias">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {nc.numeroRecepcion && (
                  <a href={`/recepciones/${nc.recepcionId}`} className="nc-ref-link">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 3h14a2 2 0 012 2v3H3V5a2 2 0 012-2zM3 8h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    <div>
                      <p className="nc-ref-sub">Recepción</p>
                      <p className="nc-ref-num">{nc.numeroRecepcion}</p>
                    </div>
                  </a>
                )}
                {nc.numeroLote && (
                  <a href={`/lotes/${nc.loteId}`} className="nc-ref-link">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                    </svg>
                    <div>
                      <p className="nc-ref-sub">Lote · {nc.itemNombre}</p>
                      <p className="nc-ref-num">{nc.numeroLote}</p>
                    </div>
                  </a>
                )}
              </div>
            </Section>
          )}

        </div>

        {/* ── COLUMNA DERECHA ── */}
        <div className="nc-col nc-col-right">

          <Section
            title="Acciones correctivas / CAPA"
            action={
              !cerrada
                ? <Button variant="ghost" size="sm" onClick={() => setModal({ tipo: "accion" })}
                    iconLeft="M12 5v14M5 12h14">
                    Nueva acción
                  </Button>
                : undefined
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Tabs */}
              <div className="nc-tabs">
                {([
                  { key: "acciones",    label: `Acciones (${nc.accionesCorrectivas.length})` },
                  { key: "comentarios", label: `Comentarios (${nc.comentarios.length})` },
                ] as const).map(t => (
                  <button key={t.key} className="nc-tab" data-active={activeTab === t.key}
                    onClick={() => setActiveTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Acciones */}
              {activeTab === "acciones" && (
                nc.accionesCorrectivas.length === 0
                  ? <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", textAlign: "center", padding: "1rem" }}>Sin acciones correctivas registradas.</p>
                  : nc.accionesCorrectivas.map((ac, i) => {
                      const c = ACCION_CFG[ac.estado] ?? ACCION_CFG["Pendiente"];
                      return (
                        <div key={ac.id} className="nc-accion-card">
                          <div className="nc-accion-top">
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", flex: 1 }}>
                              <span className="nc-accion-idx">{i + 1}</span>
                              <span className="nc-accion-desc">{ac.descripcion}</span>
                            </div>
                            <NCBadge label={c.label} color={c.color} bg={c.bg} />
                          </div>
                          <div className="nc-accion-meta">
                            <span className="nc-accion-meta-item">👤 {ac.responsable}</span>
                            <span className="nc-accion-meta-item">📅 {formatDate(ac.fechaCompromiso)}</span>
                            {ac.fechaCierre && <span className="nc-accion-meta-item">✓ {formatDate(ac.fechaCierre)}</span>}
                          </div>
                        </div>
                      );
                    })
              )}

              {/* Comentarios */}
              {activeTab === "comentarios" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {nc.comentarios.length === 0
                    ? <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", textAlign: "center", padding: "1rem" }}>Sin comentarios.</p>
                    : <div className="nc-comment-list">
                        {nc.comentarios.map(c => (
                          <div key={c.id} className="nc-comment">
                            <p className="nc-comment-autor">{c.autor}</p>
                            <p className="nc-comment-texto">{c.texto}</p>
                            <p className="nc-comment-fecha">{formatDateTime(c.fechaRegistro)}</p>
                          </div>
                        ))}
                      </div>
                  }
                  {/* Input nuevo comentario */}
                  <div className="nc-comment-form">
                    <textarea
                      className="nc-comment-input"
                      value={comentario}
                      onChange={e => setComentario(e.target.value)}
                      placeholder="Agregar comentario de seguimiento…"
                      rows={2}
                    />
                    <Button variant="primary" size="sm" loading={savingComentario}
                      disabled={!comentario.trim()} onClick={handleComentario}>
                      Enviar
                    </Button>
                  </div>
                </div>
              )}

              <p className="nc-norm-note">
                Las acciones correctivas documentadas forman parte del programa CAPA requerido por
                la Res. 2674/2013 Art. 28 y los lineamientos de trazabilidad INVIMA.
              </p>
            </div>
          </Section>

        </div>
      </div>

      {/* ── MODALES ──────────────────────────────────────────────────────────── */}
      {modal?.tipo === "estado" && (
        <ModalCambioEstado
          actual={nc.estado}
          destino={(modal as { tipo: "estado"; destino: EstadoNC }).destino}
          onClose={() => setModal(null)}
          onConfirm={handleCambioEstado}
          saving={saving}
        />
      )}
      {modal?.tipo === "accion" && (
        <ModalNuevaAccion
          onClose={() => setModal(null)}
          onConfirm={handleAgregarAccion}
          saving={saving}
        />
      )}
    </div>
  );
}