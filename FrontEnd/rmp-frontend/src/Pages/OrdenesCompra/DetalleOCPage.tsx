import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ordenesCompraService,
  type OrdenCompra,
  EstadoOC, EstadoOCLabels,
} from "../../Services/ordenes-compra.service";
import { MOCK_OC_DETALLE } from "./MockData";

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
function fmtCOP(val: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(val);
}
function isVencida(fecha?: string) {
  if (!fecha) return false;
  return new Date(fecha) < new Date();
}

// ─── CONFIGURACIÓN VISUAL ─────────────────────────────────────────────────────

const ESTADO_CFG: Record<EstadoOC, { color: string; bg: string; dot: string; border: string }> = {
  [EstadoOC.Abierta]:              { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",   dot: "#22C55E", border: "rgba(34,197,94,0.2)"   },
  [EstadoOC.ParcialmenteRecibida]: { color: "#FCD34D", bg: "rgba(245,158,11,0.08)",  dot: "#F59E0B", border: "rgba(245,158,11,0.2)"  },
  [EstadoOC.TotalmenteRecibida]:   { color: "#93C5FD", bg: "rgba(59,130,246,0.08)",  dot: "#3B82F6", border: "rgba(59,130,246,0.2)"  },
  [EstadoOC.Cerrada]:              { color: "#94A3B8", bg: "rgba(100,116,139,0.08)", dot: "#64748B", border: "rgba(100,116,139,0.15)" },
  [EstadoOC.Cancelada]:            { color: "#94A3B8", bg: "rgba(100,116,139,0.06)", dot: "#475569", border: "rgba(100,116,139,0.12)" },
  [EstadoOC.Vencida]:              { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",   dot: "#EF4444", border: "rgba(239,68,68,0.2)"   },
};

// Pasos de la línea de tiempo
const TIMELINE_PASOS = [
  EstadoOC.Abierta,
  EstadoOC.ParcialmenteRecibida,
  EstadoOC.TotalmenteRecibida,
  EstadoOC.Cerrada,
];

// Qué acciones están disponibles por estado
const ACCIONES_POR_ESTADO: Partial<Record<EstadoOC, { key: string; label: string; color: string; bg: string; border: string }[]>> = {
  [EstadoOC.Abierta]: [
    { key: "aprobar",  label: "Aprobar OC",   color: "#86EFAC", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"   },
    { key: "cancelar", label: "Cancelar OC",  color: "#FCA5A5", bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.15)"  },
  ],
  [EstadoOC.TotalmenteRecibida]: [
    { key: "cerrar",   label: "Cerrar OC",    color: "#94A3B8", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.15)" },
  ],
};

// ─── LÍNEA DE TIEMPO ──────────────────────────────────────────────────────────

function LineaTiempo({ estado }: { estado: EstadoOC }) {
  const cancelada = estado === EstadoOC.Cancelada || estado === EstadoOC.Vencida;
  const idxActual = TIMELINE_PASOS.indexOf(estado);

  return (
    <div className="flex items-center">
      {TIMELINE_PASOS.map((paso, i) => {
        const pasado = !cancelada && i < idxActual;
        const activo = !cancelada && i === idxActual;
        const c = ESTADO_CFG[paso];
        return (
          <div key={paso} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: pasado || activo ? c.bg : "rgba(255,255,255,0.04)",
                  border: `2px solid ${pasado || activo ? c.dot : "rgba(255,255,255,0.07)"}`,
                }}>
                {pasado
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke={c.dot} strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  : activo
                    ? <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                    : null
                }
              </div>
              <span className="text-[9px] font-mono tracking-wide hidden sm:block"
                style={{ color: activo ? c.color : pasado ? "#334155" : "#1E293B" }}>
                {EstadoOCLabels[paso].toUpperCase()}
              </span>
            </div>
            {i < TIMELINE_PASOS.length - 1 && (
              <div className="h-px flex-1 mx-1 mb-4 transition-all"
                style={{ background: pasado ? c.dot + "50" : "rgba(255,255,255,0.05)" }} />
            )}
          </div>
        );
      })}

      {/* Estado terminal aparte */}
      {cancelada && (
        <div className="flex flex-col items-center gap-1.5 ml-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: ESTADO_CFG[estado].bg, border: `2px solid ${ESTADO_CFG[estado].dot}` }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke={ESTADO_CFG[estado].dot} strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
          <span className="text-[9px] font-mono" style={{ color: ESTADO_CFG[estado].color }}>
            {EstadoOCLabels[estado].toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── MODAL CONFIRMAR ACCIÓN ───────────────────────────────────────────────────

function ModalConfirmar({ accion, onClose, onConfirm, saving }: {
  accion: { key: string; label: string; color: string; bg: string; border: string };
  onClose: () => void;
  onConfirm: (motivo?: string) => void;
  saving: boolean;
}) {
  const [motivo, setMotivo] = useState("");
  const necesitaMotivo = accion.key === "cancelar";
  const valid = !necesitaMotivo || motivo.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-[15px] font-bold text-white">{accion.label}</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)", color: "#475569" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-[13px] text-[#94A3B8] leading-relaxed">
            {accion.key === "aprobar"  && "Se marcará la OC como aprobada y habilitada para recepción. Esta acción queda registrada en la auditoría."}
            {accion.key === "cancelar" && "Se cancelará la OC. Los ítems no serán recibidos. Esta acción es irreversible."}
            {accion.key === "cerrar"   && "Se cerrará la OC administrativamente. Quedará como registro histórico sin posibilidad de nuevas recepciones."}
          </p>
          {necesitaMotivo && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]">
                Motivo de cancelación <span className="text-[#FCA5A5]">*</span>
              </label>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)}
                rows={3} placeholder="Describe el motivo de cancelación (mín. 10 caracteres)…"
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">
            Cancelar
          </button>
          <button onClick={() => onConfirm(motivo || undefined)} disabled={saving || !valid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: accion.bg, border: `1px solid ${accion.border}`, color: accion.color }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Procesando…</>
              : `Confirmar — ${accion.label}`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function DetalleOCPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [oc, setOc]           = useState<OrdenCompra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [accionActiva, setAccionActiva] = useState<{ key: string; label: string; color: string; bg: string; border: string } | null>(null);
  const [saving, setSaving]   = useState(false);
  const [tab, setTab]         = useState<"items" | "recepciones">("items");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = isMock ? MOCK_OC_DETALLE : await ordenesCompraService.getById(id!);
        setOc(data);
      } catch {
        setError("No se pudo cargar la orden de compra.");
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  // ── Handlers de acción ────────────────────────────────────────────────────

  const ejecutarAccion = async (motivo?: string) => {
    if (!oc || !accionActiva) return;
    setSaving(true);
    try {
      if (!isMock) {
        if (accionActiva.key === "aprobar")  await ordenesCompraService.aprobar(oc.id);
        if (accionActiva.key === "cancelar") await ordenesCompraService.cancelar(oc.id, motivo!);
        if (accionActiva.key === "cerrar")   await ordenesCompraService.cerrar(oc.id);
      } else {
        await new Promise(r => setTimeout(r, 700));
      }
      const nuevoEstado =
        accionActiva.key === "cancelar" ? EstadoOC.Cancelada :
        accionActiva.key === "cerrar"   ? EstadoOC.Cerrada   :
        oc.estado; // aprobar no cambia el estado visualmente aquí
      setOc(prev => prev ? { ...prev, estado: nuevoEstado } : null);
      setAccionActiva(null);
    } finally { setSaving(false); }
  };

  // ── Loading / error ───────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#475569] text-xs font-mono">Cargando orden de compra…</p>
      </div>
    </div>
  );

  if (error || !oc) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-red-400 text-sm">{error ?? "OC no encontrada."}</p>
      <button onClick={() => navigate("/ordenes-compra")}
        className="text-[#F59E0B] text-sm underline">
        Volver a órdenes de compra
      </button>
    </div>
  );

  // ── Derivados ────────────────────────────────────────────────────────────

  const cfg = ESTADO_CFG[oc.estado];
  const cerrada = oc.estado === EstadoOC.Cerrada || oc.estado === EstadoOC.Cancelada;
  const accionesDisponibles = ACCIONES_POR_ESTADO[oc.estado] ?? [];

  const totalSolicitado = oc.detalles.reduce((s, d) => s + d.cantidadSolicitada, 0);
  const totalRecibido   = oc.detalles.reduce((s, d) => s + d.cantidadRecibida,   0);
  const totalPendiente  = oc.detalles.reduce((s, d) => s + d.cantidadPendiente,  0);
  const totalValor      = oc.detalles.reduce((s, d) => s + d.subtotal,            0);
  const pctGeneral      = totalSolicitado > 0
    ? Math.round((totalRecibido / totalSolicitado) * 100)
    : 0;
  const vencida = isVencida(oc.fechaVencimiento) && !cerrada && oc.estado !== EstadoOC.TotalmenteRecibida;

  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto pb-8"
      style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[#334155] font-mono">
        <button onClick={() => navigate("/ordenes-compra")}
          className="hover:text-[#64748B] transition-colors">
          Órdenes de Compra
        </button>
        <span>/</span>
        <span className="text-[#475569]">{oc.numeroOC}</span>
      </div>

      {/* ── Header principal ── */}
      <div className="rounded-2xl p-6"
        style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Badges + acciones */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-mono font-bold text-[#475569]">{oc.numeroOC}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: cfg.bg, color: cfg.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {EstadoOCLabels[oc.estado].toUpperCase()}
            </span>
            {oc.requiereCadenaFrio && (
              <span className="text-[10px] px-2 py-0.5 rounded font-mono"
                style={{ background: "rgba(59,130,246,0.08)", color: "#93C5FD" }}>
                ❄ cadena de frío
              </span>
            )}
            {vencida && (
              <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono"
                style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5" }}>
                ⚠ VENCIDA
              </span>
            )}
          </div>

          {/* Botones de acción */}
          {accionesDisponibles.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {accionesDisponibles.map(ac => (
                <button key={ac.key}
                  onClick={() => setAccionActiva(ac)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                  style={{ background: ac.bg, border: `1px solid ${ac.border}`, color: ac.color }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
                  {ac.key === "aprobar"  && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
                  {ac.key === "cancelar" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>}
                  {ac.key === "cerrar"   && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>}
                  {ac.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Proveedor + meta */}
        <h1 className="text-[22px] font-bold text-white leading-snug mb-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {oc.proveedorNombre}
        </h1>
        <p className="text-[13px] text-[#475569] mb-5">
          NIT {oc.proveedorNit}
          {oc.fechaEmision       && ` · Emitida ${fmtDate(oc.fechaEmision)}`}
          {oc.fechaEntregaEsperada && ` · Entrega esperada ${fmtDate(oc.fechaEntregaEsperada)}`}
        </p>

        {/* Línea de tiempo */}
        <LineaTiempo estado={oc.estado} />

        {/* Barra de recepción */}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-[#334155] font-mono uppercase tracking-wider">
              Progreso de recepción
            </p>
            <p className="text-[11px] font-mono"
              style={{ color: pctGeneral === 100 ? "#86EFAC" : "#64748B" }}>
              {totalRecibido.toLocaleString()} / {totalSolicitado.toLocaleString()} uds · {pctGeneral}%
            </p>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pctGeneral}%`, background: pctGeneral === 100 ? "#22C55E" : "#F59E0B" }} />
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Columna izquierda: datos generales */}
        <div className="flex flex-col gap-5">

          {/* Resumen económico */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase font-mono text-[#64748B]">
                Resumen económico
              </p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { label: "Valor total",    val: fmtCOP(totalValor),                     color: "#F59E0B"  },
                { label: "Ítems",          val: String(oc.totalItems),                  color: "#CBD5E1"  },
                { label: "Solicitado",     val: `${totalSolicitado.toLocaleString()} u`, color: "#94A3B8"  },
                { label: "Pendiente",      val: `${totalPendiente.toLocaleString()} u`,  color: totalPendiente > 0 ? "#FCD34D" : "#86EFAC" },
              ].map(k => (
                <div key={k.label} className="p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-[10px] text-[#334155] font-mono mb-1">{k.label}</p>
                  <p className="text-[14px] font-bold font-mono" style={{ color: k.color }}>{k.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Datos de la OC */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase font-mono text-[#64748B]">
                Datos de la orden
              </p>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {[
                { label: "Emisión",          val: fmtDate(oc.fechaEmision) },
                { label: "Entrega esperada", val: fmtDate(oc.fechaEntregaEsperada) },
                { label: "Vencimiento OC",   val: oc.fechaVencimiento
                  ? <span style={{ color: vencida ? "#FCA5A5" : "#94A3B8" }}>
                      {fmtDate(oc.fechaVencimiento)}
                    </span>
                  : "—"
                },
                { label: "Creado por",       val: oc.creadoPor },
                { label: "Aprobado por",     val: oc.aprobadoPor ?? "Pendiente" },
                { label: "Fecha aprobación", val: fmtDateTime(oc.fechaAprobacion) },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <p className="text-[11px] text-[#334155] font-mono shrink-0">{label}</p>
                  <div className="text-[12px] text-[#94A3B8] text-right">{val}</div>
                </div>
              ))}

              {oc.notas && (
                <div className="mt-2 p-3 rounded-xl"
                  style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)" }}>
                  <p className="text-[10px] text-[#F59E0B] font-mono mb-1 uppercase tracking-wider">Notas</p>
                  <p className="text-[12px] text-[#94A3B8] leading-relaxed">{oc.notas}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha: tabs ítems / recepciones */}
        <div className="lg:col-span-2 flex flex-col gap-0">

          {/* Tabs */}
          <div className="flex gap-1 mb-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { key: "items",       label: `Ítems (${oc.detalles.length})` },
              { key: "recepciones", label: `Recepciones (${oc.recepciones.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className="px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 -mb-px"
                style={{
                  color: tab === t.key ? "#F59E0B" : "#475569",
                  borderColor: tab === t.key ? "#F59E0B" : "transparent",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB ÍTEMS ── */}
          {tab === "items" && (
            <div className="rounded-2xl overflow-hidden mt-4"
              style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>

              {/* Cabecera tabla */}
              <div className="grid px-5 py-3"
                style={{
                  gridTemplateColumns: "minmax(0,3fr) repeat(3,minmax(0,1fr)) minmax(0,1.4fr) minmax(0,1.4fr)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
                {["Ítem", "Solicitado", "Recibido", "Pendiente", "Precio unit.", "Subtotal"].map(h => (
                  <p key={h} className="text-[9px] font-mono text-[#334155] uppercase tracking-wider">
                    {h}
                  </p>
                ))}
              </div>

              {/* Filas */}
              {oc.detalles.map((det, idx) => {
                const pct = det.cantidadSolicitada > 0
                  ? Math.round((det.cantidadRecibida / det.cantidadSolicitada) * 100)
                  : 0;
                return (
                  <div key={det.id}
                    className="grid px-5 py-4 items-center"
                    style={{
                      gridTemplateColumns: "minmax(0,3fr) repeat(3,minmax(0,1fr)) minmax(0,1.4fr) minmax(0,1.4fr)",
                      borderBottom: idx < oc.detalles.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      animation: `fadeSlideUp ${0.1 + idx * 0.05}s ease both`,
                    }}>

                    {/* Ítem */}
                    <div className="min-w-0 pr-3">
                      <p className="text-[13px] text-[#CBD5E1] font-medium truncate">{det.itemNombre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-[#475569] font-mono">{det.itemCodigo}</p>
                        {det.requiereCadenaFrio && (
                          <span className="text-[9px] text-[#93C5FD] font-mono">
                            ❄ {det.temperaturaMinima}°–{det.temperaturaMaxima}°C
                          </span>
                        )}
                      </div>
                      {/* Mini barra */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="h-1 w-20 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: pct === 100 ? "#22C55E" : "#F59E0B" }} />
                        </div>
                        <span className="text-[9px] font-mono"
                          style={{ color: pct === 100 ? "#86EFAC" : "#64748B" }}>
                          {pct}%
                        </span>
                      </div>
                    </div>

                    {/* Solicitado */}
                    <p className="text-[13px] font-mono text-[#94A3B8]">
                      {det.cantidadSolicitada.toLocaleString()}
                      <span className="text-[10px] text-[#334155] ml-1">{det.unidadMedida}</span>
                    </p>

                    {/* Recibido */}
                    <p className="text-[13px] font-mono"
                      style={{ color: det.cantidadRecibida > 0 ? "#86EFAC" : "#334155" }}>
                      {det.cantidadRecibida.toLocaleString()}
                    </p>

                    {/* Pendiente */}
                    <p className="text-[13px] font-mono"
                      style={{ color: det.cantidadPendiente > 0 ? "#FCD34D" : "#475569" }}>
                      {det.cantidadPendiente.toLocaleString()}
                    </p>

                    {/* Precio unit */}
                    <p className="text-[12px] font-mono text-[#64748B]">
                      {fmtCOP(det.precioUnitario)}
                    </p>

                    {/* Subtotal */}
                    <p className="text-[13px] font-mono font-bold text-[#94A3B8]">
                      {fmtCOP(det.subtotal)}
                    </p>
                  </div>
                );
              })}

              {/* Totales */}
              <div className="grid px-5 py-4"
                style={{
                  gridTemplateColumns: "minmax(0,3fr) repeat(3,minmax(0,1fr)) minmax(0,1.4fr) minmax(0,1.4fr)",
                  background: "rgba(255,255,255,0.02)",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                }}>
                <p className="text-[11px] font-bold font-mono text-[#64748B]">TOTALES</p>
                <p className="text-[13px] font-bold font-mono text-[#CBD5E1]">
                  {totalSolicitado.toLocaleString()}
                </p>
                <p className="text-[13px] font-bold font-mono" style={{ color: "#86EFAC" }}>
                  {totalRecibido.toLocaleString()}
                </p>
                <p className="text-[13px] font-bold font-mono"
                  style={{ color: totalPendiente > 0 ? "#FCD34D" : "#475569" }}>
                  {totalPendiente.toLocaleString()}
                </p>
                <p className="text-[11px] text-[#334155]">—</p>
                <p className="text-[14px] font-bold font-mono text-[#F59E0B]">
                  {fmtCOP(totalValor)}
                </p>
              </div>
            </div>
          )}

          {/* ── TAB RECEPCIONES ── */}
          {tab === "recepciones" && (
            <div className="mt-4 flex flex-col gap-3">
              {oc.recepciones.length === 0
                ? <div className="rounded-2xl py-14 flex flex-col items-center justify-center gap-2"
                    style={{ background: "rgba(15,23,42,0.6)", border: "1px dashed rgba(255,255,255,0.06)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="#334155" strokeWidth="1.5">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h6a2 2 0 000-4M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-[#475569] text-sm">Sin recepciones registradas para esta OC.</p>
                    {!cerrada && (
                      <button
                        onClick={() => navigate(`/recepciones/nueva?ocId=${oc.id}`)}
                        className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                        style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Iniciar recepción para esta OC
                      </button>
                    )}
                  </div>
                : oc.recepciones.map((rec, idx) => (
                  <button key={rec.id}
                    onClick={() => navigate(`/recepciones/${rec.id}`)}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                    style={{
                      background: "rgba(15,23,42,0.85)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      animation: `fadeSlideUp ${0.1 + idx * 0.05}s ease both`,
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.2)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)")}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="#F59E0B" strokeWidth="1.8">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h6a2 2 0 000-4M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#CBD5E1] font-mono">{rec.numeroRecepcion}</p>
                      <p className="text-[11px] text-[#475569] mt-0.5">{fmtDate(rec.fecha)}</p>
                    </div>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#334155" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* Footer normativa */}
      <div className="flex items-center justify-between pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[10px] text-[#1E293B] font-mono tracking-widest uppercase">
          Gestión de Compras — Trazabilidad OC → Recepción → Lote
        </p>
        {isMock && <p className="text-[10px] text-[#1E293B] font-mono">⚙ Datos de demostración</p>}
      </div>

      {/* Modal acción */}
      {accionActiva && (
        <ModalConfirmar
          accion={accionActiva}
          onClose={() => setAccionActiva(null)}
          onConfirm={ejecutarAccion}
          saving={saving}
        />
      )}
    </div>
  );
}