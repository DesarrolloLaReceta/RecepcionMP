import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  recepcionesService,
  type RecepcionDetalle,
  type LoteRecibido,
} from "../../Services/recepciones.service";
import {
  EstadoRecepcion,
  EstadoSensorialLabels,
  EstadoRotuladoLabels,
  TipoDocumentoLabels,
  TipoDocumento,
  OrigenTemperatura,
} from "../../Types/api";
import { ROUTES } from "../../Constants/routes";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── MOCK DE DETALLE ──────────────────────────────────────────────────────────

const MOCK_DETALLE: RecepcionDetalle = {
  id: "rec-001",
  numeroRecepcion: "REC-2026-0048",
  ordenCompraNumero: "OC-2026-0112",
  ordenCompraId: "oc-001",
  proveedorNombre: "AviCol S.A.",
  proveedorId: "prov-001",
  fechaRecepcion: "2026-02-24",
  horaLlegadaVehiculo: "07:30:00",
  placaVehiculo: "OPQ-451",
  nombreTransportista: "Luis García",
  observacionesGenerales: "Llegó 10 minutos antes de lo programado. Sin novedades en la vía.",
  estado: EstadoRecepcion.PendienteCalidad,
  totalLotes: 2,
  lotesLiberados: 0,
  lotesRechazados: 0,
  inspeccionVehiculo: {
    temperaturaInicial: 3.2,
    temperaturaDentroRango: true,
    integridadEmpaque: true,
    limpiezaVehiculo: true,
    presenciaOloresExtranos: false,
    plagasVisible: false,
    documentosTransporteOk: true,
    observaciones: "Vehículo en buenas condiciones. Bitácora de temperatura presentada.",
    fechaRegistro: "2026-02-24T07:35:00",
  },
  lotes: [
    {
      id: "lote-001",
      itemId: "item-001",
      itemNombre: "Pechuga de pollo",
      itemCodigo: "CAR-001",
      detalleOcId: "det-001",
      numeroLoteProveedor: "AVL-20260201",
      numeroLoteInterno: "L-2026-0048-01",
      fechaFabricacion: "2026-02-01",
      fechaVencimiento: "2026-03-01",
      cantidadRecibida: 498,
      cantidadEsperada: 500,
      unidadMedida: "Kg",
      temperaturaMedida: 3.5,
      estadoSensorial: 0,
      estadoRotulado: 0,
      ubicacionDestino: 0,
      estado: "PendienteCalidad",
      documentos: [
        { id: "d1", tipoDocumento: TipoDocumento.RegistroSanitarioINVIMA, nombreArchivo: "registro_invima_avicol.pdf", urlDescarga: "#", fechaCarga: "2026-02-24T07:40:00" },
        { id: "d2", tipoDocumento: TipoDocumento.CertificadoAnalisis, nombreArchivo: "coa_pechuga_lot202602.pdf", urlDescarga: "#", fechaCarga: "2026-02-24T07:41:00" },
      ],
    },
    {
      id: "lote-002",
      itemId: "item-002",
      itemNombre: "Muslo de pollo",
      itemCodigo: "CAR-002",
      detalleOcId: "det-002",
      numeroLoteProveedor: "AVL-20260202",
      numeroLoteInterno: "L-2026-0048-02",
      fechaFabricacion: "2026-02-01",
      fechaVencimiento: "2026-03-03",
      cantidadRecibida: 300,
      cantidadEsperada: 300,
      unidadMedida: "Kg",
      temperaturaMedida: 3.8,
      estadoSensorial: 0,
      estadoRotulado: 0,
      ubicacionDestino: 0,
      estado: "PendienteCalidad",
      documentos: [],
    },
  ],
  documentos: [
    { id: "d3", tipoDocumento: TipoDocumento.CertificadoTransporte, nombreArchivo: "bitacora_temp_OPQ451.pdf", urlDescarga: "#", fechaCarga: "2026-02-24T07:42:00" },
  ],
  temperaturas: [
    { id: "t1", temperatura: 3.2, unidadMedida: "°C", origen: OrigenTemperatura.Manual, observacion: "Lectura inicial al abrir compartimento", fechaRegistro: "2026-02-24T07:35:00" },
    { id: "t2", temperatura: 3.5, unidadMedida: "°C", origen: OrigenTemperatura.Manual, observacion: "Pechuga de pollo — lote AVL-20260201", fechaRegistro: "2026-02-24T07:50:00" },
    { id: "t3", temperatura: 3.8, unidadMedida: "°C", origen: OrigenTemperatura.Bluetooth, dispositivoId: "THERMO-BT-01", fechaRegistro: "2026-02-24T07:55:00" },
  ],
};

// ─── CONFIGURACIÓN ESTADO ──────────────────────────────────────────────────────

const ESTADO_CFG: Record<EstadoRecepcion, { label: string; color: string; bg: string; dot: string }> = {
  [EstadoRecepcion.Iniciada]:           { label: "Iniciada",        color: "#93C5FD", bg: "rgba(59,130,246,0.1)",  dot: "#3B82F6" },
  [EstadoRecepcion.InspeccionVehiculo]: { label: "Insp. vehículo",  color: "#C4B5FD", bg: "rgba(168,85,247,0.1)", dot: "#A855F7" },
  [EstadoRecepcion.RegistroLotes]:      { label: "Reg. lotes",      color: "#FCD34D", bg: "rgba(245,158,11,0.1)", dot: "#F59E0B" },
  [EstadoRecepcion.PendienteCalidad]:   { label: "Pend. calidad",   color: "#FCA5A5", bg: "rgba(239,68,68,0.1)",  dot: "#EF4444" },
  [EstadoRecepcion.Liberada]:           { label: "Liberada",        color: "#86EFAC", bg: "rgba(34,197,94,0.1)",  dot: "#22C55E" },
  [EstadoRecepcion.Rechazada]:          { label: "Rechazada",       color: "#94A3B8", bg: "rgba(100,116,139,0.1)", dot: "#64748B" },
};

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function diasParaVencer(fecha?: string): number | null {
  if (!fecha) return null;
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
}

const ORIGEN_LABELS: Record<number, string> = {
  [OrigenTemperatura.Manual]:    "Manual",
  [OrigenTemperatura.Bluetooth]: "Bluetooth",
  [OrigenTemperatura.Sensor]:    "Sensor IoT",
};

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#64748B] font-mono">
          {title}
        </h3>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

function DataRow({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5 px-5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <span className="text-[12px] text-[#475569] shrink-0">{label}</span>
      <span className={`text-[12px] text-[#CBD5E1] text-right ${mono ? "font-mono" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function CheckItem({ label, value, critical }: { label: string; value: boolean; critical?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <span className="text-[12px] text-[#64748B]">
        {critical && <span className="text-[#F59E0B] mr-1">⚡</span>}
        {label}
      </span>
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono`}
        style={{
          background: value ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          color: value ? "#86EFAC" : "#FCA5A5",
        }}>
        {value ? "✓ OK" : "✗ Fallo"}
      </span>
    </div>
  );
}

function TempBadge({ temp, min, max }: { temp: number; min?: number; max?: number }) {
  const fuera = (min !== undefined && temp < min) || (max !== undefined && temp > max);
  return (
    <span className="text-[13px] font-bold font-mono"
      style={{ color: fuera ? "#FCA5A5" : "#86EFAC" }}>
      {temp}°C
      {fuera && <span className="ml-1 text-[10px]">⚠</span>}
    </span>
  );
}

// Tarjeta de lote
function LoteCard({ lote, expanded, onToggle }: {
  lote: LoteRecibido; expanded: boolean; onToggle: () => void;
}) {
  const dias = diasParaVencer(lote.fechaVencimiento);
  const diasColor = dias === null ? "#64748B" : dias <= 7 ? "#FCA5A5" : dias <= 15 ? "#FCD34D" : "#86EFAC";
  const diff = lote.cantidadRecibida - lote.cantidadEsperada;

  return (
    <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      {/* Header del lote */}
      <button onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
        {/* Código interno */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-bold text-white">{lote.itemNombre}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}>
              {lote.numeroLoteInterno}
            </span>
          </div>
          <p className="text-[11px] text-[#475569] font-mono mt-0.5">
            Lote prov: {lote.numeroLoteProveedor || "—"} · {lote.cantidadRecibida} {lote.unidadMedida} recibidos
          </p>
        </div>

        {/* Indicadores rápidos */}
        <div className="flex items-center gap-4 shrink-0">
          {lote.temperaturaMedida !== undefined && (
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-[#334155] mb-0.5">Temperatura</p>
              <TempBadge temp={lote.temperaturaMedida} />
            </div>
          )}
          <div className="text-right">
            <p className="text-[10px] text-[#334155] mb-0.5">Vence en</p>
            <p className="text-[12px] font-bold font-mono" style={{ color: diasColor }}>
              {dias === null ? "—" : dias <= 0 ? "VENCIDO" : `${dias}d`}
            </p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#334155" strokeWidth="2" strokeLinecap="round"
            className="transition-transform duration-200"
            style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </button>

      {/* Detalle expandido */}
      {expanded && (
        <div className="px-5 pb-5 pt-1">
          <div className="rounded-xl overflow-hidden"
            style={{ background: "rgba(8,13,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}>

              {/* Datos del lote */}
              <div className="p-4">
                <p className="text-[10px] text-[#334155] tracking-widest uppercase font-mono mb-3">Datos del lote</p>
                {[
                  ["Cod. ítem", lote.itemCodigo],
                  ["Fab.", fmtDate(lote.fechaFabricacion)],
                  ["Vence", fmtDate(lote.fechaVencimiento)],
                  ["Cantidad", `${lote.cantidadRecibida} / ${lote.cantidadEsperada} ${lote.unidadMedida}`],
                  ["Diferencia", diff === 0 ? "Sin diferencia" : `${diff > 0 ? "+" : ""}${diff} ${lote.unidadMedida}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <span className="text-[11px] text-[#475569]">{k}</span>
                    <span className={`text-[11px] font-mono ${diff !== 0 && k === "Diferencia" ? "text-[#FCD34D]" : "text-[#94A3B8]"}`}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Inspección sensorial */}
              <div className="p-4">
                <p className="text-[10px] text-[#334155] tracking-widest uppercase font-mono mb-3">Inspección</p>
                {[
                  ["Sensorial", EstadoSensorialLabels[lote.estadoSensorial as keyof typeof EstadoSensorialLabels]],
                  ["Rotulado", EstadoRotuladoLabels[lote.estadoRotulado as keyof typeof EstadoRotuladoLabels]],
                  ["Destino", lote.ubicacionDestino === 0 ? "Almacén" : "Cuarentena"],
                  ["Temperatura", lote.temperaturaMedida !== undefined ? `${lote.temperaturaMedida}°C` : "N/A"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <span className="text-[11px] text-[#475569]">{k}</span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">{v as string}</span>
                  </div>
                ))}
              </div>

              {/* Documentos del lote */}
              <div className="p-4">
                <p className="text-[10px] text-[#334155] tracking-widest uppercase font-mono mb-3">
                  Documentos ({lote.documentos.length})
                </p>
                {lote.documentos.length === 0
                  ? <p className="text-[11px] text-[#334155]">Sin documentos adjuntos</p>
                  : lote.documentos.map((d) => (
                    <a key={d.id} href={d.urlDescarga}
                      className="flex items-center gap-2 py-1.5 group"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="#475569" strokeWidth="2" className="shrink-0">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="text-[11px] text-[#64748B] group-hover:text-[#F59E0B] transition-colors truncate">
                        {TipoDocumentoLabels[d.tipoDocumento as TipoDocumento]}
                      </span>
                    </a>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function DetalleRecepcionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [recepcion, setRecepcion] = useState<RecepcionDetalle | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [expandedLotes, setExpandedLotes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"lotes" | "inspeccion" | "documentos" | "temperaturas">("lotes");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = isMock ? MOCK_DETALLE : await recepcionesService.getById(id!);
        setRecepcion(data);
      } catch {
        setError("No se pudo cargar el detalle de la recepción.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggleLote = (loteId: string) => {
    setExpandedLotes((prev) => {
      const next = new Set(prev);
      next.has(loteId) ? next.delete(loteId) : next.add(loteId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#475569] text-xs font-mono">Cargando recepción…</p>
        </div>
      </div>
    );
  }

  if (error || !recepcion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-400 text-sm">{error ?? "Recepción no encontrada."}</p>
        <button onClick={() => navigate(ROUTES.RECEPCIONES)}
          className="text-[#F59E0B] text-sm underline">
          Volver a recepciones
        </button>
      </div>
    );
  }

  const cfg = ESTADO_CFG[recepcion.estado];

  const TABS = [
    { key: "lotes",        label: `Lotes (${recepcion.lotes.length})` },
    { key: "inspeccion",   label: "Inspección vehículo" },
    { key: "documentos",   label: `Documentos (${recepcion.documentos.length})` },
    { key: "temperaturas", label: `Temperaturas (${recepcion.temperaturas.length})` },
  ] as const;

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto"
      style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* ── Encabezado ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(ROUTES.RECEPCIONES)}
          className="w-8 h-8 mt-1 rounded-lg flex items-center justify-center shrink-0 transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-[10px] text-[#475569] tracking-[0.3em] uppercase font-mono">
              {recepcion.ordenCompraNumero}
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold"
              style={{ background: cfg.bg, color: cfg.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {cfg.label}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {recepcion.numeroRecepcion}
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">{recepcion.proveedorNombre}</p>
        </div>
      </div>

      {/* ── Datos generales ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Datos de la recepción">
          <DataRow label="Fecha"         value={fmtDate(recepcion.fechaRecepcion)} />
          <DataRow label="Hora llegada"  value={recepcion.horaLlegadaVehiculo?.slice(0, 5)} mono />
          <DataRow label="Placa"         value={recepcion.placaVehiculo} mono />
          <DataRow label="Transportista" value={recepcion.nombreTransportista} />
          {recepcion.observacionesGenerales && (
            <div className="px-5 py-3">
              <p className="text-[10px] text-[#334155] uppercase tracking-wider font-mono mb-1">Observaciones</p>
              <p className="text-[12px] text-[#64748B] leading-relaxed">{recepcion.observacionesGenerales}</p>
            </div>
          )}
        </Section>

        {/* Resumen de lotes */}
        <Section title="Resumen de lotes">
          <DataRow label="Total lotes"    value={recepcion.totalLotes} />
          <DataRow label="Liberados"      value={
            <span style={{ color: "#86EFAC" }}>{recepcion.lotesLiberados}</span>
          } />
          <DataRow label="Rechazados"     value={
            <span style={{ color: recepcion.lotesRechazados > 0 ? "#FCA5A5" : "#64748B" }}>
              {recepcion.lotesRechazados}
            </span>
          } />
          <DataRow label="Pendientes"     value={
            recepcion.totalLotes - recepcion.lotesLiberados - recepcion.lotesRechazados
          } />
          {/* Barra */}
          <div className="px-5 py-4">
            <div className="flex h-2 rounded-full overflow-hidden gap-px"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              {recepcion.lotesLiberados > 0 && (
                <div className="h-full bg-green-400 transition-all"
                  style={{ width: `${(recepcion.lotesLiberados / recepcion.totalLotes) * 100}%` }} />
              )}
              {recepcion.lotesRechazados > 0 && (
                <div className="h-full bg-red-400"
                  style={{ width: `${(recepcion.lotesRechazados / recepcion.totalLotes) * 100}%` }} />
              )}
            </div>
          </div>
        </Section>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="px-4 py-2 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all"
            style={{
              background: activeTab === t.key ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${activeTab === t.key ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.06)"}`,
              color: activeTab === t.key ? "#F59E0B" : "#64748B",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Contenido de tab ─────────────────────────────────────────────── */}

      {/* LOTES */}
      {activeTab === "lotes" && (
        <Section title={`Lotes recibidos (${recepcion.lotes.length})`}
          action={
            <button
              onClick={() => {
                if (expandedLotes.size === recepcion.lotes.length) {
                  setExpandedLotes(new Set());
                } else {
                  setExpandedLotes(new Set(recepcion.lotes.map(l => l.id)));
                }
              }}
              className="text-[10px] text-[#475569] hover:text-[#F59E0B] transition-colors font-mono">
              {expandedLotes.size === recepcion.lotes.length ? "Colapsar todo" : "Expandir todo"}
            </button>
          }>
          {recepcion.lotes.map((lote) => (
            <LoteCard key={lote.id} lote={lote}
              expanded={expandedLotes.has(lote.id)}
              onToggle={() => toggleLote(lote.id)} />
          ))}
        </Section>
      )}

      {/* INSPECCIÓN */}
      {activeTab === "inspeccion" && (
        <Section title="Inspección del vehículo BPM">
          {recepcion.inspeccionVehiculo ? (
            <>
              {recepcion.inspeccionVehiculo.temperaturaInicial !== undefined && (
                <div className="px-5 py-4 flex items-center gap-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2">
                    <path d="M12 2v20M12 2l-4 4M12 2l4 4" strokeLinecap="round" />
                  </svg>
                  <span className="text-[12px] text-[#64748B]">Temperatura inicial del compartimento</span>
                  <span className="ml-auto text-[14px] font-bold font-mono text-[#93C5FD]">
                    {recepcion.inspeccionVehiculo.temperaturaInicial}°C
                  </span>
                </div>
              )}
              <CheckItem label="Temperatura dentro de rango" value={recepcion.inspeccionVehiculo.temperaturaDentroRango} critical />
              <CheckItem label="Integridad de empaque"        value={recepcion.inspeccionVehiculo.integridadEmpaque} />
              <CheckItem label="Limpieza del vehículo"        value={recepcion.inspeccionVehiculo.limpiezaVehiculo} />
              <CheckItem label="Sin olores extraños"          value={!recepcion.inspeccionVehiculo.presenciaOloresExtranos} />
              <CheckItem label="Sin evidencia de plagas"      value={!recepcion.inspeccionVehiculo.plagasVisible} />
              <CheckItem label="Documentos de transporte OK"  value={recepcion.inspeccionVehiculo.documentosTransporteOk} />
              {recepcion.inspeccionVehiculo.observaciones && (
                <div className="px-5 py-4">
                  <p className="text-[10px] text-[#334155] uppercase tracking-wider font-mono mb-1">Observaciones</p>
                  <p className="text-[12px] text-[#64748B] leading-relaxed">{recepcion.inspeccionVehiculo.observaciones}</p>
                </div>
              )}
              <DataRow label="Registrado" value={fmtDateTime(recepcion.inspeccionVehiculo.fechaRegistro)} />
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#334155] text-sm">Inspección aún no registrada.</p>
            </div>
          )}
        </Section>
      )}

      {/* DOCUMENTOS */}
      {activeTab === "documentos" && (
        <Section title="Documentos de la recepción">
          {recepcion.documentos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#334155] text-sm">Sin documentos adjuntos a la recepción.</p>
            </div>
          ) : (
            recepcion.documentos.map((doc) => (
              <div key={doc.id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#CBD5E1] font-medium">
                    {TipoDocumentoLabels[doc.tipoDocumento as TipoDocumento]}
                  </p>
                  <p className="text-[11px] text-[#475569] font-mono truncate">{doc.nombreArchivo}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-[#334155]">{fmtDateTime(doc.fechaCarga)}</p>
                </div>
                <a href={doc.urlDescarga}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </a>
              </div>
            ))
          )}
        </Section>
      )}

      {/* TEMPERATURAS */}
      {activeTab === "temperaturas" && (
        <Section title="Registro de temperaturas">
          {recepcion.temperaturas.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#334155] text-sm">Sin registros de temperatura.</p>
            </div>
          ) : (
            recepcion.temperaturas.map((t, i) => (
              <div key={t.id}
                className="flex items-center gap-4 px-5 py-3.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0"
                  style={{ background: "rgba(147,197,253,0.06)", border: "1px solid rgba(147,197,253,0.1)", color: "#93C5FD" }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}>
                      {ORIGEN_LABELS[t.origen]}
                    </span>
                    {t.dispositivoId && (
                      <span className="text-[10px] text-[#334155] font-mono">{t.dispositivoId}</span>
                    )}
                  </div>
                  {t.observacion && (
                    <p className="text-[12px] text-[#64748B] mt-0.5">{t.observacion}</p>
                  )}
                  <p className="text-[11px] text-[#334155] mt-0.5 font-mono">{fmtDateTime(t.fechaRegistro)}</p>
                </div>
                <p className="text-[18px] font-bold font-mono text-[#93C5FD] shrink-0">
                  {t.temperatura}°C
                </p>
              </div>
            ))
          )}
        </Section>
      )}
    </div>
  );
}