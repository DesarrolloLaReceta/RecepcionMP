import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  noConformidadesService,
  type NoConformidad,
  type ComentarioNC,
  EstadoNC, EstadoNCLabels,
  PrioridadNC, PrioridadNCLabels,
  TipoNC, TipoNCLabels,
  type CambiarEstadoCommand,
  type AgregarAccionCommand,
} from "../../Services/no-conformidades.service";
import { MOCK_NC } from "./MockData";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function isVencida(fecha?: string) {
  if (!fecha) return false;
  return new Date(fecha) < new Date();
}
function diasDesde(iso: string) {
  const d = Math.ceil((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d === 0 ? "Hoy" : `Hace ${d}d`;
}
/** Días que lleva abierta la NC (desde detección hasta cierre o ahora). */
function calcDiasAbierta(fechaDeteccion: string, fechaCierre?: string): number {
  const desde = new Date(fechaDeteccion).getTime();
  const hasta = fechaCierre ? new Date(fechaCierre).getTime() : Date.now();
  return Math.ceil((hasta - desde) / 86_400_000);
}

// ─── CONFIG VISUAL ────────────────────────────────────────────────────────────

const ESTADO_CFG: Record<EstadoNC, { color: string; bg: string; dot: string; border: string }> = {
  [EstadoNC.Abierta]:     { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",    dot: "#EF4444", border: "rgba(239,68,68,0.2)"    },
  [EstadoNC.EnAnalisis]:  { color: "#C4B5FD", bg: "rgba(168,85,247,0.08)",   dot: "#A855F7", border: "rgba(168,85,247,0.2)"   },
  [EstadoNC.EnEjecucion]: { color: "#FCD34D", bg: "rgba(245,158,11,0.08)",   dot: "#F59E0B", border: "rgba(245,158,11,0.2)"   },
  [EstadoNC.Cerrada]:     { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",    dot: "#22C55E", border: "rgba(34,197,94,0.2)"    },
  [EstadoNC.Anulada]:     { color: "#94A3B8", bg: "rgba(100,116,139,0.08)",  dot: "#64748B", border: "rgba(100,116,139,0.15)" },
};

// Colores por prioridad (equivale a la anterior "severidad")
const PRIORIDAD_CFG: Record<PrioridadNC, { color: string; bg: string; label: string }> = {
  [PrioridadNC.Baja]:    { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",  label: "Baja"    },
  [PrioridadNC.Media]:   { color: "#FCD34D", bg: "rgba(245,158,11,0.08)", label: "Media"   },
  [PrioridadNC.Alta]:    { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",  label: "Alta"    },
  [PrioridadNC.Critica]: { color: "#F87171", bg: "rgba(239,68,68,0.15)",  label: "CRÍTICA" },
};

// Keys alineadas a EstadoAccion: "Pendiente" | "EnCurso" | "Completada"
const ACCION_CFG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  Pendiente:  { color: "#FCD34D", bg: "rgba(245,158,11,0.08)", icon: "M12 8v4l3 3",          label: "Pendiente"  },
  EnCurso:    { color: "#93C5FD", bg: "rgba(59,130,246,0.08)", icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "En curso"  },
  Completada: { color: "#86EFAC", bg: "rgba(34,197,94,0.06)",  icon: "M20 6L9 17l-5-5",       label: "Completada" },
};

// Transiciones de estado válidas
const TRANSICIONES: Partial<Record<EstadoNC, EstadoNC[]>> = {
  [EstadoNC.Abierta]:     [EstadoNC.EnAnalisis,  EstadoNC.Anulada],
  [EstadoNC.EnAnalisis]:  [EstadoNC.EnEjecucion, EstadoNC.Anulada],
  [EstadoNC.EnEjecucion]: [EstadoNC.Cerrada,     EstadoNC.EnAnalisis],
};

// Orden de la línea de tiempo principal (Anulada es estado aparte)
const ESTADO_ORDEN = [
  EstadoNC.Abierta,
  EstadoNC.EnAnalisis,
  EstadoNC.EnEjecucion,
  EstadoNC.Cerrada,
];

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-[11px] font-bold tracking-[0.25em] uppercase font-mono text-[#64748B]">
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function DataCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p className="text-[10px] text-[#334155] uppercase tracking-wider font-mono">{label}</p>
      <div className="text-[13px] text-[#94A3B8]">{children}</div>
    </div>
  );
}

// ─── LÍNEA DE TIEMPO ──────────────────────────────────────────────────────────

function LineaTiempo({ estadoActual }: { estadoActual: EstadoNC }) {
  const anulada   = estadoActual === EstadoNC.Anulada;
  const idxActual = ESTADO_ORDEN.indexOf(estadoActual);

  return (
    <div className="flex items-center gap-0 py-2">
      {ESTADO_ORDEN.map((estado, i) => {
        const pasado = anulada ? false : i < idxActual;
        const activo = anulada ? false : i === idxActual;
        const cfg    = ESTADO_CFG[estado];

        return (
          <div key={estado} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: pasado || activo ? cfg.bg    : "rgba(255,255,255,0.04)",
                  border:     `2px solid ${pasado || activo ? cfg.dot : "rgba(255,255,255,0.07)"}`,
                }}>
                {pasado
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke={cfg.dot} strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  : activo
                    ? <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                    : null
                }
              </div>
              <span className="text-[9px] font-mono tracking-wider hidden sm:block"
                style={{ color: activo ? cfg.color : pasado ? "#475569" : "#2D3748" }}>
                {EstadoNCLabels[estado].toUpperCase()}
              </span>
            </div>
            {i < ESTADO_ORDEN.length - 1 && (
              <div className="h-px flex-1 mx-1 mb-4 transition-all"
                style={{ background: pasado ? cfg.dot + "60" : "rgba(255,255,255,0.05)" }} />
            )}
          </div>
        );
      })}

      {/* Anulada — estado aparte fuera del flujo normal */}
      {anulada && (
        <div className="flex flex-col items-center gap-1.5 ml-4">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: ESTADO_CFG[EstadoNC.Anulada].bg,
              border:     `2px solid ${ESTADO_CFG[EstadoNC.Anulada].dot}`,
            }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke={ESTADO_CFG[EstadoNC.Anulada].dot} strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
          <span className="text-[9px] font-mono text-[#475569]">ANULADA</span>
        </div>
      )}
    </div>
  );
}

// ─── MODAL CAMBIO DE ESTADO ───────────────────────────────────────────────────

function ModalCambioEstado({ actual, destino, onClose, onConfirm, saving }: {
  actual:    EstadoNC;
  destino:   EstadoNC;
  onClose:   () => void;
  onConfirm: (cmd: Omit<CambiarEstadoCommand, "ncId">) => void;
  saving:    boolean;
}) {
  const [comentario, setComentario] = useState("");
  const [causaRaiz,  setCausaRaiz]  = useState("");
  const cfgDest      = ESTADO_CFG[destino];
  const necesitaCausa = destino === EstadoNC.EnEjecucion;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }`}</style>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[#475569]">{EstadoNCLabels[actual]}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span style={{ color: cfgDest.color }}>{EstadoNCLabels[destino]}</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569]"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {necesitaCausa && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]">
                Causa raíz identificada <span className="text-[#FCA5A5]">*</span>
              </label>
              <textarea value={causaRaiz} onChange={e => setCausaRaiz(e.target.value)}
                rows={3} placeholder="Describe la causa raíz del problema para poder pasar a ejecución…"
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)")}
                onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]">
              Comentario{necesitaCausa ? "" : " (opcional)"}
            </label>
            <textarea value={comentario} onChange={e => setComentario(e.target.value)}
              rows={2} placeholder="Agrega contexto sobre el cambio de estado…"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
              onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm({
              nuevoEstado: destino,
              causaRaiz:   causaRaiz  || undefined,
              comentario:  comentario || undefined,
            })}
            disabled={saving || (necesitaCausa && !causaRaiz.trim())}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: cfgDest.bg, border: `1px solid ${cfgDest.border}`, color: cfgDest.color }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Guardando…</>
              : `→ ${EstadoNCLabels[destino]}`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL NUEVA ACCIÓN ───────────────────────────────────────────────────────

function ModalNuevaAccion({ onClose, onConfirm, saving }: {
  onClose:   () => void;
  onConfirm: (cmd: Omit<AgregarAccionCommand, "ncId">) => void;
  saving:    boolean;
}) {
  const [desc,  setDesc]  = useState("");
  const [resp,  setResp]  = useState("");
  const [fecha, setFecha] = useState("");
  const minDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const valid   = desc.trim() && resp.trim() && fecha;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }`}</style>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-[15px] font-bold text-white">Nueva acción correctiva</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569]"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]">
              Descripción <span className="text-[#FCA5A5]">*</span>
            </label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              rows={3} placeholder="Qué se va a hacer, cómo y con qué objetivo…"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
              onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]">
                Responsable <span className="text-[#FCA5A5]">*</span>
              </label>
              <input value={resp} onChange={e => setResp(e.target.value)}
                placeholder="Nombre o cargo"
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
                onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]">
                Fecha compromiso <span className="text-[#FCA5A5]">*</span>
              </label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                min={minDate}
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
                onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">
            Cancelar
          </button>
          <button onClick={() => onConfirm({ descripcion: desc, responsable: resp, fechaCompromiso: fecha })}
            disabled={saving || !valid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "#F59E0B", color: "#000" }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Guardando…</>
              : "Agregar acción"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

type ModalType = { tipo: "estado"; destino: EstadoNC } | { tipo: "accion" } | null;

export default function DetalleNoConformidadPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();

  const [nc,      setNc]      = useState<NoConformidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [modal,   setModal]   = useState<ModalType>(null);
  const [saving,  setSaving]  = useState(false);

  const [comentario,       setComentario]       = useState("");
  const [savingComentario, setSavingComentario] = useState(false);
  const [activeTab,        setActiveTab]        = useState<"acciones" | "comentarios">("acciones");

  // Carga inicial
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let data: NoConformidad;
        if (isMock) {
          // MOCK_NC es un array — busca por id o toma el primero
          data = (MOCK_NC as NoConformidad[]).find(n => n.id === id) ?? (MOCK_NC as NoConformidad[])[0];
          if (!data) throw new Error("NC no encontrada en datos mock.");
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
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#475569] text-xs font-mono">Cargando no conformidad…</p>
      </div>
    </div>
  );

  if (error || !nc) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-red-400 text-sm">{error ?? "NC no encontrada."}</p>
      <button onClick={() => navigate("/no-conformidades")} className="text-[#F59E0B] text-sm underline">
        Volver a no conformidades
      </button>
    </div>
  );

  // ── Datos derivados ────────────────────────────────────────────────────────
  const cfg         = ESTADO_CFG[nc.estado];
  const prioridadCfg = PRIORIDAD_CFG[nc.prioridad];
  const transiciones = TRANSICIONES[nc.estado] ?? [];
  const cerrada     = nc.estado === EstadoNC.Cerrada || nc.estado === EstadoNC.Anulada;
  const diasAbierta = calcDiasAbierta(nc.fechaDeteccion, nc.fechaCierre);

  const accionesCompletadas = nc.accionesCorrectivas.filter(a => a.estado === "Completada").length;
  const accionesPct = nc.accionesCorrectivas.length > 0
    ? Math.round((accionesCompletadas / nc.accionesCorrectivas.length) * 100)
    : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCambioEstado = async (cmd: Omit<CambiarEstadoCommand, "ncId">) => {
    setSaving(true);
    try {
      if (!isMock) {
        await noConformidadesService.cambiarEstado({ ncId: nc.id, ...cmd });
      } else {
        await new Promise(r => setTimeout(r, 700));
      }
      // Actualización optimista
      setNc(prev => {
        if (!prev) return null;
        const nuevoComentario: ComentarioNC | null = cmd.comentario
          ? { id: `com-${Date.now()}`, texto: cmd.comentario, autor: "Usuario actual", fechaRegistro: new Date().toISOString() }
          : null;
        return {
          ...prev,
          estado:    cmd.nuevoEstado,
          causaRaiz: cmd.causaRaiz ?? prev.causaRaiz,
          comentarios: nuevoComentario
            ? [...prev.comentarios, nuevoComentario]
            : prev.comentarios,
        };
      });
      setModal(null);
    } catch {
      setError("No se pudo cambiar el estado.");
    } finally {
      setSaving(false);
    }
  };

  const handleAgregarAccion = async (cmd: Omit<AgregarAccionCommand, "ncId">) => {
    setSaving(true);
    try {
      if (!isMock) {
        await noConformidadesService.agregarAccion({ ncId: nc.id, ...cmd });
      } else {
        await new Promise(r => setTimeout(r, 600));
      }
      setNc(prev => prev ? {
        ...prev,
        accionesCorrectivas: [
          ...prev.accionesCorrectivas,
          {
            id:              `ac-${Date.now()}`,
            descripcion:     cmd.descripcion,
            responsable:     cmd.responsable,
            fechaCompromiso: cmd.fechaCompromiso,
            estado:          "Pendiente" as const,
          },
        ],
      } : null);
      setModal(null);
    } catch {
      setError("No se pudo agregar la acción.");
    } finally {
      setSaving(false);
    }
  };

  const handleCerrarAccion = async (accionId: string) => {
    try {
      if (!isMock) {
        await noConformidadesService.cerrarAccion(nc.id, accionId);
      } else {
        await new Promise(r => setTimeout(r, 400));
      }
      setNc(prev => prev ? {
        ...prev,
        accionesCorrectivas: prev.accionesCorrectivas.map(a =>
          a.id === accionId
            ? { ...a, estado: "Completada" as const, fechaCierre: new Date().toISOString() }
            : a
        ),
      } : null);
    } catch {
      setError("No se pudo completar la acción.");
    }
  };

  const handleComentario = async () => {
    if (!comentario.trim()) return;
    setSavingComentario(true);
    try {
      let nuevo: ComentarioNC;
      if (!isMock) {
        nuevo = await noConformidadesService.agregarComentario(nc.id, comentario);
      } else {
        await new Promise(r => setTimeout(r, 400));
        nuevo = { id: `com-${Date.now()}`, texto: comentario, autor: "Usuario actual", fechaRegistro: new Date().toISOString() };
      }
      setNc(prev => prev ? { ...prev, comentarios: [...prev.comentarios, nuevo] } : null);
      setComentario("");
    } catch {
      setError("No se pudo enviar el comentario.");
    } finally {
      setSavingComentario(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto pb-8"
      style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* ── Navegación breadcrumb ── */}
      <div className="flex items-center gap-2 text-[12px] text-[#334155] font-mono">
        <button onClick={() => navigate("/no-conformidades")}
          className="hover:text-[#64748B] transition-colors">
          No Conformidades
        </button>
        <span>/</span>
        <span className="text-[#475569]">{nc.numero}</span>
      </div>

      {/* ── Header principal ── */}
      <div className="rounded-2xl p-6"
        style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Fila superior: badges + botones transición */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-[#475569]">{nc.numero}</span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: prioridadCfg.bg, color: prioridadCfg.color }}>
              {prioridadCfg.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
              style={{ background: cfg.bg, color: cfg.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {EstadoNCLabels[nc.estado].toUpperCase()}
            </span>
            {isVencida(nc.fechaLimite) && !cerrada && (
              <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono"
                style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5" }}>
                ⚠ VENCIDA
              </span>
            )}
          </div>

          {/* Botones de transición */}
          {!cerrada && transiciones.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {transiciones.map(sig => {
                const c = ESTADO_CFG[sig];
                return (
                  <button key={sig}
                    onClick={() => setModal({ tipo: "estado", destino: sig })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                    style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    {EstadoNCLabels[sig]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Título */}
        <h1 className="text-[22px] font-bold text-white leading-snug mb-1">
          {nc.titulo}
        </h1>
        <p className="text-[13px] text-[#475569] mb-5">
          {TipoNCLabels[nc.tipo]} · Detectada {diasDesde(nc.fechaDeteccion)}
          {nc.proveedorNombre && ` · ${nc.proveedorNombre}`}
        </p>

        {/* Línea de tiempo */}
        <LineaTiempo estadoActual={nc.estado} />

        {/* Barra CAPA */}
        {nc.accionesCorrectivas.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-[#334155] font-mono uppercase tracking-wider">Progreso CAPA</p>
              <p className="text-[11px] font-mono"
                style={{ color: accionesPct === 100 ? "#86EFAC" : "#64748B" }}>
                {accionesCompletadas}/{nc.accionesCorrectivas.length} acciones · {accionesPct}%
              </p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${accionesPct}%`, background: accionesPct === 100 ? "#22C55E" : "#F59E0B" }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Grid de contenido ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Columna izquierda ── */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* Información general */}
          <Section title="Información general">
            <div className="flex flex-col gap-5">
              <p className="text-[13px] text-[#94A3B8] leading-relaxed">{nc.descripcion}</p>
              <div className="grid grid-cols-2 gap-2">
                <DataCell label="Tipo">{TipoNCLabels[nc.tipo]}</DataCell>
                <DataCell label="Prioridad">
                  <span style={{ color: prioridadCfg.color }}>{prioridadCfg.label}</span>
                </DataCell>
                <DataCell label="Detectado por">
                  <span className="text-[12px]">{nc.detectadoPor}</span>
                </DataCell>
                <DataCell label="Asignado a">
                  <span className="text-[12px]">{nc.asignadoA ?? "—"}</span>
                </DataCell>
                <DataCell label="Detección">{fmtDate(nc.fechaDeteccion)}</DataCell>
                <DataCell label="Límite">
                  <span style={{ color: isVencida(nc.fechaLimite) && !cerrada ? "#FCA5A5" : "#94A3B8" }}>
                    {fmtDate(nc.fechaLimite)}
                  </span>
                </DataCell>
                {nc.fechaCierre && (
                  <DataCell label="Cerrada">{fmtDate(nc.fechaCierre)}</DataCell>
                )}
                <DataCell label="Días abierta">
                  <span className="font-mono">{diasAbierta === 0 ? "—" : `${diasAbierta}d`}</span>
                </DataCell>
              </div>
            </div>
          </Section>

          {/* Causa raíz */}
          <Section title="Causa raíz">
            {nc.causaRaiz
              ? <p className="text-[13px] text-[#94A3B8] leading-relaxed">{nc.causaRaiz}</p>
              : <p className="text-[12px] text-[#334155] italic">
                  Pendiente de análisis — se requiere al pasar a "En ejecución".
                </p>
            }
          </Section>

          {/* Referencias */}
          {(nc.numeroRecepcion || nc.numeroLote || nc.itemNombre) && (
            <Section title="Referencias">
              <div className="flex flex-col gap-2">
                {nc.numeroRecepcion && (
                  <a href={`/recepciones/${nc.recepcionId}`}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.2)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 3h14a2 2 0 012 2v3H3V5a2 2 0 012-2zM3 8h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    <div>
                      <p className="text-[10px] text-[#334155] font-mono">Recepción</p>
                      <p className="text-[12px] text-[#CBD5E1] font-medium">{nc.numeroRecepcion}</p>
                    </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="#475569" strokeWidth="2" strokeLinecap="round" className="ml-auto">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </a>
                )}
                {nc.numeroLote && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
                    </svg>
                    <div>
                      <p className="text-[10px] text-[#334155] font-mono">Lote</p>
                      <p className="text-[12px] text-[#CBD5E1] font-mono">{nc.numeroLote}</p>
                    </div>
                  </div>
                )}
                {nc.itemNombre && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                    </svg>
                    <div>
                      <p className="text-[10px] text-[#334155] font-mono">Ítem</p>
                      <p className="text-[12px] text-[#CBD5E1]">{nc.itemNombre}</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>

        {/* ── Columna derecha: CAPA + comentarios ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Tabs */}
          <div className="flex gap-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { key: "acciones",    label: `Acciones correctivas (${nc.accionesCorrectivas.length})` },
              { key: "comentarios", label: `Hilo de seguimiento (${nc.comentarios.length})`          },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as "acciones" | "comentarios")}
                className="px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 -mb-px"
                style={{
                  color:       activeTab === t.key ? "#F59E0B" : "#475569",
                  borderColor: activeTab === t.key ? "#F59E0B" : "transparent",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── ACCIONES CORRECTIVAS ── */}
          {activeTab === "acciones" && (
            <div className="flex flex-col gap-3">
              {nc.accionesCorrectivas.length === 0 && (
                <div className="rounded-2xl py-12 flex flex-col items-center justify-center gap-2"
                  style={{ background: "rgba(15,23,42,0.6)", border: "1px dashed rgba(255,255,255,0.06)" }}>
                  <p className="text-[#475569] text-sm">Sin acciones correctivas registradas.</p>
                  {!cerrada && (
                    <p className="text-[#334155] text-xs">Agrega acciones para avanzar en el cierre de esta NC.</p>
                  )}
                </div>
              )}

              {nc.accionesCorrectivas.map((ac, idx) => {
                const acCfg = ACCION_CFG[ac.estado] ?? ACCION_CFG["Pendiente"];
                const venc  = isVencida(ac.fechaCompromiso) && ac.estado !== "Completada";
                return (
                  <div key={ac.id} className="rounded-2xl overflow-hidden"
                    style={{
                      background: ac.estado === "Completada" ? "rgba(34,197,94,0.04)" : "rgba(15,23,42,0.85)",
                      border:     `1px solid ${ac.estado === "Completada" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)"}`,
                      animation:  `fadeSlideUp ${0.1 + idx * 0.05}s ease both`,
                    }}>
                    <div className="p-5">
                      {/* Header acción */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: acCfg.bg, color: acCfg.color }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d={acCfg.icon} />
                            </svg>
                          </div>
                          <p className="text-[14px] text-[#CBD5E1] leading-snug font-medium">
                            {ac.descripcion}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono shrink-0"
                          style={{ background: acCfg.bg, color: acCfg.color }}>
                          {acCfg.label.toUpperCase()}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#475569] mb-3">
                        <span>👤 {ac.responsable}</span>
                        <span style={{ color: venc ? "#FCA5A5" : "#475569" }}>
                          📅 Compromiso: {fmtDate(ac.fechaCompromiso)}{venc && " ⚠ vencida"}
                        </span>
                        {ac.fechaCierre && (
                          <span className="text-[#64748B]">✓ Cerrada: {fmtDate(ac.fechaCierre)}</span>
                        )}
                      </div>

                      {/* Evidencia */}
                      {ac.evidencia && (
                        <div className="rounded-xl p-3 text-[12px] text-[#86EFAC] leading-relaxed"
                          style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)" }}>
                          <span className="font-semibold">Evidencia: </span>
                          <span className="text-[#64748B]">{ac.evidencia}</span>
                        </div>
                      )}

                      {/* Acción completar */}
                      {ac.estado !== "Completada" && !cerrada && (
                        <button onClick={() => handleCerrarAccion(ac.id)}
                          className="mt-3 flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", color: "#86EFAC" }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.15)")}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.08)")}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          Marcar completada
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Botón agregar acción */}
              {!cerrada && (
                <button onClick={() => setModal({ tipo: "accion" })}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[13px] font-medium transition-all self-start"
                  style={{ background: "rgba(245,158,11,0.05)", border: "1px dashed rgba(245,158,11,0.2)", color: "#F59E0B" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.05)")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Agregar acción correctiva
                </button>
              )}
            </div>
          )}

          {/* ── HILO DE COMENTARIOS ── */}
          {activeTab === "comentarios" && (
            <div className="flex flex-col gap-4">
              {nc.comentarios.length === 0 && (
                <div className="rounded-2xl py-12 flex items-center justify-center"
                  style={{ background: "rgba(15,23,42,0.6)", border: "1px dashed rgba(255,255,255,0.06)" }}>
                  <p className="text-[#475569] text-sm">Sin comentarios. Sé el primero en agregar uno.</p>
                </div>
              )}

              {nc.comentarios.map((c: ComentarioNC, idx: number) => (
                <div key={c.id} className="flex gap-3"
                  style={{ animation: `fadeSlideUp ${0.1 + idx * 0.05}s ease both` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                    style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                    {c.autor.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[12px] font-semibold text-[#CBD5E1]">{c.autor}</span>
                      <span className="text-[10px] text-[#334155] font-mono">{fmtDateTime(c.fechaRegistro)}</span>
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-[13px] text-[#94A3B8] leading-relaxed"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {c.texto}
                    </div>
                  </div>
                </div>
              ))}

              {/* Input comentario */}
              {!cerrada && (
                <div className="flex gap-3 mt-2 pt-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                    style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                    T
                  </div>
                  <div className="flex-1 relative">
                    <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComentario(); } }}
                      rows={2}
                      placeholder="Agrega un comentario… (Enter para enviar, Shift+Enter nueva línea)"
                      className="w-full px-4 py-3 rounded-2xl text-[13px] outline-none resize-none pr-12"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#CBD5E1" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
                      onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
                    <button onClick={handleComentario}
                      disabled={savingComentario || !comentario.trim()}
                      className="absolute right-3 bottom-3 w-7 h-7 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all"
                      style={{ background: "rgba(245,158,11,0.15)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer normativa */}
      <div className="flex items-center justify-between pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[10px] text-[#1E293B] font-mono tracking-widest uppercase">
          Gestión de No Conformidades — Res. 2674/2013 — INVIMA
        </p>
        {isMock && <p className="text-[10px] text-[#1E293B] font-mono">⚙ Datos de demostración</p>}
      </div>

      {/* ── Modales ── */}
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