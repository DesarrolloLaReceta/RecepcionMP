import { useState, useEffect, useCallback } from "react";
import {
  noConformidadesService,
  type NoConformidad,
  EstadoNC, EstadoNCLabels,
  PrioridadNC, PrioridadNCLabels,
  TipoNC, TipoNCLabels,
  type CrearNCCommand,
  type AgregarAccionCommand,
  type CerrarNCCommand,
  type AccionCorrectiva,
} from "../../Services/no-conformidades.service";
import { MOCK_NC } from "./MockData";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function diasRestantes(fechaLimite?: string): number | null {
  if (!fechaLimite) return null;
  return Math.ceil((new Date(fechaLimite).getTime() - Date.now()) / 86_400_000);
}

// ─── CONFIG VISUAL ────────────────────────────────────────────────────────────

const ESTADO_CFG: Record<EstadoNC, { color: string; bg: string; dot: string }> = {
  [EstadoNC.Abierta]:     { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",    dot: "#EF4444" },
  [EstadoNC.EnAnalisis]:  { color: "#93C5FD", bg: "rgba(59,130,246,0.08)",   dot: "#3B82F6" },
  [EstadoNC.EnEjecucion]: { color: "#FCD34D", bg: "rgba(245,158,11,0.08)",   dot: "#F59E0B" },
  [EstadoNC.Cerrada]:     { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",    dot: "#22C55E" },
  [EstadoNC.Anulada]:     { color: "#94A3B8", bg: "rgba(100,116,139,0.1)",   dot: "#64748B" },
};

// Colores por prioridad
const PRIORIDAD_CFG: Record<PrioridadNC, { color: string; bg: string; border: string }> = {
  [PrioridadNC.Baja]:    { color: "#86EFAC", bg: "rgba(34,197,94,0.06)",  border: "rgba(34,197,94,0.15)"  },
  [PrioridadNC.Media]:   { color: "#FCD34D", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)" },
  [PrioridadNC.Alta]:    { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"   },
  [PrioridadNC.Critica]: { color: "#F87171", bg: "rgba(239,68,68,0.14)",  border: "rgba(239,68,68,0.35)"  },
};

const ACCION_ESTADO_CFG: Record<string, { color: string; bg: string }> = {
  Pendiente:  { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)"  },
  EnCurso:    { color: "#FCD34D", bg: "rgba(245,158,11,0.08)" },
  Completada: { color: "#86EFAC", bg: "rgba(34,197,94,0.08)"  },
};

// ─── SUBCOMPONENTES ───────────────────────────────────────────────────────────

function Badge({ label, color, bg, dot }: { label: string; color: string; bg: string; dot?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
      style={{ background: bg, color }}>
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />}
      {label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#CBD5E1",
};

function Inp({ value, onChange, type = "text", placeholder, min, max }: {
  value: string; onChange: (v: string) => void; type?: string;
  placeholder?: string; min?: string; max?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max}
      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
      style={inputStyle}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)")}
      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
  );
}

function Sel({ value, onChange, children }: {
  value: string | number; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
      style={inputStyle}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)")}
      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>
      {children}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
      style={inputStyle}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)")}
      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
  );
}

// ─── MODAL CREAR NC ───────────────────────────────────────────────────────────

function ModalCrear({ onClose, onCrear, saving }: {
  onClose: () => void;
  onCrear: (cmd: CrearNCCommand) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CrearNCCommand>({
    tipo:               TipoNC.Rechazo,
    prioridad:          PrioridadNC.Media,
    titulo:             "",
    descripcion:        "",
    proveedorId:        "",
    loteId:             "",
    recepcionId:        "",
    cantidadAfectada:   undefined,
    unidadMedida:       "",
    fechaLimite:        "",
    asignadoA:          "",
    notificarProveedor: false,
  });

  const upd = (k: keyof CrearNCCommand) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const valid = form.descripcion.trim().length > 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: "rgba(10,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)", animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-[15px] font-bold text-white">Nueva no conformidad</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94A3B8]"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo *">
              <Sel value={form.tipo}
                onChange={(v) => setForm((p) => ({ ...p, tipo: Number(v) as TipoNC }))}>
                {Object.entries(TipoNCLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Sel>
            </Field>
            <Field label="Prioridad *">
              <Sel value={form.prioridad}
                onChange={(v) => setForm((p) => ({ ...p, prioridad: Number(v) as PrioridadNC }))}>
                {Object.entries(PrioridadNCLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Sel>
            </Field>
          </div>

          <Field label="Descripción de la no conformidad *">
            <Textarea value={form.descripcion} onChange={upd("descripcion")}
              placeholder="Describe detalladamente la desviación encontrada…" rows={4} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="No. Recepción (opcional)">
              <Inp value={form.recepcionId ?? ""} onChange={upd("recepcionId")} placeholder="REC-2026-XXXX" />
            </Field>
            <Field label="No. Lote (opcional)">
              <Inp value={form.loteId ?? ""} onChange={upd("loteId")} placeholder="L-2026-XXXX-XX" />
            </Field>
            <Field label="Cantidad afectada">
              <Inp type="number" value={String(form.cantidadAfectada ?? "")}
                onChange={(v) => setForm((p) => ({ ...p, cantidadAfectada: v ? Number(v) : undefined }))}
                placeholder="0" />
            </Field>
            <Field label="Unidad">
              <Inp value={form.unidadMedida ?? ""} onChange={upd("unidadMedida")} placeholder="Kg, L, unidades…" />
            </Field>
          </div>

          <Field label="Fecha límite de cierre">
            <Inp type="date" value={form.fechaLimite ?? ""}
              onChange={upd("fechaLimite")}
              min={new Date().toISOString().slice(0, 10)} />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">
            Cancelar
          </button>
          <button onClick={() => onCrear(form)} disabled={saving || !valid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5" }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />Creando…</>
              : "Crear no conformidad"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PANEL DETALLE ────────────────────────────────────────────────────────────

function DetallePanel({ nc, onClose, onAgregarAccion, onCerrar, saving }: {
  nc:              NoConformidad;
  onClose:         () => void;
  onAgregarAccion: (cmd: AgregarAccionCommand) => void;
  onCerrar:        (cmd: CerrarNCCommand)       => void;
  saving:          boolean;
}) {
  const [showAccionForm, setShowAccionForm] = useState(false);
  const [showCierreForm, setShowCierreForm] = useState(false);
  const [accion,    setAccion]    = useState({ descripcion: "", responsable: "", fechaCompromiso: "" });
  const [obsCierre, setObsCierre] = useState("");

  const pc = PRIORIDAD_CFG[nc.prioridad];
  const ec = ESTADO_CFG[nc.estado];
  const dias = diasRestantes(nc.fechaLimite);
  const cerrada = nc.estado === EstadoNC.Cerrada || nc.estado === EstadoNC.Anulada;

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ background: "rgba(10,15,26,0.98)", borderLeft: "1px solid rgba(255,255,255,0.07)" }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-6 py-5 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#334155] font-mono tracking-widest mb-1">{nc.numero}</p>
          <h2 className="text-[15px] font-bold text-white leading-tight">
            {TipoNCLabels[nc.tipo]}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge label={EstadoNCLabels[nc.estado]} {...ec} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>
              {PrioridadNCLabels[nc.prioridad].toUpperCase()}
            </span>
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[#475569] hover:text-[#94A3B8]"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        {/* Descripción */}
        <div>
          <p className="text-[10px] text-[#334155] font-mono tracking-widest uppercase mb-2">Descripción</p>
          <p className="text-[13px] text-[#94A3B8] leading-relaxed">{nc.descripcion}</p>
        </div>

        {/* Trazabilidad */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="px-4 py-2.5 text-[10px] text-[#334155] font-mono tracking-widest uppercase"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            Trazabilidad
          </p>
          {([
            ["Proveedor",       nc.proveedorNombre],
            ["Ítem",            nc.itemNombre],
            ["Recepción",       nc.numeroRecepcion],
            ["Lote",            nc.numeroLote],
            ["Detectado por",   nc.detectadoPor],
            ["Fecha detección", fmtDate(nc.fechaDeteccion)],
            ["Afectado", nc.cantidadAfectada
              ? `${nc.cantidadAfectada} ${nc.unidadMedida ?? ""}`.trim()
              : undefined],
          ] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <span className="text-[11px] text-[#475569]">{k}</span>
              <span className="text-[12px] text-[#94A3B8] font-mono">{v}</span>
            </div>
          ))}
          {nc.fechaLimite && (
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-[#475569]">Límite cierre</span>
              <span className="text-[12px] font-bold font-mono"
                style={{ color: dias === null ? "#64748B" : dias < 0 ? "#FCA5A5" : dias <= 3 ? "#FCD34D" : "#86EFAC" }}>
                {fmtDate(nc.fechaLimite)}
                {dias !== null && ` (${dias < 0 ? "VENCIDO" : `${dias}d`})`}
              </span>
            </div>
          )}
        </div>

        {/* Acciones correctivas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-[#334155] font-mono tracking-widest uppercase">
              Acciones correctivas ({nc.accionesCorrectivas.length})
            </p>
            {!cerrada && (
              <button onClick={() => setShowAccionForm(!showAccionForm)}
                className="text-[11px] text-[#F59E0B] hover:underline font-mono">
                {showAccionForm ? "Cancelar" : "+ Agregar"}
              </button>
            )}
          </div>

          {/* Formulario nueva acción */}
          {showAccionForm && (
            <div className="rounded-xl p-4 mb-3 flex flex-col gap-3"
              style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)" }}>
              <Field label="Descripción *">
                <Textarea value={accion.descripcion}
                  onChange={(v) => setAccion((p) => ({ ...p, descripcion: v }))}
                  placeholder="Describe la acción a tomar…" rows={2} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Responsable *">
                  <Inp value={accion.responsable}
                    onChange={(v) => setAccion((p) => ({ ...p, responsable: v }))}
                    placeholder="Nombre y área" />
                </Field>
                <Field label="Fecha compromiso *">
                  <Inp type="date" value={accion.fechaCompromiso}
                    onChange={(v) => setAccion((p) => ({ ...p, fechaCompromiso: v }))}
                    min={new Date().toISOString().slice(0, 10)} />
                </Field>
              </div>
              <button
                onClick={() => {
                  if (!accion.descripcion || !accion.responsable || !accion.fechaCompromiso) return;
                  onAgregarAccion({ ncId: nc.id, ...accion });
                  setAccion({ descripcion: "", responsable: "", fechaCompromiso: "" });
                  setShowAccionForm(false);
                }}
                disabled={saving || !accion.descripcion || !accion.responsable || !accion.fechaCompromiso}
                className="w-full py-2 rounded-lg text-[12px] font-semibold disabled:opacity-40 transition-all"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#FCD34D" }}>
                {saving ? "Guardando…" : "Agregar acción"}
              </button>
            </div>
          )}

          {/* Lista de acciones */}
          {nc.accionesCorrectivas.length === 0 ? (
            <p className="text-[12px] text-[#334155] text-center py-4">Sin acciones correctivas.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {nc.accionesCorrectivas.map((ac: AccionCorrectiva, i: number) => {
                const acCfg = ACCION_ESTADO_CFG[ac.estado] ?? ACCION_ESTADO_CFG["Pendiente"];
                return (
                  <div key={ac.id} className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono shrink-0"
                          style={{ background: "rgba(255,255,255,0.06)", color: "#64748B" }}>
                          {i + 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                          style={{ background: acCfg.bg, color: acCfg.color }}>
                          {ac.estado === "EnCurso" ? "En curso" : ac.estado}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#334155] font-mono shrink-0">
                        {fmtDate(ac.fechaCompromiso)}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#94A3B8] leading-relaxed mb-1.5">{ac.descripcion}</p>
                    <p className="text-[11px] text-[#475569]">
                      Resp: <span className="text-[#64748B]">{ac.responsable}</span>
                    </p>
                    {ac.evidencia && (
                      <p className="text-[10px] text-[#22C55E] mt-1.5 leading-relaxed">
                        ✓ {ac.evidencia}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Observaciones de cierre (solo si cerrada) */}
        {nc.observacionesCierre && (
          <div className="rounded-xl p-4"
            style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
            <p className="text-[10px] text-[#64748B] font-mono tracking-widest uppercase mb-2">
              Observaciones de cierre
            </p>
            <p className="text-[12px] text-[#94A3B8] leading-relaxed">{nc.observacionesCierre}</p>
            {nc.fechaCierre && (
              <p className="text-[10px] text-[#475569] mt-2 font-mono">
                Cerrada: {fmtDateTime(nc.fechaCierre)}
              </p>
            )}
          </div>
        )}

        {/* Formulario cierre */}
        {!cerrada && (
          showCierreForm ? (
            <div className="rounded-xl p-4"
              style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
              <p className="text-[11px] text-[#64748B] font-mono tracking-widest uppercase mb-3">
                Cierre de no conformidad
              </p>
              <Field label="Observaciones de cierre *">
                <Textarea value={obsCierre} onChange={setObsCierre}
                  placeholder="Describe cómo se resolvió y las evidencias de cierre…"
                  rows={3} />
              </Field>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowCierreForm(false)}
                  className="flex-1 py-2 rounded-lg text-[12px] text-[#64748B] hover:text-[#94A3B8]">
                  Cancelar
                </button>
                <button
                  onClick={() => onCerrar({ ncId: nc.id, observaciones: obsCierre })}
                  disabled={saving || !obsCierre.trim()}
                  className="flex-1 py-2 rounded-lg text-[12px] font-bold disabled:opacity-40"
                  style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", color: "#86EFAC" }}>
                  {saving ? "Cerrando…" : "✓ Confirmar cierre"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCierreForm(true)}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", color: "#86EFAC" }}>
              Cerrar no conformidad
            </button>
          )
        )}

        <p className="text-[10px] text-[#1E293B] font-mono text-center">
          Creada: {fmtDateTime(nc.creadoEn)}
          {nc.actualizadoEn ? ` · Actualizada: ${fmtDateTime(nc.actualizadoEn)}` : ""}
        </p>
      </div>
    </div>
  );
}

// ─── FILA LISTA ───────────────────────────────────────────────────────────────

function NCRow({ nc, selected, onClick }: { nc: NoConformidad; selected: boolean; onClick: () => void }) {
  const ec = ESTADO_CFG[nc.estado];
  const pc = PRIORIDAD_CFG[nc.prioridad];
  const dias = diasRestantes(nc.fechaLimite);

  return (
    <tr onClick={onClick} className="cursor-pointer group transition-colors"
      style={{ background: selected ? "rgba(245,158,11,0.04)" : "transparent" }}
      onMouseEnter={(e) => !selected && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={(e) => !selected && ((e.currentTarget as HTMLElement).style.background = "transparent")}>
      {/* Indicador selección */}
      <td className="w-1 p-0">
        <div className="w-0.5 h-12 rounded-r"
          style={{ background: selected ? "#F59E0B" : "transparent" }} />
      </td>

      {/* Número + tipo */}
      <td className="px-5 py-4">
        <p className="text-[12px] font-bold text-white font-mono group-hover:text-[#F59E0B] transition-colors">
          {nc.numero}
        </p>
        <p className="text-[11px] text-[#475569] mt-0.5">
          {TipoNCLabels[nc.tipo]}
        </p>
      </td>

      {/* Proveedor / ítem */}
      <td className="px-4 py-4 hidden md:table-cell">
        <p className="text-[12px] text-[#CBD5E1]">{nc.proveedorNombre ?? "—"}</p>
        <p className="text-[11px] text-[#475569]">{nc.itemNombre ?? "—"}</p>
      </td>

      {/* Prioridad */}
      <td className="px-4 py-4 hidden sm:table-cell">
        <span className="text-[10px] px-2 py-1 rounded font-bold"
          style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>
          {PrioridadNCLabels[nc.prioridad]}
        </span>
      </td>

      {/* Estado */}
      <td className="px-4 py-4">
        <Badge label={EstadoNCLabels[nc.estado]} {...ec} />
      </td>

      {/* Fecha límite */}
      <td className="px-4 py-4 hidden lg:table-cell">
        {nc.fechaLimite && nc.estado !== EstadoNC.Cerrada && nc.estado !== EstadoNC.Anulada ? (
          <span className="text-[11px] font-mono font-bold"
            style={{ color: dias === null ? "#64748B" : dias < 0 ? "#FCA5A5" : dias <= 3 ? "#FCD34D" : "#86EFAC" }}>
            {dias !== null && dias < 0 ? "VENCIDA" : dias !== null ? `${dias}d` : "—"}
          </span>
        ) : (
          <span className="text-[11px] text-[#334155]">{fmtDate(nc.fechaCierre)}</span>
        )}
      </td>

      {/* Acciones CAPA */}
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-[#64748B]">
            {nc.accionesCorrectivas.length}
          </span>
          {nc.accionesCorrectivas.some((a) => a.estado !== "Completada") && (
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#F59E0B" }} />
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function NoConformidadesPage() {
  const [ncs,     setNcs]     = useState<NoConformidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [selected, setSelected] = useState<NoConformidad | null>(null);
  const [showCrear, setShowCrear] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const [search,          setSearch]          = useState("");
  const [filtroEstado,    setFiltroEstado]    = useState<EstadoNC | "">("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadNC | "">("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = isMock ? MOCK_NC : await noConformidadesService.getAll();
      setNcs(data);
    } catch {
      setError("No se pudo cargar las no conformidades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Filtrado
  const filtered = ncs.filter((nc) => {
    if (filtroEstado    !== "" && nc.estado    !== filtroEstado)    return false;
    if (filtroPrioridad !== "" && nc.prioridad !== filtroPrioridad) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        nc.numero.toLowerCase().includes(q)            ||
        (nc.proveedorNombre ?? "").toLowerCase().includes(q) ||
        (nc.itemNombre      ?? "").toLowerCase().includes(q) ||
        TipoNCLabels[nc.tipo].toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPIs
  const abiertas   = ncs.filter((n) => n.estado === EstadoNC.Abierta).length;
  const enGestion  = ncs.filter((n) => n.estado === EstadoNC.EnEjecucion || n.estado === EstadoNC.EnAnalisis).length;
  const criticas   = ncs.filter((n) =>
    n.prioridad === PrioridadNC.Critica &&
    n.estado !== EstadoNC.Cerrada &&
    n.estado !== EstadoNC.Anulada
  ).length;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCrear = async (cmd: CrearNCCommand) => {
    setSaving(true);
    try {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 700));
        const nueva: NoConformidad = {
          id: `nc-mock-${Date.now()}`,
          numero: `NC-2026-${String(ncs.length + 1).padStart(4, "0")}`,
          tipo: cmd.tipo,
          prioridad: cmd.prioridad,
          estado: EstadoNC.Abierta,
          titulo: cmd.titulo,
          descripcion: cmd.descripcion,
          detectadoPor: "Usuario actual",
          fechaDeteccion: new Date().toISOString().slice(0, 10),
          accionesCorrectivas: [],
          cantidadAfectada: cmd.cantidadAfectada,
          unidadMedida: cmd.unidadMedida,
          fechaLimite: cmd.fechaLimite,
          notificarProveedor: cmd.notificarProveedor,
          creadoEn: new Date().toISOString(),
          comentarios: []
        };
        setNcs((p) => [nueva, ...p]);
      } else {
        await noConformidadesService.crear(cmd);
        await cargar();
      }
      setShowCrear(false);
    } catch {
      setError("Error al crear la no conformidad.");
    } finally {
      setSaving(false);
    }
  };

  const handleAgregarAccion = async (cmd: AgregarAccionCommand) => {
    setSaving(true);
    try {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 500));
        const nueva: AccionCorrectiva = {
          id:              `ac-${Date.now()}`,
          descripcion:     cmd.descripcion,
          responsable:     cmd.responsable,
          fechaCompromiso: cmd.fechaCompromiso,
          estado:          "Pendiente",
        };
        const patch = (n: NoConformidad) =>
          n.id === cmd.ncId
            ? { ...n, accionesCorrectivas: [...n.accionesCorrectivas, nueva], estado: EstadoNC.EnEjecucion }
            : n;
        setNcs((prev) => prev.map(patch));
        setSelected((p) => p ? patch(p) : p);
      } else {
        await noConformidadesService.agregarAccion(cmd);
        await cargar();
      }
    } catch {
      setError("Error al agregar acción correctiva.");
    } finally {
      setSaving(false);
    }
  };

  const handleCerrar = async (cmd: CerrarNCCommand) => {
    setSaving(true);
    try {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 600));
        const ahora = new Date().toISOString();
        const patch = (n: NoConformidad) =>
          n.id === cmd.ncId
            ? { ...n, estado: EstadoNC.Cerrada, observacionesCierre: cmd.observaciones, fechaCierre: ahora }
            : n;
        setNcs((prev) => prev.map(patch));
        setSelected((p) => p ? patch(p) : p);
      } else {
        await noConformidadesService.cerrar(cmd);
        await cargar();
      }
    } catch {
      setError("Error al cerrar la no conformidad.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto h-full"
      style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Encabezado ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-[#475569] tracking-[0.3em] uppercase font-mono mb-1">
            Calidad / Auditoría
          </p>
          <h1 className="text-xl font-bold text-white">No conformidades</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {criticas > 0 && (
              <div className="rounded-lg px-3 py-2 text-center"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <p className="text-[16px] font-bold font-mono text-[#FCA5A5]">{criticas}</p>
                <p className="text-[9px] text-[#475569] leading-none">Críticas</p>
              </div>
            )}
            <div className="rounded-lg px-3 py-2 text-center"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)" }}>
              <p className="text-[16px] font-bold font-mono text-[#FCA5A5]">{abiertas}</p>
              <p className="text-[9px] text-[#475569] leading-none">Abiertas</p>
            </div>
            <div className="rounded-lg px-3 py-2 text-center"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
              <p className="text-[16px] font-bold font-mono text-[#FCD34D]">{enGestion}</p>
              <p className="text-[9px] text-[#475569] leading-none">En gestión</p>
            </div>
          </div>
          <button onClick={() => setShowCrear(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all shrink-0"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.18)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva NC
          </button>
        </div>
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13"
            viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar NC, proveedor, ítem…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: "#CBD5E1" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
        </div>

        <select value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value === "" ? "" : Number(e.target.value) as EstadoNC)}
          className="text-[13px] px-3 py-2.5 rounded-xl outline-none font-mono"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: filtroEstado !== "" ? "#CBD5E1" : "#475569" }}>
          <option value="">Todos los estados</option>
          {Object.entries(EstadoNCLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <select value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value === "" ? "" : Number(e.target.value) as PrioridadNC)}
          className="text-[13px] px-3 py-2.5 rounded-xl outline-none font-mono"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: filtroPrioridad !== "" ? "#CBD5E1" : "#475569" }}>
          <option value="">Toda prioridad</option>
          {Object.entries(PrioridadNCLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <button onClick={cargar} disabled={loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#64748B" strokeWidth="2" strokeLinecap="round"
            className={loading ? "animate-spin" : ""}>
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
        </button>

        <p className="text-[11px] text-[#334155] font-mono self-center">
          {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <button onClick={cargar} className="text-xs text-red-400 underline">Reintentar</button>
        </div>
      )}

      {/* ── Layout: tabla + panel ─────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Tabla */}
        <div className="flex-1 min-w-0 rounded-xl overflow-hidden flex flex-col"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 z-10"
                style={{ background: "rgba(10,15,26,0.95)", backdropFilter: "blur(8px)" }}>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="w-1 p-0" />
                  {[
                    ["No. / Tipo",  "px-5"],
                    ["Proveedor",   "px-4 hidden md:table-cell"],
                    ["Prioridad",   "px-4 hidden sm:table-cell"],
                    ["Estado",      "px-4"],
                    ["Límite",      "px-4 hidden lg:table-cell"],
                    ["CAPA",        "px-4 hidden lg:table-cell"],
                  ].map(([label, cls]) => (
                    <th key={label as string} className={`${cls} py-3.5 text-left`}>
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#334155] font-mono">
                        {label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td className="w-1 p-0" />
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 rounded animate-pulse w-24"
                            style={{ background: "rgba(255,255,255,0.05)" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : filtered.length === 0
                    ? <tr><td colSpan={8}>
                      <div className="flex items-center justify-center py-16">
                        <p className="text-[#475569] text-sm">
                          {search || filtroEstado !== "" || filtroPrioridad !== ""
                            ? "Sin resultados para este filtro."
                            : "No hay no conformidades registradas."}
                        </p>
                      </div>
                    </td></tr>
                    : filtered.map((nc) => (
                      <NCRow key={nc.id} nc={nc}
                        selected={selected?.id === nc.id}
                        onClick={() => setSelected(selected?.id === nc.id ? null : nc)} />
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de detalle */}
        {selected && (
          <div className="w-[420px] shrink-0 rounded-xl overflow-hidden hidden lg:flex flex-col"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <DetallePanel
              nc={selected}
              onClose={() => setSelected(null)}
              onAgregarAccion={handleAgregarAccion}
              onCerrar={handleCerrar}
              saving={saving}
            />
          </div>
        )}
      </div>

      {showCrear && (
        <ModalCrear onClose={() => setShowCrear(false)} onCrear={handleCrear} saving={saving} />
      )}
    </div>
  );
}