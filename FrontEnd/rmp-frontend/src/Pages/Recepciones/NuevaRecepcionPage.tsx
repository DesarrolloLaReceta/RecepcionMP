import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  recepcionesService,
  ordenesCompraService,
  type OrdenCompraResumen,
  type DetalleOC,
} from "../../Services/recepciones.service";
import {
  EstadoSensorial, EstadoSensorialLabels,
  EstadoRotulado, EstadoRotuladoLabels,
  UbicacionDestino,
  OrigenTemperatura,
  TipoDocumento, TipoDocumentoLabels,
} from "../../Types/api";
import { ROUTES } from "../../Constants/routes";
import { MOCK_OC_ABIERTAS } from "../OrdenesCompra/MockData";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── TIPOS INTERNOS DEL WIZARD ────────────────────────────────────────────────

interface LoteForm {
  detalleOcId: string;
  itemId: string;
  itemNombre: string;
  categoriaFrio: boolean;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  unidadMedida: string;
  cantidadEsperada: number;
  // Campos editables
  numeroLoteProveedor: string;
  fechaFabricacion: string;
  fechaVencimiento: string;
  cantidadRecibida: string;
  temperaturaMedida: string;
  estadoSensorial: EstadoSensorial;
  estadoRotulado: EstadoRotulado;
  ubicacionDestino: UbicacionDestino;
}

interface WizardState {
  // Paso 1
  ocSeleccionada: OrdenCompraResumen | null;
  // Paso 2
  fechaRecepcion: string;
  horaLlegada: string;
  placaVehiculo: string;
  nombreTransportista: string;
  observaciones: string;
  // Paso 3 — inspección vehículo
  tempInicial: string;
  temperaturaDentroRango: boolean;
  integridadEmpaque: boolean;
  limpiezaVehiculo: boolean;
  oloresExtranos: boolean;
  plagasVisible: boolean;
  documentosTransporteOk: boolean;
  obsInspeccion: string;
  // Paso 4 — lotes
  lotes: LoteForm[];
  // Paso 5 — documentos
  documentos: { tipo: TipoDocumento; archivo: File | null }[];
  // Control
  recepcionId: string | null;
}

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
const nowTime = new Date().toTimeString().slice(0, 5);

function buildLotesFromOC(oc: OrdenCompraResumen): LoteForm[] {
  return oc.detalles.map((d) => ({
    detalleOcId: d.id,
    itemId: d.itemId,
    itemNombre: d.itemNombre,
    categoriaFrio: d.requiereCadenaFrio,
    temperaturaMinima: d.temperaturaMinima,
    temperaturaMaxima: d.temperaturaMaxima,
    unidadMedida: d.unidadMedida,
    cantidadEsperada: d.cantidadSolicitada,
    numeroLoteProveedor: "",
    fechaFabricacion: "",
    fechaVencimiento: "",
    cantidadRecibida: String(d.cantidadSolicitada),
    temperaturaMedida: "",
    estadoSensorial: EstadoSensorial.Aceptable,
    estadoRotulado: EstadoRotulado.Conforme,
    ubicacionDestino: UbicacionDestino.Almacen,
  }));
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "Orden de Compra",    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { n: 2, label: "Check-in",          icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { n: 3, label: "Inspección",        icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { n: 4, label: "Lotes",             icon: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" },
  { n: 5, label: "Documentos",        icon: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done    = s.n < current;
        const active  = s.n === current;
        const pending = s.n > current;
        return (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all`}
                style={{
                  background: done ? "#22C55E" : active ? "#F59E0B" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${done ? "#22C55E" : active ? "#F59E0B" : "rgba(255,255,255,0.08)"}`,
                  color: done || active ? "#000" : "#334155",
                }}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" /></svg>
                  : s.n}
              </div>
              <span className="text-[9px] font-mono tracking-wider hidden sm:block"
                style={{ color: active ? "#F59E0B" : done ? "#64748B" : "#2D3748" }}>
                {s.label.toUpperCase()}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-px flex-1 mx-1 mb-4"
                style={{ background: done ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.05)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPONENTES DE CAMPO ────────────────────────────────────────────────────

function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-wider uppercase font-mono"
        style={{ color: "#64748B" }}>
        {label}{required && <span className="text-[#F59E0B] ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#334155]">{hint}</p>}
    </div>
  );
}

const inputCls = {
  base: "w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-all",
  style: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#CBD5E1",
  } as React.CSSProperties,
};

function Inp({ value, onChange, type = "text", placeholder, min, max, step }: {
  value: string; onChange: (v: string) => void; type?: string;
  placeholder?: string; min?: string; max?: string; step?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max} step={step}
      className={inputCls.base} style={inputCls.style}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
  );
}

function Sel({ value, onChange, children }: {
  value: string | number; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={inputCls.base} style={inputCls.style}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>
      {children}
    </select>
  );
}

function Toggle({ checked, onChange, label, subLabel }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; subLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div>
        <p className="text-[13px] text-[#CBD5E1]">{label}</p>
        {subLabel && <p className="text-[11px] text-[#475569] mt-0.5">{subLabel}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full relative transition-all duration-200 shrink-0"
        style={{ background: checked ? "#22C55E" : "rgba(255,255,255,0.08)" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
          style={{ left: checked ? "22px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </button>
    </div>
  );
}

// ─── PASOS DEL WIZARD ─────────────────────────────────────────────────────────

// PASO 1: Seleccionar OC
function Paso1OC({ state, setState, onNext }: { state: WizardState; setState: any; onNext: () => void }) {
  const [query, setQuery] = useState("");
  const [ocs, setOcs] = useState<OrdenCompraResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const buscar = async () => {
    setLoading(true);
    setBuscado(true);
    try {
      const data = isMock ? MOCK_OC_ABIERTAS : await ordenesCompraService.getAbiertas();
      setOcs(data.filter(oc =>
        !query || oc.numeroOC.toLowerCase().includes(query.toLowerCase()) ||
        oc.proveedorNombre.toLowerCase().includes(query.toLowerCase())
      ));
    } finally {
      setLoading(false);
    }
  };

  const seleccionar = (oc: OrdenCompraResumen) => {
    setState((p: WizardState) => ({
      ...p,
      ocSeleccionada: oc,
      lotes: buildLotesFromOC(oc),
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Seleccionar Orden de Compra</h2>
        <p className="text-[13px] text-[#475569]">
          Busca la OC abierta contra la que se realizará la recepción.
        </p>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14"
            viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="No. OC o nombre del proveedor…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
        </div>
        <button onClick={buscar} disabled={loading}
          className="px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.18)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)")}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </div>

      {/* Resultados */}
      {buscado && (
        <div className="flex flex-col gap-2">
          {ocs.length === 0
            ? <p className="text-[#475569] text-sm text-center py-8">Sin resultados.</p>
            : ocs.map((oc) => {
              const selected = state.ocSeleccionada?.id === oc.id;
              return (
                <button key={oc.id} onClick={() => seleccionar(oc)}
                  className="text-left rounded-xl p-4 transition-all"
                  style={{
                    background: selected ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selected ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.07)"}`,
                  }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[14px] font-bold text-white font-mono">{oc.numeroOC}</p>
                        {selected && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                            SELECCIONADA
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#CBD5E1] mb-0.5">{oc.proveedorNombre}</p>
                      <p className="text-[11px] text-[#475569] font-mono">NIT: {oc.proveedorNit}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-[#475569]">
                        {oc.totalItems} ítem{oc.totalItems !== 1 ? "s" : ""}
                      </p>
                      {oc.fechaEntregaEsperada && (
                        <p className="text-[10px] text-[#334155] mt-0.5">
                          Entrega: {new Date(oc.fechaEntregaEsperada).toLocaleDateString("es-CO")}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Detalles de ítems */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {oc.detalles.map((d) => (
                      <span key={d.id} className="text-[10px] px-2 py-0.5 rounded font-mono"
                        style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}>
                        {d.itemNombre} · {d.cantidadSolicitada} {d.unidadMedida}
                        {d.requiereCadenaFrio && " ❄"}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
        </div>
      )}

      {!buscado && (
        <div className="rounded-xl p-8 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)" }}>
          <p className="text-[#334155] text-sm">Busca una OC para comenzar la recepción</p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button onClick={onNext} disabled={!state.ocSeleccionada}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#F59E0B", color: "#000" }}
          onMouseEnter={(e) => !state.ocSeleccionada || ((e.currentTarget as HTMLElement).style.background = "#D97706")}
          onMouseLeave={(e) => !state.ocSeleccionada || ((e.currentTarget as HTMLElement).style.background = "#F59E0B")}>
          Continuar
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// PASO 2: Check-in / datos vehículo
function Paso2Checkin({ state, setState, onNext, onBack }: { state: WizardState; setState: any; onNext: () => void; onBack: () => void }) {
  const upd = (field: keyof WizardState) => (v: string) =>
    setState((p: WizardState) => ({ ...p, [field]: v }));

  const valid = state.fechaRecepcion && state.horaLlegada;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Check-in del vehículo</h2>
        <p className="text-[13px] text-[#475569]">
          Registra los datos de llegada del proveedor{" "}
          <span className="text-[#CBD5E1]">{state.ocSeleccionada?.proveedorNombre}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Fecha de recepción" required>
          <Inp type="date" value={state.fechaRecepcion} onChange={upd("fechaRecepcion")} max={today} />
        </Field>
        <Field label="Hora de llegada" required>
          <Inp type="time" value={state.horaLlegada} onChange={upd("horaLlegada")} />
        </Field>
        <Field label="Placa del vehículo">
          <Inp value={state.placaVehiculo} onChange={upd("placaVehiculo")} placeholder="ABC-123" />
        </Field>
        <Field label="Nombre del transportista">
          <Inp value={state.nombreTransportista} onChange={upd("nombreTransportista")} placeholder="Nombre completo" />
        </Field>
      </div>

      <Field label="Observaciones generales">
        <textarea value={state.observaciones} onChange={(e) => setState((p: WizardState) => ({ ...p, observaciones: e.target.value }))}
          rows={3} placeholder="Condiciones generales de llegada, novedades…"
          className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
      </Field>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm text-[#64748B] transition-colors hover:text-[#94A3B8]">
          ← Atrás
        </button>
        <button onClick={onNext} disabled={!valid}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ background: "#F59E0B", color: "#000" }}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// PASO 3: Inspección vehículo
function Paso3Inspeccion({ state, setState, onNext, onBack }: { state: WizardState; setState: any; onNext: () => void; onBack: () => void }) {
  const upd = (field: keyof WizardState) => (v: boolean) =>
    setState((p: WizardState) => ({ ...p, [field]: v }));

  const tieneCongelados = state.lotes.some((l) => l.categoriaFrio);

  const CHECKS: { key: keyof WizardState; label: string; sub?: string; critical?: boolean }[] = [
    { key: "temperaturaDentroRango", label: "Temperatura dentro de rango", sub: "El vehículo mantiene la cadena de frío requerida", critical: tieneCongelados },
    { key: "integridadEmpaque", label: "Integridad de empaque", sub: "Sin empaques rotos, húmedos o con signos de deterioro" },
    { key: "limpiezaVehiculo", label: "Limpieza del vehículo", sub: "Interior libre de suciedad, residuos o contaminantes" },
    { key: "documentosTransporteOk", label: "Documentos de transporte OK", sub: "Bitácora de temperatura y documentos exigidos presentes" },
    { key: "oloresExtranos" as keyof WizardState, label: "Sin olores extraños", sub: "Ausencia de olores que indiquen contaminación" },
    { key: "plagasVisible" as keyof WizardState, label: "Sin evidencia de plagas", sub: "No se observan insectos, roedores o sus huellas" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Inspección del vehículo</h2>
        <p className="text-[13px] text-[#475569]">
          Checklist BPM — Res. 2674/2013. Los ítems{" "}
          <span className="text-[#F59E0B]">críticos</span> son obligatorios para la aceptación.
        </p>
      </div>

      {/* Temperatura inicial */}
      {tieneCongelados && (
        <div className="rounded-xl p-4"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <div className="flex items-center gap-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2">
              <path d="M12 2v20M12 2l-4 4M12 2l4 4M4.5 6.5l3 3M19.5 6.5l-3 3M4.5 17.5l3-3M19.5 17.5l-3-3" strokeLinecap="round" />
            </svg>
            <p className="text-[12px] text-[#93C5FD] font-semibold">Temperatura inicial del compartimento</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" value={state.tempInicial}
              onChange={(e) => setState((p: WizardState) => ({ ...p, tempInicial: e.target.value }))}
              placeholder="Ej: 3.5"
              step="0.1"
              className="w-32 px-3.5 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.2)", color: "#CBD5E1" }} />
            <span className="text-[13px] text-[#475569]">°C</span>
          </div>
        </div>
      )}

      {/* Toggles */}
      <div className="rounded-xl px-4"
        style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {CHECKS.map(({ key, label, sub, critical }) => (
          <Toggle key={key} checked={!!state[key]}
            onChange={upd(key)}
            label={critical ? `⚡ ${label}` : label}
            subLabel={sub} />
        ))}
      </div>

      {/* Observaciones */}
      <Field label="Observaciones de la inspección">
        <textarea value={state.obsInspeccion}
          onChange={(e) => setState((p: WizardState) => ({ ...p, obsInspeccion: e.target.value }))}
          rows={2} placeholder="Novedades observadas durante la inspección…"
          className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
      </Field>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">← Atrás</button>
        <button onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "#F59E0B", color: "#000" }}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// PASO 4: Registro de lotes
function Paso4Lotes({ state, setState, onNext, onBack }: { state: WizardState; setState: any; onNext: () => void; onBack: () => void }) {
  const [activeLote, setActiveLote] = useState(0);

  const updLote = (idx: number, field: keyof LoteForm, value: unknown) =>
    setState((p: WizardState) => {
      const lotes = [...p.lotes];
      lotes[idx] = { ...lotes[idx], [field]: value };
      return { ...p, lotes };
    });

  const lote = state.lotes[activeLote];
  const validos = state.lotes.filter((l) => l.fechaVencimiento && Number(l.cantidadRecibida) > 0).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Registro de lotes</h2>
        <p className="text-[13px] text-[#475569]">
          Completa los datos de cada ítem recibido. {validos}/{state.lotes.length} lotes completos.
        </p>
      </div>

      {/* Tabs de ítems */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {state.lotes.map((l, i) => {
          const completo = l.fechaVencimiento && Number(l.cantidadRecibida) > 0;
          return (
            <button key={i} onClick={() => setActiveLote(i)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all shrink-0"
              style={{
                background: activeLote === i ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeLote === i ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: activeLote === i ? "#F59E0B" : "#64748B",
              }}>
              <span className="w-1.5 h-1.5 rounded-full"
                style={{ background: completo ? "#22C55E" : "#334155" }} />
              {l.itemNombre}
              {l.categoriaFrio && <span className="text-[10px]">❄</span>}
            </button>
          );
        })}
      </div>

      {/* Formulario del lote activo */}
      {lote && (
        <div className="rounded-xl p-5 flex flex-col gap-4"
          style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Header del ítem */}
          <div className="flex items-center gap-3 pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.12)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#F59E0B" strokeWidth="1.8">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-white">{lote.itemNombre}</p>
              <p className="text-[11px] text-[#475569] font-mono">
                Esperado: {lote.cantidadEsperada} {lote.unidadMedida}
                {lote.categoriaFrio && ` · Cadena frío: ${lote.temperaturaMinima}°–${lote.temperaturaMaxima}°C`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="No. lote proveedor">
              <Inp value={lote.numeroLoteProveedor}
                onChange={(v) => updLote(activeLote, "numeroLoteProveedor", v)}
                placeholder="Ej: LOT-20260101" />
            </Field>
            <Field label="Cantidad recibida" required>
              <div className="relative">
                <Inp type="number" value={lote.cantidadRecibida}
                  onChange={(v) => updLote(activeLote, "cantidadRecibida", v)}
                  placeholder="0" min="0" step="0.01" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#475569] font-mono">
                  {lote.unidadMedida}
                </span>
              </div>
            </Field>
            <Field label="Fecha fabricación">
              <Inp type="date" value={lote.fechaFabricacion}
                onChange={(v) => updLote(activeLote, "fechaFabricacion", v)} max={today} />
            </Field>
            <Field label="Fecha vencimiento" required>
              <Inp type="date" value={lote.fechaVencimiento}
                onChange={(v) => updLote(activeLote, "fechaVencimiento", v)} min={today} />
            </Field>

            {lote.categoriaFrio && (
              <Field label="Temperatura medida" hint={`Rango aceptable: ${lote.temperaturaMinima}°C – ${lote.temperaturaMaxima}°C`}>
                <div className="relative">
                  <Inp type="number" value={lote.temperaturaMedida}
                    onChange={(v) => updLote(activeLote, "temperaturaMedida", v)}
                    placeholder="Ej: 3.2" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#475569]">°C</span>
                </div>
              </Field>
            )}

            <Field label="Estado sensorial">
              <Sel value={lote.estadoSensorial}
                onChange={(v) => updLote(activeLote, "estadoSensorial", Number(v))}>
                {Object.entries(EstadoSensorialLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Sel>
            </Field>

            <Field label="Estado de rotulado">
              <Sel value={lote.estadoRotulado}
                onChange={(v) => updLote(activeLote, "estadoRotulado", Number(v))}>
                {Object.entries(EstadoRotuladoLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Sel>
            </Field>

            <Field label="Ubicación destino">
              <Sel value={lote.ubicacionDestino}
                onChange={(v) => updLote(activeLote, "ubicacionDestino", Number(v))}>
                <option value={UbicacionDestino.Almacen}>Almacén</option>
                <option value={UbicacionDestino.Cuarentena}>Cuarentena</option>
              </Sel>
            </Field>
          </div>

          {/* Navegación entre lotes */}
          {state.lotes.length > 1 && (
            <div className="flex items-center justify-between pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => setActiveLote((p) => Math.max(0, p - 1))}
                disabled={activeLote === 0}
                className="text-[12px] text-[#475569] hover:text-[#94A3B8] disabled:opacity-30">
                ← Ítem anterior
              </button>
              <span className="text-[11px] text-[#334155] font-mono">
                {activeLote + 1} / {state.lotes.length}
              </span>
              <button onClick={() => setActiveLote((p) => Math.min(state.lotes.length - 1, p + 1))}
                disabled={activeLote === state.lotes.length - 1}
                className="text-[12px] text-[#475569] hover:text-[#94A3B8] disabled:opacity-30">
                Ítem siguiente →
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">← Atrás</button>
        <button onClick={onNext} disabled={validos === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ background: "#F59E0B", color: "#000" }}>
          Continuar ({validos}/{state.lotes.length}) →
        </button>
      </div>
    </div>
  );
}

// PASO 5: Documentos y confirmación
function Paso5Documentos({ state, setState, onSubmit, submitting, onBack }: {
  state: WizardState; setState: any; onSubmit: () => void; submitting: boolean; onBack: () => void;
}) {
  const TIPOS_REQ = [
    TipoDocumento.RegistroSanitarioINVIMA,
    TipoDocumento.CertificadoAnalisis,
    ...(state.lotes.some((l) => l.categoriaFrio) ? [TipoDocumento.CertificadoTransporte] : []),
  ];

  const getDoc = (tipo: TipoDocumento) =>
    state.documentos.find((d) => d.tipo === tipo);

  const setDoc = (tipo: TipoDocumento, archivo: File | null) =>
    setState((p: WizardState) => {
      const docs = p.documentos.filter((d) => d.tipo !== tipo);
      if (archivo) docs.push({ tipo, archivo });
      return { ...p, documentos: docs };
    });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Documentos y confirmación</h2>
        <p className="text-[13px] text-[#475569]">
          Adjunta los soportes requeridos por normativa (Res. 2674/2013 — INVIMA).
        </p>
      </div>

      {/* Documentos requeridos */}
      <div className="flex flex-col gap-3">
        {TIPOS_REQ.map((tipo) => {
          const doc = getDoc(tipo);
          return (
            <div key={tipo} className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: doc ? "rgba(34,197,94,0.05)" : "rgba(15,23,42,0.6)",
                border: `1px solid ${doc ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)"}`,
              }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: doc ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                  color: doc ? "#86EFAC" : "#475569",
                }}>
                {doc
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" /></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#CBD5E1] font-medium">{TipoDocumentoLabels[tipo]}</p>
                {doc && <p className="text-[11px] text-[#64748B] truncate">{doc.archivo?.name}</p>}
              </div>
              <label className="cursor-pointer text-[12px] px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#F59E0B",
                }}>
                {doc ? "Cambiar" : "Adjuntar"}
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={(e) => setDoc(tipo, e.target.files?.[0] ?? null)} />
              </label>
            </div>
          );
        })}
      </div>

      {/* Resumen final */}
      <div className="rounded-xl p-5"
        style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)" }}>
        <p className="text-[11px] text-[#F59E0B] tracking-widest uppercase font-mono mb-3">
          Resumen de la recepción
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
          {[
            ["OC", state.ocSeleccionada?.numeroOC],
            ["Proveedor", state.ocSeleccionada?.proveedorNombre],
            ["Fecha", state.fechaRecepcion],
            ["Placa", state.placaVehiculo || "—"],
            ["Lotes", `${state.lotes.filter(l => l.fechaVencimiento).length} de ${state.lotes.length}`],
            ["Documentos", `${state.documentos.length} adjunto(s)`],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-[11px] text-[#475569] font-mono">{k}:</span>
              <span className="text-[12px] text-[#CBD5E1]">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">← Atrás</button>
        <button onClick={onSubmit} disabled={submitting}
          className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
          style={{ background: "#F59E0B", color: "#000" }}>
          {submitting
            ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Guardando…</>
            : "✓ Confirmar recepción"}
        </button>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function NuevaRecepcionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<WizardState>({
    ocSeleccionada: null,
    fechaRecepcion: today,
    horaLlegada: nowTime,
    placaVehiculo: "",
    nombreTransportista: "",
    observaciones: "",
    tempInicial: "",
    temperaturaDentroRango: true,
    integridadEmpaque: true,
    limpiezaVehiculo: true,
    oloresExtranos: true,
    plagasVisible: true,
    documentosTransporteOk: true,
    obsInspeccion: "",
    lotes: [],
    documentos: [],
    recepcionId: null,
  });

  const handleSubmit = async () => {
    if (!state.ocSeleccionada) return;
    setSubmitting(true);
    setError(null);

    if (isMock) {
      await new Promise((r) => setTimeout(r, 1200));
      navigate(ROUTES.RECEPCIONES);
      return;
    }

    try {
      // 1. Crear recepción
      const { id } = await recepcionesService.iniciar({
        ordenCompraId: state.ocSeleccionada.id,
        fechaRecepcion: state.fechaRecepcion,
        horaLlegadaVehiculo: `${state.horaLlegada}:00`,
        placaVehiculo: state.placaVehiculo || undefined,
        nombreTransportista: state.nombreTransportista || undefined,
        observacionesGenerales: state.observaciones || undefined,
      });

      // 2. Inspección vehículo
      await recepcionesService.registrarInspeccionVehiculo(id, {
        recepcionId: id,
        temperaturaInicial: state.tempInicial ? Number(state.tempInicial) : undefined,
        temperaturaDentroRango: state.temperaturaDentroRango,
        integridadEmpaque: state.integridadEmpaque,
        limpiezaVehiculo: state.limpiezaVehiculo,
        presenciaOloresExtranos: !state.oloresExtranos,
        plagasVisible: !state.plagasVisible,
        documentosTransporteOk: state.documentosTransporteOk,
        observaciones: state.obsInspeccion || undefined,
      });

      // 3. Registrar lotes
      for (const lote of state.lotes.filter((l) => l.fechaVencimiento)) {
        const { id: loteId } = await recepcionesService.registrarLote(id, {
          recepcionId: id,
          detalleOcId: lote.detalleOcId,
          itemId: lote.itemId,
          numeroLoteProveedor: lote.numeroLoteProveedor || undefined,
          fechaFabricacion: lote.fechaFabricacion || undefined,
          fechaVencimiento: lote.fechaVencimiento,
          cantidadRecibida: Number(lote.cantidadRecibida),
          unidadMedida: lote.unidadMedida,
          temperaturaMedida: lote.temperaturaMedida ? Number(lote.temperaturaMedida) : undefined,
          estadoSensorial: lote.estadoSensorial,
          estadoRotulado: lote.estadoRotulado,
          ubicacionDestino: lote.ubicacionDestino,
        });

        // Registrar temperatura del lote si aplica
        if (lote.temperaturaMedida) {
          await recepcionesService.registrarTemperatura(id, {
            recepcionId: id,
            loteRecibidoId: loteId,
            temperatura: Number(lote.temperaturaMedida),
            origen: OrigenTemperatura.Manual,
          });
        }
      }

      // 4. Subir documentos
      for (const doc of state.documentos) {
        if (doc.archivo) {
          await recepcionesService.subirDocumento(id, doc.tipo, doc.archivo);
        }
      }

      navigate(`/recepciones/${id}`);
    } catch (err) {
      setError("Ocurrió un error al guardar la recepción. Revisa los datos e intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepProps = { state, setState, onBack: () => setStep((p) => p - 1) };

  return (
    <div className="max-w-2xl mx-auto" style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(ROUTES.RECEPCIONES)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-[10px] text-[#475569] tracking-[0.3em] uppercase font-mono">Nueva recepción</p>
          <h1 className="text-lg font-bold text-white leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Recepción de materia prima
          </h1>
        </div>
      </div>

      {/* Progress */}
      <StepBar current={step} />

      {/* Error global */}
      {error && (
        <div className="mb-5 rounded-xl px-5 py-4 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Contenido del paso */}
      <div className="rounded-2xl p-6"
        style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {step === 1 && <Paso1OC {...stepProps} onNext={() => setStep(2)} />}
        {step === 2 && <Paso2Checkin {...stepProps} onNext={() => setStep(3)} />}
        {step === 3 && <Paso3Inspeccion {...stepProps} onNext={() => setStep(4)} />}
        {step === 4 && <Paso4Lotes {...stepProps} onNext={() => setStep(5)} />}
        {step === 5 && <Paso5Documentos {...stepProps} onSubmit={handleSubmit} submitting={submitting} />}
      </div>
    </div>
  );
}