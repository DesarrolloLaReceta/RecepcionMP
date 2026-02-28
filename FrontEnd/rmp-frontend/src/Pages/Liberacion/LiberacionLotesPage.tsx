import { useState, useEffect, useCallback } from "react";
import {
  lotesService,
  type LotePendiente,
  type TipoRechazo,
  TipoRechazoLabels,
} from "../../Services/lotes.service";
import { EstadoSensorialLabels, EstadoRotuladoLabels } from "../../Types/api";
import { useAuth } from "../../Auth/AuthContext";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_LOTES: LotePendiente[] = [
  {
    id: "lote-001", numeroLoteInterno: "L-2026-0048-01", numeroLoteProveedor: "AVL-20260201",
    itemId: "i1", itemNombre: "Pechuga de pollo", itemCodigo: "CAR-001",
    categoriaNombre: "Cárnicos", proveedorNombre: "AviCol S.A.",
    recepcionId: "rec-001", numeroRecepcion: "REC-2026-0048",
    fechaRecepcion: "2026-02-24", fechaFabricacion: "2026-02-01",
    fechaVencimiento: "2026-03-01", diasParaVencer: 5,
    cantidadRecibida: 498, cantidadEsperada: 500, unidadMedida: "Kg",
    temperaturaMedida: 3.5, temperaturaMinima: 0, temperaturaMaxima: 4,
    temperaturaDentroRango: true,
    estadoSensorial: 0, estadoRotulado: 0, ubicacionDestino: 0,
    estado: "PendienteCalidad", tieneDocumentosFaltantes: false, documentosFaltantes: [],
    observacionesRecepcion: "Llegó 10 min antes. Vehículo en buenas condiciones.",
    requiereCadenaFrio: false
  },
  {
    id: "lote-002", numeroLoteInterno: "L-2026-0048-02", numeroLoteProveedor: "AVL-20260202",
    itemId: "i2", itemNombre: "Muslo de pollo", itemCodigo: "CAR-002",
    categoriaNombre: "Cárnicos", proveedorNombre: "AviCol S.A.",
    recepcionId: "rec-001", numeroRecepcion: "REC-2026-0048",
    fechaRecepcion: "2026-02-24", fechaFabricacion: "2026-02-01",
    fechaVencimiento: "2026-03-03", diasParaVencer: 7,
    cantidadRecibida: 300, cantidadEsperada: 300, unidadMedida: "Kg",
    temperaturaMedida: 3.8, temperaturaMinima: 0, temperaturaMaxima: 4,
    temperaturaDentroRango: true,
    estadoSensorial: 0, estadoRotulado: 0, ubicacionDestino: 0,
    estado: "PendienteCalidad",
    tieneDocumentosFaltantes: true, documentosFaltantes: ["Certificado de análisis (COA)"],
    requiereCadenaFrio: false
  },
  {
    id: "lote-003", numeroLoteInterno: "L-2026-0044-01",
    itemId: "i3", itemNombre: "Harina de trigo", itemCodigo: "SEC-005",
    categoriaNombre: "Secos", proveedorNombre: "Harinas del Meta S.A.",
    recepcionId: "rec-005", numeroRecepcion: "REC-2026-0044",
    fechaRecepcion: "2026-02-21",
    fechaVencimiento: "2026-08-21", diasParaVencer: 177,
    cantidadRecibida: 1000, cantidadEsperada: 1000, unidadMedida: "Kg",
    estadoSensorial: 0, estadoRotulado: 0, ubicacionDestino: 0,
    estado: "PendienteCalidad", tieneDocumentosFaltantes: false, documentosFaltantes: [],
    temperaturaDentroRango: true,
    requiereCadenaFrio: false
  },
  {
    id: "lote-004", numeroLoteInterno: "L-2026-0044-02",
    itemId: "i4", itemNombre: "Fécula de maíz", itemCodigo: "SEC-006",
    categoriaNombre: "Secos", proveedorNombre: "Harinas del Meta S.A.",
    recepcionId: "rec-005", numeroRecepcion: "REC-2026-0044",
    fechaRecepcion: "2026-02-21",
    fechaVencimiento: "2026-12-01", diasParaVencer: 279,
    cantidadRecibida: 500, cantidadEsperada: 500, unidadMedida: "Kg",
    estadoSensorial: 2, estadoRotulado: 1, ubicacionDestino: 1,
    estado: "PendienteCalidad",
    tieneDocumentosFaltantes: true,
    documentosFaltantes: ["Registro sanitario INVIMA", "Certificado de análisis (COA)"],
    observacionesRecepcion: "Un bulto con humedad visible. En cuarentena preventiva.",
    requiereCadenaFrio: false
  },
];

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function urgencyColor(dias: number) {
  if (dias <= 7)  return { text: "#FCA5A5", dot: "#EF4444" };
  if (dias <= 30) return { text: "#FCD34D", dot: "#F59E0B" };
  return              { text: "#86EFAC", dot: "#22C55E" };
}

function tempOk(t?: number, min?: number, max?: number) {
  if (t === undefined) return null;
  return !((min !== undefined && t < min) || (max !== undefined && t > max));
}

// ─── UI PRIMITIVOS ────────────────────────────────────────────────────────────

function KpiCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div className="rounded-xl p-4"
      style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-[10px] text-[#475569] tracking-widest uppercase font-mono mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-[#334155] mt-0.5">{sub}</p>}
    </div>
  );
}

function Pill({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
      style={{ background: bg, color }}>{children}</span>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl p-6 relative"
        style={{ background: "rgba(10,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#475569] hover:text-[#94A3B8] transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: "ok" | "error" }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: "rgba(10,15,26,0.98)",
        border: `1px solid ${type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "slideUp 0.25s ease",
      }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{ background: type === "ok" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }}>
        {type === "ok"
          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" /></svg>
          : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>}
      </div>
      <p className="text-[12px] text-[#CBD5E1]">{msg}</p>
    </div>
  );
}

// ─── MODAL: LIBERAR ───────────────────────────────────────────────────────────

function ModalLiberar({ lote, onConfirm, onClose, loading }: {
  lote: LotePendiente; onConfirm: (obs: string) => void; onClose: () => void; loading: boolean;
}) {
  const [obs, setObs] = useState("");
  const ts = tempOk(lote.temperaturaMedida, lote.temperaturaMinima, lote.temperaturaMaxima);

  return (
    <Overlay onClose={onClose}>
      {/* Cabecera */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Liberar lote</h3>
          <p className="text-[12px] text-[#64748B]">{lote.numeroLoteInterno} · {lote.itemNombre}</p>
        </div>
      </div>

      {/* Resumen */}
      <div className="rounded-xl p-4 mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5"
        style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
        {([
          ["Proveedor",     lote.proveedorNombre],
          ["Cantidad",      `${lote.cantidadRecibida} ${lote.unidadMedida}`],
          ["Vencimiento",   fmtDate(lote.fechaVencimiento)],
          ["Temperatura",   lote.temperaturaMedida != null ? `${lote.temperaturaMedida}°C ${ts === false ? "⚠" : "✓"}` : "N/A"],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} className="flex gap-1.5">
            <span className="text-[11px] text-[#475569] shrink-0">{k}:</span>
            <span className="text-[11px] font-mono" style={{ color: k === "Temperatura" && ts === false ? "#FCA5A5" : "#94A3B8" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Alerta si hay docs faltantes */}
      {lote.tieneDocumentosFaltantes && (
        <div className="rounded-lg px-3 py-2.5 mb-4 flex items-start gap-2"
          style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" className="mt-0.5 shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-[11px] text-[#F59E0B] font-semibold mb-0.5">Documentos faltantes al liberar</p>
            {lote.documentosFaltantes.map((d) => <p key={d} className="text-[10px] text-[#B45309]">{d}</p>)}
          </div>
        </div>
      )}

      {/* Observaciones */}
      <label className="block text-[11px] text-[#64748B] tracking-widest uppercase font-mono mb-2">
        Observaciones de liberación
      </label>
      <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3}
        placeholder="Verificación completada. Documentos conformes. Producto apto para proceso…"
        className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none mb-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />

      <div className="flex gap-3">
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 rounded-lg text-sm text-[#64748B] hover:text-[#94A3B8] disabled:opacity-40"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          Cancelar
        </button>
        <button onClick={() => onConfirm(obs)} disabled={loading}
          className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-60"
          style={{ background: "#22C55E", color: "#000" }}
          onMouseEnter={(e) => !loading && ((e.currentTarget as HTMLElement).style.background = "#16A34A")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#22C55E")}>
          {loading
            ? <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Liberando…
              </span>
            : "✓ Confirmar liberación"}
        </button>
      </div>
    </Overlay>
  );
}

// ─── MODAL: RECHAZAR ──────────────────────────────────────────────────────────

function ModalRechazar({ lote, onConfirm, onClose, loading }: {
  lote: LotePendiente;
  onConfirm: (tipo: TipoRechazo, motivo: string, accion: string, nc: boolean) => void;
  onClose: () => void; loading: boolean;
}) {
  const [tipo, setTipo]     = useState<TipoRechazo>("Total");
  const [motivo, setMotivo] = useState("");
  const [accion, setAccion] = useState("");
  const [nc, setNc]         = useState(true);
  const valid = motivo.trim().length >= 10;

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Rechazar lote</h3>
          <p className="text-[12px] text-[#64748B]">{lote.numeroLoteInterno} · {lote.itemNombre}</p>
        </div>
      </div>

      {/* Tipo */}
      <label className="block text-[11px] text-[#64748B] tracking-widest uppercase font-mono mb-2">
        Tipo de rechazo <span className="text-[#F59E0B]">*</span>
      </label>
      <div className="flex flex-col gap-1.5 mb-4">
        {(["Total", "Parcial", "Cuarentena"] as TipoRechazo[]).map((t) => (
          <button key={t} onClick={() => setTipo(t)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all"
            style={{
              background: tipo === t ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${tipo === t ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)"}`,
            }}>
            <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: tipo === t ? "#FCA5A5" : "#334155" }}>
              {tipo === t && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold" style={{ color: tipo === t ? "#FCA5A5" : "#64748B" }}>{t}</p>
              <p className="text-[10px] text-[#334155] truncate">{TipoRechazoLabels[t].split("—")[1]?.trim()}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Motivo */}
      <label className="block text-[11px] text-[#64748B] tracking-widest uppercase font-mono mb-2">
        Motivo <span className="text-[#F59E0B]">*</span>
        <span className="ml-2 normal-case text-[#334155]">(mín. 10 caracteres)</span>
      </label>
      <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3}
        placeholder="Descripción detallada del motivo de rechazo…"
        className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none mb-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />

      {/* Acción correctiva */}
      <label className="block text-[11px] text-[#64748B] tracking-widest uppercase font-mono mb-2">
        Acción correctiva
      </label>
      <textarea value={accion} onChange={(e) => setAccion(e.target.value)} rows={2}
        placeholder="Devolución al proveedor, solicitud de reposición, análisis adicional…"
        className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none mb-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />

      {/* Toggle NC */}
      <div className="flex items-center justify-between py-3 mb-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <p className="text-[13px] text-[#CBD5E1]">Generar no conformidad</p>
          <p className="text-[10px] text-[#475569] mt-0.5">Crea un registro CAPA asociado al rechazo</p>
        </div>
        <button onClick={() => setNc(!nc)}
          className="w-10 h-5 rounded-full relative transition-all shrink-0"
          style={{ background: nc ? "#F59E0B" : "rgba(255,255,255,0.08)" }}>
          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
            style={{ left: nc ? "22px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 rounded-lg text-sm text-[#64748B] hover:text-[#94A3B8] disabled:opacity-40"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          Cancelar
        </button>
        <button onClick={() => onConfirm(tipo, motivo, accion, nc)}
          disabled={!valid || loading}
          className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: "rgba(220,38,38,0.85)", color: "#fff" }}
          onMouseEnter={(e) => !(!valid || loading) && ((e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,1)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.85)")}>
          {loading
            ? <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rechazando…
              </span>
            : "Confirmar rechazo"}
        </button>
      </div>
    </Overlay>
  );
}

// ─── TARJETA DE LOTE ──────────────────────────────────────────────────────────

function LoteCard({ lote, onLiberar, onRechazar }: {
  lote: LotePendiente;
  onLiberar: (l: LotePendiente) => void;
  onRechazar: (l: LotePendiente) => void;
}) {
  const urg  = urgencyColor(lote.diasParaVencer);
  const ts   = tempOk(lote.temperaturaMedida, lote.temperaturaMinima, lote.temperaturaMaxima);
  const diff = lote.cantidadRecibida - lote.cantidadEsperada;

  return (
    <div className="rounded-xl overflow-hidden flex flex-col transition-all duration-150"
      style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.15)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)")}>

      {/* Top bar de urgencia */}
      <div className="h-0.5 w-full" style={{ background: urg.dot, opacity: lote.diasParaVencer <= 7 ? 1 : 0 }} />

      <div className="p-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="text-[13px] font-bold text-white truncate">{lote.itemNombre}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", color: "#475569" }}>
                {lote.categoriaNombre}
              </span>
            </div>
            <p className="text-[11px] text-[#475569] font-mono">{lote.numeroLoteInterno}</p>
            <p className="text-[11px] text-[#334155] mt-0.5">{lote.proveedorNombre} · {lote.numeroRecepcion}</p>
          </div>
          {/* Vencimiento */}
          <div className="text-right shrink-0">
            <p className="text-[10px] text-[#334155]">Vence en</p>
            <p className="text-[15px] font-bold font-mono" style={{ color: urg.text }}>
              {lote.diasParaVencer <= 0 ? "VENCIDO" : `${lote.diasParaVencer}d`}
            </p>
            <p className="text-[9px] text-[#334155]">{fmtDate(lote.fechaVencimiento)}</p>
          </div>
        </div>

        {/* Pills de calidad */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {lote.temperaturaMedida !== undefined && (
            <Pill
              color={ts === false ? "#FCA5A5" : "#86EFAC"}
              bg={ts === false ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.07)"}>
              {ts === false ? "⚠ " : "✓ "}{lote.temperaturaMedida}°C
              {lote.temperaturaMinima != null && ` (${lote.temperaturaMinima}°–${lote.temperaturaMaxima}°)`}
            </Pill>
          )}
          <Pill
            color={diff !== 0 ? "#FCD34D" : "#64748B"}
            bg={diff !== 0 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.05)"}>
            {lote.cantidadRecibida}/{lote.cantidadEsperada} {lote.unidadMedida}
            {diff !== 0 && ` (${diff > 0 ? "+" : ""}${diff})`}
          </Pill>
          <Pill color="#64748B" bg="rgba(255,255,255,0.04)">
            {EstadoSensorialLabels[lote.estadoSensorial as keyof typeof EstadoSensorialLabels]}
          </Pill>
          <Pill color="#64748B" bg="rgba(255,255,255,0.04)">
            {EstadoRotuladoLabels[lote.estadoRotulado as keyof typeof EstadoRotuladoLabels]}
          </Pill>
        </div>

        {/* Alerta documentos faltantes */}
        {lote.tieneDocumentosFaltantes && (
          <div className="rounded-lg px-3 py-2 mb-3 flex items-start gap-2"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B"
              strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
            </svg>
            <div>
              <p className="text-[10px] text-[#F59E0B] font-semibold leading-none mb-0.5">
                Docs. faltantes
              </p>
              {lote.documentosFaltantes.map((d) => (
                <p key={d} className="text-[10px] text-[#92400E]">{d}</p>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {lote.observacionesRecepcion && (
          <p className="text-[10px] text-[#334155] italic leading-relaxed mb-2">
            "{lote.observacionesRecepcion}"
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 px-4 pb-4">
        <button onClick={() => onLiberar(lote)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86EFAC" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.18)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.1)")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Liberar
        </button>
        <button onClick={() => onRechazar(lote)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#FCA5A5" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Rechazar
        </button>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

type Modal = { type: "liberar" | "rechazar"; lote: LotePendiente } | null;

export default function LiberacionLotesPage() {
  const { displayName } = useAuth();

  const [lotes, setLotes]               = useState<LotePendiente[]>([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal]               = useState<Modal>(null);
  const [toast, setToast]               = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");

  const showToast = (msg: string, type: "ok" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = isMock ? MOCK_LOTES : await lotesService.getPendientes();
      setLotes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const kpis = {
    pendientes:      lotes.length,
    docsFaltantes:   lotes.filter((l) => l.tieneDocumentosFaltantes).length,
    tempFuera:       lotes.filter((l) => tempOk(l.temperaturaMedida, l.temperaturaMinima, l.temperaturaMaxima) === false).length,
    urgentes:        lotes.filter((l) => l.diasParaVencer <= 7).length,
  };

  const categorias = ["Todas", ...Array.from(new Set(lotes.map((l) => l.categoriaNombre)))];
  const filtered = filtroCategoria === "Todas" ? lotes : lotes.filter((l) => l.categoriaNombre === filtroCategoria);
  const sorted   = [...filtered].sort((a, b) => a.diasParaVencer - b.diasParaVencer);

  const handleLiberar = async (obs: string) => {
    if (!modal || modal.type !== "liberar") return;
    setActionLoading(true);
    try {
      if (!isMock) await lotesService.liberar({ loteId: modal.lote.id, observaciones: obs });
      else await new Promise((r) => setTimeout(r, 800));
      setLotes((p) => p.filter((l) => l.id !== modal.lote.id));
      setModal(null);
      showToast(`Lote ${modal.lote.numeroLoteInterno} liberado correctamente.`, "ok");
    } catch {
      showToast("Error al liberar el lote. Intenta nuevamente.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async (tipo: TipoRechazo, motivo: string, accion: string, nc: boolean) => {
    if (!modal || modal.type !== "rechazar") return;
    setActionLoading(true);
    try {
      if (!isMock) await lotesService.rechazar({ loteId: modal.lote.id, tipoRechazo: tipo, motivoRechazo: motivo, accionCorrectiva: accion, generaNoConformidad: nc });
      else await new Promise((r) => setTimeout(r, 900));
      setLotes((p) => p.filter((l) => l.id !== modal.lote.id));
      setModal(null);
      showToast(`Lote ${modal.lote.numeroLoteInterno} rechazado.${nc ? " NC generada." : ""}`, "ok");
    } catch {
      showToast("Error al rechazar el lote. Intenta nuevamente.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="flex flex-col gap-5 max-w-[1200px] mx-auto"
        style={{ animation: "fadeSlideUp 0.35s ease both" }}>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-[#475569] tracking-[0.3em] uppercase font-mono mb-1">
              Rol Calidad · {displayName.split(" ")[0]}
            </p>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Liberación de lotes
            </h1>
          </div>
          <button onClick={cargar}
            className="flex items-center gap-2 text-[12px] px-3 py-2 rounded-lg transition-all self-start"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748B" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" className={loading ? "animate-spin" : ""}>
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Pendientes"        value={kpis.pendientes}    color="#F59E0B" sub="lotes por revisar" />
          <KpiCard label="Docs. faltantes"   value={kpis.docsFaltantes} color="#FCD34D" sub="requieren atención" />
          <KpiCard label="Temp. fuera rango" value={kpis.tempFuera}     color="#FCA5A5" sub="alerta cadena frío" />
          <KpiCard label="Urgentes (≤7d)"    value={kpis.urgentes}
            color={kpis.urgentes > 0 ? "#FCA5A5" : "#86EFAC"} sub="días para vencer" />
        </div>

        {/* Filtro categoría */}
        <div className="flex items-center gap-2 flex-wrap">
          {categorias.map((cat) => (
            <button key={cat} onClick={() => setFiltroCategoria(cat)}
              className="text-[11px] px-3 py-1.5 rounded-lg font-mono transition-all"
              style={{
                background: filtroCategoria === cat ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${filtroCategoria === cat ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.06)"}`,
                color: filtroCategoria === cat ? "#F59E0B" : "#64748B",
              }}>
              {cat}
              {cat !== "Todas" && (
                <span className="ml-1.5 opacity-50">{lotes.filter((l) => l.categoriaNombre === cat).length}</span>
              )}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-[#334155] font-mono">
            {sorted.length} lote{sorted.length !== 1 ? "s" : ""} · ordenados por urgencia
          </span>
        </div>

        {/* Grid de lotes */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse h-48"
                style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="h-3 w-32 rounded mb-3" style={{ background: "rgba(255,255,255,0.05)" }} />
                <div className="h-3 w-20 rounded mb-2" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="1.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-[#86EFAC] font-semibold text-sm mb-1">¡Sin pendientes!</p>
            <p className="text-[#475569] text-sm">No hay lotes esperando liberación en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map((lote) => (
              <LoteCard key={lote.id} lote={lote}
                onLiberar={(l) => setModal({ type: "liberar", lote: l })}
                onRechazar={(l) => setModal({ type: "rechazar", lote: l })} />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {modal?.type === "liberar" && (
        <ModalLiberar lote={modal.lote} onConfirm={handleLiberar}
          onClose={() => !actionLoading && setModal(null)} loading={actionLoading} />
      )}
      {modal?.type === "rechazar" && (
        <ModalRechazar lote={modal.lote} onConfirm={handleRechazar}
          onClose={() => !actionLoading && setModal(null)} loading={actionLoading} />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}