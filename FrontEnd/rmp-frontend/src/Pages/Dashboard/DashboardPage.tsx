import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";
import { useDashboard } from "../../Hooks/useDashboard";
import { ROUTES } from "../../Constants/routes";
import type {
  LoteVencimiento,
  DocumentoPorVencer,
  TemperaturaFueraRango,
} from "../../Services/dashboard.service";

// ─── DATOS MOCK (desarrollo sin backend) ──────────────────────────────────────

const MOCK_KPIS = {
  totalRecepciones: 148,
  recepcionesAceptadas: 129,
  recepcionesRechazadas: 11,
  recepcionesCuarentena: 4,
  recepcionesPendienteCalidad: 4,
  totalLotes: 312,
  lotesLiberados: 278,
  lotesRechazados: 19,
  lotesCuarentena: 8,
  lotesPendientes: 7,
  tasaAceptacion: 87.2,
  tasaRechazo: 7.4,
  proveedoresActivos: 23,
  noConformidadesAbiertas: 6,
};

const MOCK_VENCIMIENTOS: LoteVencimiento[] = [
  { loteId: "1", numeroLote: "L-2025-0041", itemNombre: "Leche entera UHT", proveedorNombre: "Lácteos del Valle", fechaVencimiento: "2026-03-01", diasRestantes: 5, estado: "PendienteCalidad" },
  { loteId: "2", numeroLote: "L-2025-0038", itemNombre: "Pechuga pollo", proveedorNombre: "AviCol S.A.", fechaVencimiento: "2026-03-03", diasRestantes: 7, estado: "Liberado" },
  { loteId: "3", numeroLote: "L-2025-0035", itemNombre: "Azúcar refinada", proveedorNombre: "Riopaila Castilla", fechaVencimiento: "2026-03-10", diasRestantes: 14, estado: "Liberado" },
  { loteId: "4", numeroLote: "L-2025-0031", itemNombre: "Carne res molida", proveedorNombre: "Frigorífico Guadalupe", fechaVencimiento: "2026-03-15", diasRestantes: 19, estado: "Cuarentena" },
  { loteId: "5", numeroLote: "L-2025-0028", itemNombre: "Pasta de tomate", proveedorNombre: "Alimentos Deli", fechaVencimiento: "2026-03-20", diasRestantes: 24, estado: "Liberado" },
];

const MOCK_DOCUMENTOS: DocumentoPorVencer[] = [
  { entidad: "Proveedor", entidadNombre: "AviCol S.A.", tipoDocumento: "Habilitación cárnicos (Dec. 1500)", fechaVencimiento: "2026-03-05", diasRestantes: 9 },
  { entidad: "Proveedor", entidadNombre: "Lácteos del Valle", tipoDocumento: "Registro sanitario INVIMA", fechaVencimiento: "2026-03-12", diasRestantes: 16 },
  { entidad: "Lote", entidadNombre: "L-2025-0041", tipoDocumento: "Certificado de análisis (COA)", fechaVencimiento: "2026-03-18", diasRestantes: 22 },
  { entidad: "Proveedor", entidadNombre: "Harinas del Meta S.A.", tipoDocumento: "Permiso sanitario", fechaVencimiento: "2026-03-25", diasRestantes: 29 },
];

const MOCK_TEMPS: TemperaturaFueraRango[] = [
  { loteId: "a1", itemNombre: "Pechuga de pollo", recepcionId: "r1", temperatura: 6.8, temperaturaMinima: 0, temperaturaMaxima: 4, fechaRegistro: "2026-02-24T08:32:00", origen: "Manual" },
  { loteId: "a2", itemNombre: "Leche entera UHT", recepcionId: "r2", temperatura: -1.2, temperaturaMinima: 2, temperaturaMaxima: 8, fechaRegistro: "2026-02-24T10:15:00", origen: "Bluetooth" },
];

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}
function urgencyColor(dias: number) {
  if (dias <= 7)  return { text: "#FCA5A5", bg: "rgba(239,68,68,0.08)",  dot: "#EF4444" };
  if (dias <= 15) return { text: "#FCD34D", bg: "rgba(245,158,11,0.08)", dot: "#F59E0B" };
  return              { text: "#86EFAC", bg: "rgba(34,197,94,0.06)",  dot: "#22C55E" };
}

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent = false, delay = 0 }: {
  label: string; value: string | number; sub?: string; accent?: boolean; delay?: number;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-1 relative overflow-hidden"
      style={{
        background: accent ? "rgba(245,158,11,0.06)" : "rgba(15,23,42,0.8)",
        border: `1px solid ${accent ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
        animation: "fadeSlideUp 0.4s ease both",
        animationDelay: `${delay}ms`,
      }}
    >
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-transparent" />
      )}
      <p className="text-[11px] text-[#475569] tracking-widest uppercase font-mono">{label}</p>
      <p className="text-3xl font-bold leading-none"
        style={{ color: accent ? "#F59E0B" : "#F1F5F9", fontFamily: "'DM Mono', monospace" }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-[#334155] mt-0.5">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-5 animate-pulse"
      style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="h-3 w-20 rounded mb-3" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="h-8 w-16 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2.5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span className="text-[12px] text-[#64748B]">{label}</span>
      <span className="text-[13px] font-bold font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

function ProgressBar({ value, color, bg }: { value: number; color: string; bg: string }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  );
}

function Panel({ title, count, children, onMore }: {
  title: string; count?: number; children: React.ReactNode; onMore?: () => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#94A3B8] font-mono">
            {title}
          </h3>
          {count !== undefined && count > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono"
              style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5" }}>
              {count}
            </span>
          )}
        </div>
        {onMore && (
          <button onClick={onMore}
            className="text-[10px] text-[#475569] hover:text-[#F59E0B] transition-colors font-mono">
            Ver todo →
          </button>
        )}
      </div>
      <div className="flex-1 divide-y" style={{ borderColor: "transparent" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors duration-100"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
      onClick={onClick}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      {children}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="text-center">
        <div className="text-green-400 mb-2" style={{ fontSize: "22px" }}>✓</div>
        <p className="text-[#334155] text-sm">{msg}</p>
      </div>
    </div>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

export default function DashboardPage() {
  const { displayName } = useAuth();
  const navigate = useNavigate();
  const now = new Date();

  const [mes, setMes] = useState(now.getMonth() + 1);
  const [año, setAño] = useState(now.getFullYear());

  const { kpis: kpisApi, vencimientos: vencApi, documentos: docsApi,
    temperaturas: tempsApi, loading, error, lastUpdated, refresh,
  } = useDashboard({ año, mes, diasUmbral: 30 });

  const kpis         = isMock ? MOCK_KPIS         : kpisApi;
  const vencimientos = isMock ? MOCK_VENCIMIENTOS : vencApi;
  const documentos   = isMock ? MOCK_DOCUMENTOS   : docsApi;
  const temperaturas = isMock ? MOCK_TEMPS        : tempsApi;
  const isLoading    = isMock ? false             : loading;

  const hour = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const firstName = displayName.split(" ")[0] || "Usuario";

  const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">

        {/* ── Header de página ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ animation: "fadeSlideUp 0.35s ease both" }}>
          <div>
            <p className="text-[11px] text-[#475569] tracking-[0.25em] uppercase font-mono mb-1">
              {greeting}
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {firstName}<span className="text-[#F59E0B]">.</span>
            </h1>
          </div>

          {/* Filtros + refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
              className="text-[12px] px-3 py-2 rounded-lg font-mono"
              style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8", outline: "none" }}>
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={año} onChange={(e) => setAño(Number(e.target.value))}
              className="text-[12px] px-3 py-2 rounded-lg font-mono"
              style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8", outline: "none" }}>
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={refresh} disabled={isLoading} title="Actualizar"
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#F59E0B" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.15)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.08)")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className={isLoading ? "animate-spin" : ""}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
            </button>
            {lastUpdated && !isMock && (
              <span className="text-[10px] text-[#334155] font-mono hidden lg:block">
                {lastUpdated.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {/* ── Error banner ──────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl px-5 py-4 flex items-center gap-3"
            style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p className="text-sm text-red-300 flex-1">{error}</p>
            <button onClick={refresh} className="text-xs text-red-400 underline shrink-0">Reintentar</button>
          </div>
        )}

        {/* ── KPIs: Recepciones ─────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] text-[#334155] tracking-[0.3em] uppercase font-mono mb-3">
            Recepciones · {MESES[mes - 1]} {año}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : <>
                <KpiCard label="Total"          value={kpis?.totalRecepciones ?? 0}            delay={0}   />
                <KpiCard label="Aceptadas"      value={kpis?.recepcionesAceptadas ?? 0}        delay={50}  accent />
                <KpiCard label="Rechazadas"     value={kpis?.recepcionesRechazadas ?? 0}       delay={100} />
                <KpiCard label="Cuarentena"     value={kpis?.recepcionesCuarentena ?? 0}       delay={150} />
                <KpiCard label="Pend. calidad"  value={kpis?.recepcionesPendienteCalidad ?? 0} delay={200} />
              </>
            }
          </div>
        </section>

        {/* ── Fila media: indicadores + lotes + acciones ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          style={{ animation: "fadeSlideUp 0.4s ease 0.2s both" }}>

          {/* Indicadores de calidad */}
          <div className="rounded-xl p-5"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] text-[#475569] tracking-widest uppercase font-mono mb-5">
              Indicadores de calidad
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-[#64748B]">Tasa de aceptación</span>
                  <span className="text-[13px] font-bold font-mono text-green-400">{kpis?.tasaAceptacion ?? 0}%</span>
                </div>
                <ProgressBar value={kpis?.tasaAceptacion ?? 0} color="#22C55E" bg="rgba(34,197,94,0.08)" />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-[#64748B]">Tasa de rechazo</span>
                  <span className="text-[13px] font-bold font-mono text-red-400">{kpis?.tasaRechazo ?? 0}%</span>
                </div>
                <ProgressBar value={kpis?.tasaRechazo ?? 0} color="#EF4444" bg="rgba(239,68,68,0.08)" />
              </div>
              <div className="pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <MiniStat label="Proveedores activos"       value={kpis?.proveedoresActivos ?? 0}      color="#94A3B8" />
                <MiniStat label="No conformidades abiertas" value={kpis?.noConformidadesAbiertas ?? 0} color={kpis?.noConformidadesAbiertas ? "#FCD34D" : "#86EFAC"} />
              </div>
            </div>
          </div>

          {/* Estado de lotes */}
          <div className="rounded-xl p-5"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] text-[#475569] tracking-widest uppercase font-mono mb-4">
              Estado de lotes
            </p>
            <p className="text-4xl font-bold font-mono text-white mb-0.5">{kpis?.totalLotes ?? 0}</p>
            <p className="text-[11px] text-[#334155] mb-4">lotes registrados en el período</p>
            <MiniStat label="Liberados"  value={kpis?.lotesLiberados ?? 0}  color="#86EFAC" />
            <MiniStat label="Rechazados" value={kpis?.lotesRechazados ?? 0} color="#FCA5A5" />
            <MiniStat label="Cuarentena" value={kpis?.lotesCuarentena ?? 0} color="#FCD34D" />
            <MiniStat label="Pendientes" value={kpis?.lotesPendientes ?? 0} color="#93C5FD" />
          </div>

          {/* Acciones rápidas */}
          <div className="rounded-xl p-5 flex flex-col gap-2.5"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] text-[#475569] tracking-widest uppercase font-mono mb-1">
              Acciones rápidas
            </p>
            {([
              { label: "Nueva recepción",      path: ROUTES.NUEVA_RECEPCION,   accent: true,
                d: "M12 5v14M5 12h14" },
              { label: "Ver recepciones",      path: ROUTES.RECEPCIONES,       accent: false,
                d: "M5 3h14a2 2 0 012 2v3H3V5a2 2 0 012-2zM3 8h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
              { label: "Liberación de lotes",  path: ROUTES.LIBERACION,        accent: false,
                d: "M9 12l2 2 4-4M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
              { label: "No conformidades",     path: ROUTES.NO_CONFORMIDADES,  accent: false,
                d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" },
            ] as const).map(({ label, path, accent, d }) => (
              <button key={String(path)} onClick={() => navigate(path as string)}
                className="flex items-center gap-3 w-full rounded-lg px-4 py-3 text-left text-[13px] font-medium transition-all duration-150"
                style={{
                  background: accent ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${accent ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
                  color: accent ? "#F59E0B" : "#94A3B8",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = accent
                    ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = accent
                    ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)";
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d={d} />
                </svg>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Paneles de alertas ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          style={{ animation: "fadeSlideUp 0.4s ease 0.35s both" }}>

          {/* Vencimientos de lotes */}
          <Panel title="Lotes próx. a vencer" count={vencimientos.length}
            onMore={() => navigate(ROUTES.LOTES)}>
            {vencimientos.length === 0
              ? <EmptyState msg="Sin alertas de vencimiento" />
              : vencimientos.slice(0, 5).map((v) => (
                <Row key={v.loteId}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: urgencyColor(v.diasRestantes).dot }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#CBD5E1] font-medium truncate">{v.itemNombre}</p>
                    <p className="text-[11px] text-[#475569] truncate font-mono">
                      {v.numeroLote} · {v.proveedorNombre}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-bold font-mono"
                      style={{ color: urgencyColor(v.diasRestantes).text }}>
                      {v.diasRestantes <= 0 ? "VENCIDO" : `${v.diasRestantes}d`}
                    </p>
                    <p className="text-[10px] text-[#334155]">{formatDate(v.fechaVencimiento)}</p>
                  </div>
                </Row>
              ))
            }
          </Panel>

          {/* Documentos por vencer */}
          <Panel title="Documentos por vencer" count={documentos.length}
            onMore={() => navigate(ROUTES.PROVEEDORES)}>
            {documentos.length === 0
              ? <EmptyState msg="Todos los documentos al día" />
              : documentos.slice(0, 5).map((d, i) => (
                <Row key={i}>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}>
                    {d.entidad.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#CBD5E1] font-medium truncate">{d.entidadNombre}</p>
                    <p className="text-[11px] text-[#475569] truncate">{d.tipoDocumento}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-bold font-mono"
                      style={{ color: urgencyColor(d.diasRestantes).text }}>
                      {d.diasRestantes}d
                    </p>
                    <p className="text-[10px] text-[#334155]">{formatDate(d.fechaVencimiento)}</p>
                  </div>
                </Row>
              ))
            }
          </Panel>

          {/* Temperaturas fuera de rango */}
          <Panel title="Temperaturas fuera de rango" count={temperaturas.length}
            onMore={() => navigate(ROUTES.RECEPCIONES)}>
            {temperaturas.length === 0
              ? <EmptyState msg="Todas las temperaturas dentro de rango" />
              : temperaturas.map((t) => {
                const over = t.temperatura > t.temperaturaMaxima;
                return (
                  <Row key={t.loteId}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0"
                      style={{
                        background: over ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
                        color: over ? "#FCA5A5" : "#93C5FD",
                      }}>
                      {over ? "▲" : "▼"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#CBD5E1] font-medium truncate">{t.itemNombre}</p>
                      <p className="text-[11px] text-[#475569] font-mono truncate">
                        Rango: {t.temperaturaMinima}°–{t.temperaturaMaxima}°C · {t.origen}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-bold font-mono"
                        style={{ color: over ? "#FCA5A5" : "#93C5FD" }}>
                        {t.temperatura}°C
                      </p>
                      <p className="text-[10px] text-[#334155]">{formatTime(t.fechaRegistro)}</p>
                    </div>
                  </Row>
                );
              })
            }
          </Panel>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[10px] text-[#1E293B] font-mono tracking-widest">
            CUMPLIMIENTO RES. 2674/2013 — INVIMA
          </p>
          {isMock && (
            <p className="text-[10px] text-[#1E293B] font-mono">⚙ Datos de demostración</p>
          )}
        </div>
      </div>
    </>
  );
}