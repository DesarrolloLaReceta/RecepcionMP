import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";
import { useDashboard } from "../../Hooks/useDashboard";
import { ROUTES } from "../../Constants/routes";
import { Skeleton, EmptyState, Badge } from "../../Components/UI/Index";
import type {
  LoteVencimiento,
  DocumentoPorVencer,
  TemperaturaFueraRango,
} from "../../Services/dashboard.service";
import "./DashboardPage.css";

// ─── DATOS MOCK (desarrollo sin backend) ─────────────────────────────────────

const MOCK_KPIS = {
  totalRecepciones:             148,
  recepcionesAceptadas:         129,
  recepcionesRechazadas:        11,
  recepcionesCuarentena:        4,
  recepcionesPendienteCalidad:  4,
  totalLotes:                   312,
  lotesLiberados:               278,
  lotesRechazados:              19,
  lotesCuarentena:              8,
  lotesPendientes:              7,
  tasaAceptacion:               87.2,
  tasaRechazo:                  7.4,
  proveedoresActivos:           23,
  noConformidadesAbiertas:      6,
};

const MOCK_VENCIMIENTOS: LoteVencimiento[] = [
  { loteId: "1", numeroLote: "L-2025-0041", itemNombre: "Leche entera UHT",   proveedorNombre: "Lácteos del Valle",       fechaVencimiento: "2026-03-01", diasRestantes: 5,  estado: "PendienteCalidad" },
  { loteId: "2", numeroLote: "L-2025-0038", itemNombre: "Pechuga pollo",       proveedorNombre: "AviCol S.A.",             fechaVencimiento: "2026-03-03", diasRestantes: 7,  estado: "Liberado" },
  { loteId: "3", numeroLote: "L-2025-0035", itemNombre: "Azúcar refinada",     proveedorNombre: "Riopaila Castilla",       fechaVencimiento: "2026-03-10", diasRestantes: 14, estado: "Liberado" },
  { loteId: "4", numeroLote: "L-2025-0031", itemNombre: "Carne res molida",    proveedorNombre: "Frigorífico Guadalupe",   fechaVencimiento: "2026-03-15", diasRestantes: 19, estado: "Cuarentena" },
  { loteId: "5", numeroLote: "L-2025-0028", itemNombre: "Pasta de tomate",     proveedorNombre: "Alimentos Deli",          fechaVencimiento: "2026-03-20", diasRestantes: 24, estado: "Liberado" },
];

const MOCK_DOCUMENTOS: DocumentoPorVencer[] = [
  { entidad: "Proveedor", entidadNombre: "AviCol S.A.",           tipoDocumento: "Habilitación cárnicos (Dec. 1500)",  fechaVencimiento: "2026-03-05", diasRestantes: 9  },
  { entidad: "Proveedor", entidadNombre: "Lácteos del Valle",     tipoDocumento: "Registro sanitario INVIMA",          fechaVencimiento: "2026-03-12", diasRestantes: 16 },
  { entidad: "Lote",      entidadNombre: "L-2025-0041",           tipoDocumento: "Certificado de análisis (COA)",      fechaVencimiento: "2026-03-18", diasRestantes: 22 },
  { entidad: "Proveedor", entidadNombre: "Harinas del Meta S.A.", tipoDocumento: "Permiso sanitario",                  fechaVencimiento: "2026-03-25", diasRestantes: 29 },
];

const MOCK_TEMPS: TemperaturaFueraRango[] = [
  { loteId: "1", itemNombre: "Leche entera UHT",  recepcionId: "r1", temperatura: 9.2, temperaturaMinima: 2, temperaturaMaxima: 8,  fechaRegistro: "2026-02-28T08:15:00", origen: "Recepción" },
  { loteId: "2", itemNombre: "Pechuga pollo",      recepcionId: "r2", temperatura: 1.1, temperaturaMinima: 2, temperaturaMaxima: 6,  fechaRegistro: "2026-02-28T09:30:00", origen: "Recepción" },
  { loteId: "3", itemNombre: "Yogur natural",      recepcionId: "r3", temperatura: 8.8, temperaturaMinima: 2, temperaturaMaxima: 8,  fechaRegistro: "2026-02-27T14:10:00", origen: "Recepción" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function urgencyColor(dias: number): { text: string; dot: string } {
  if (dias <= 0)  return { text: "#EF4444", dot: "#EF4444" };
  if (dias <= 7)  return { text: "#F97316", dot: "#F97316" };
  if (dias <= 14) return { text: "#EAB308", dot: "#EAB308" };
  return           { text: "#86EFAC",        dot: "#86EFAC" };
}

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, accent = false, delay = 0,
}: {
  label:   string;
  value:   number;
  sub?:    string;
  accent?: boolean;
  delay?:  number;
}) {
  return (
    <div
      className="db-kpi-card"
      data-accent={accent || undefined}
      style={{ animationDelay: `${delay}ms` }}
    >
      {accent && <div className="db-kpi-accent-line" aria-hidden="true" />}
      <p className="db-kpi-label">{label}</p>
      <p className="db-kpi-value" data-accent={accent || undefined}>{value}</p>
      {sub && <p className="db-kpi-sub">{sub}</p>}
    </div>
  );
}

function Panel({
  title, count, children, onMore,
}: {
  title:     string;
  count?:    number;
  children:  React.ReactNode;
  onMore?:   () => void;
}) {
  return (
    <div className="db-panel">
      <div className="db-panel-header">
        <div className="db-panel-title-wrap">
          <span className="db-panel-title">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge color="red" size="sm">{count}</Badge>
          )}
        </div>
        {onMore && (
          <button className="db-panel-more" onClick={onMore}>
            Ver todo →
          </button>
        )}
      </div>
      <div className="db-panel-body">{children}</div>
    </div>
  );
}

function Row({
  children, onClick,
}: {
  children:  React.ReactNode;
  onClick?:  () => void;
}) {
  return (
    <div
      className="db-row"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

function MiniStat({
  label, value, color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="db-mini-stat">
      <span className="db-mini-stat-label">{label}</span>
      <span className="db-mini-stat-value" style={{ color }}>{value}</span>
    </div>
  );
}

function ProgressBar({
  value, color, bg,
}: {
  value: number;
  color: string;
  bg:    string;
}) {
  return (
    <div className="db-progress-track" style={{ background: bg }}>
      <div
        className="db-progress-fill"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}

// ─── CONSTANTE isMock ────────────────────────────────────────────────────────

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { displayName } = useAuth();
  const navigate = useNavigate();
  const now = new Date();

  const [mes, setMes] = useState(now.getMonth() + 1);
  const [año, setAño] = useState(now.getFullYear());

  const {
    kpis: kpisApi, vencimientos: vencApi, documentos: docsApi,
    temperaturas: tempsApi, loading, error, lastUpdated, refresh,
  } = useDashboard({ año, mes, diasUmbral: 30 });

  const kpis         = isMock ? MOCK_KPIS         : kpisApi;
  const vencimientos = isMock ? MOCK_VENCIMIENTOS : vencApi;
  const documentos   = isMock ? MOCK_DOCUMENTOS   : docsApi;
  const temperaturas = isMock ? MOCK_TEMPS        : tempsApi;
  const isLoading    = isMock ? false             : loading;

  const hour     = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const nombre   = displayName?.split(" ")[0] ?? "";

  // ── Opciones de selects ──────────────────────────────────────────────────
  const añoOpts = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  // ── Acciones rápidas ─────────────────────────────────────────────────────
  const ACCIONES = [
    { label: "Nueva recepción",     path: ROUTES.NUEVA_RECEPCION,  accent: true,
      d: "M12 5v14M5 12h14" },
    { label: "Ver recepciones",     path: ROUTES.RECEPCIONES,      accent: false,
      d: "M5 3h14a2 2 0 012 2v3H3V5a2 2 0 012-2zM3 8h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
    { label: "Liberación de lotes", path: ROUTES.LIBERACION,       accent: false,
      d: "M9 12l2 2 4-4M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { label: "No conformidades",    path: ROUTES.NO_CONFORMIDADES, accent: false,
      d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" },
  ] as const;

  return (
    <div className="db-page">

      {/* ── Header ── */}
      <div className="db-header">
        <div>
          <h1 className="db-greeting-title">
            {greeting}{nombre ? `, ${nombre}` : ""} 👋
          </h1>
          <p className="db-greeting-sub">
            Panel de control · Recepción de Materia Prima
          </p>
        </div>

        <div className="db-controls">
          {/* Selector de mes */}
          <select
            className="db-period-select"
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
            aria-label="Mes del período"
          >
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>

          {/* Selector de año */}
          <select
            className="db-period-select"
            value={año}
            onChange={e => setAño(Number(e.target.value))}
            aria-label="Año del período"
          >
            {añoOpts.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Botón actualizar */}
          <button
            className="db-refresh-btn"
            onClick={refresh}
            aria-label="Actualizar datos"
          >
            <svg
              width="11" height="11" viewBox="0 0 24 24"
              className="db-refresh-icon"
              data-loading={isLoading || undefined}
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            Actualizar
          </button>

          {lastUpdated && !isMock && (
            <span className="db-last-updated">
              {lastUpdated.toLocaleTimeString("es-CO", {
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="db-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="db-error-text">{error}</p>
          <button className="db-error-retry" onClick={refresh}>Reintentar</button>
        </div>
      )}

      {/* ── KPIs: Recepciones ── */}
      <section>
        <p className="db-section-label">
          Recepciones · {MESES[mes - 1]} {año}
        </p>
        <div className="db-kpi-grid">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="card" />
              ))
            : <>
                <KpiCard label="Total"         value={kpis?.totalRecepciones            ?? 0} delay={0}   />
                <KpiCard label="Aceptadas"     value={kpis?.recepcionesAceptadas        ?? 0} delay={50}  accent />
                <KpiCard label="Rechazadas"    value={kpis?.recepcionesRechazadas       ?? 0} delay={100} />
                <KpiCard label="Cuarentena"    value={kpis?.recepcionesCuarentena       ?? 0} delay={150} />
                <KpiCard label="Pend. calidad" value={kpis?.recepcionesPendienteCalidad ?? 0} delay={200} />
              </>
          }
        </div>
      </section>

      {/* ── Fila media: indicadores + lotes + acciones ── */}
      <div
        className="db-mid-grid"
        style={{ animation: "fadeSlideUp 0.4s ease 0.2s both" }}
      >

        {/* Indicadores de calidad */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">Indicadores de calidad</span>
          </div>
          <div className="db-quality-panel">

            {/* Tasa de aceptación */}
            <div>
              <div className="db-progress-header">
                <span className="db-progress-label">Tasa de aceptación</span>
                <span className="db-progress-value" style={{ color: "#4ADE80" }}>
                  {kpis?.tasaAceptacion ?? 0}%
                </span>
              </div>
              <ProgressBar
                value={kpis?.tasaAceptacion ?? 0}
                color="#22C55E"
                bg="rgba(34,197,94,0.08)"
              />
            </div>

            {/* Tasa de rechazo */}
            <div>
              <div className="db-progress-header">
                <span className="db-progress-label">Tasa de rechazo</span>
                <span className="db-progress-value" style={{ color: "#F87171" }}>
                  {kpis?.tasaRechazo ?? 0}%
                </span>
              </div>
              <ProgressBar
                value={kpis?.tasaRechazo ?? 0}
                color="#EF4444"
                bg="rgba(239,68,68,0.08)"
              />
            </div>

            {/* Mini stats */}
            <div className="db-quality-divider">
              <MiniStat
                label="Proveedores activos"
                value={kpis?.proveedoresActivos ?? 0}
                color="#94A3B8"
              />
              <MiniStat
                label="No conformidades abiertas"
                value={kpis?.noConformidadesAbiertas ?? 0}
                color={kpis?.noConformidadesAbiertas ? "#FCD34D" : "#86EFAC"}
              />
            </div>

          </div>
        </div>

        {/* Estado de lotes */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">Estado de lotes</span>
          </div>
          <div className="db-lots-panel">
            <p className="db-lots-total">{kpis?.totalLotes ?? 0}</p>
            <p className="db-lots-sub">lotes registrados en el período</p>
            <MiniStat label="Liberados"  value={kpis?.lotesLiberados  ?? 0} color="#86EFAC" />
            <MiniStat label="Rechazados" value={kpis?.lotesRechazados ?? 0} color="#FCA5A5" />
            <MiniStat label="Cuarentena" value={kpis?.lotesCuarentena ?? 0} color="#FCD34D" />
            <MiniStat label="Pendientes" value={kpis?.lotesPendientes ?? 0} color="#93C5FD" />
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">Acciones rápidas</span>
          </div>
          <div className="db-actions-panel">
            {ACCIONES.map(({ label, path, accent, d }) => (
              <button
                key={String(path)}
                className="db-action-btn"
                data-accent={String(accent)}
                onClick={() => navigate(path as string)}
              >
                <svg
                  width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round"
                  aria-hidden="true"
                >
                  {d.split(" M").map((seg, i) => (
                    <path key={i} d={i === 0 ? seg : "M" + seg} />
                  ))}
                </svg>
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Paneles de alertas ── */}
      <div
        className="db-alerts-grid"
        style={{ animation: "fadeSlideUp 0.4s ease 0.35s both" }}
      >

        {/* Lotes próximos a vencer */}
        <Panel
          title="Lotes próx. a vencer"
          count={vencimientos.length}
          onMore={() => navigate(ROUTES.LOTES)}
        >
          {vencimientos.length === 0
            ? <EmptyState
                title="Sin alertas de vencimiento"
                icon="M9 12l2 2 4-4M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                size="sm"
              />
            : vencimientos.slice(0, 5).map(v => (
                <Row key={v.loteId}>
                  <div
                    className="db-urgency-dot"
                    style={{ background: urgencyColor(v.diasRestantes).dot }}
                    aria-hidden="true"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="db-row-name">{v.itemNombre}</p>
                    <p className="db-row-sub">{v.numeroLote} · {v.proveedorNombre}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p className="db-row-value" style={{ color: urgencyColor(v.diasRestantes).text }}>
                      {v.diasRestantes <= 0 ? "VENCIDO" : `${v.diasRestantes}d`}
                    </p>
                    <p className="db-row-date">{formatDate(v.fechaVencimiento)}</p>
                  </div>
                </Row>
              ))
          }
        </Panel>

        {/* Documentos por vencer */}
        <Panel
          title="Documentos por vencer"
          count={documentos.length}
          onMore={() => navigate(ROUTES.PROVEEDORES)}
        >
          {documentos.length === 0
            ? <EmptyState
                title="Todos los documentos al día"
                icon="M9 12l2 2 4-4M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                size="sm"
              />
            : documentos.slice(0, 5).map((d, i) => (
                <Row key={i}>
                  <span className="db-entity-badge">{d.entidad.toUpperCase()}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="db-row-name">{d.entidadNombre}</p>
                    <p className="db-row-sub">{d.tipoDocumento}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p className="db-row-value" style={{ color: urgencyColor(d.diasRestantes).text }}>
                      {d.diasRestantes}d
                    </p>
                    <p className="db-row-date">{formatDate(d.fechaVencimiento)}</p>
                  </div>
                </Row>
              ))
          }
        </Panel>

        {/* Temperaturas fuera de rango */}
        <Panel
          title="Temperaturas fuera de rango"
          count={temperaturas.length}
          onMore={() => navigate(ROUTES.RECEPCIONES)}
        >
          {temperaturas.length === 0
            ? <EmptyState
                title="Todas las temperaturas dentro de rango"
                icon="M9 12l2 2 4-4M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                size="sm"
              />
            : temperaturas.map(t => {
                const over = t.temperatura > t.temperaturaMaxima;
                return (
                  <Row key={t.loteId}>
                    <div
                      className="db-temp-badge"
                      style={{
                        background: over ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
                        color:      over ? "#FCA5A5"              : "#93C5FD",
                      }}
                      aria-label={over ? "Sobre temperatura" : "Bajo temperatura"}
                    >
                      {over ? "▲" : "▼"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="db-row-name">{t.itemNombre}</p>
                      <p className="db-row-sub">{t.origen}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p
                        className="db-temp-value"
                        style={{ color: over ? "#FCA5A5" : "#93C5FD" }}
                      >
                        {t.temperatura}°C
                      </p>
                      <p className="db-temp-range">
                        [{t.temperaturaMinima}–{t.temperaturaMaxima}°C]
                      </p>
                    </div>
                  </Row>
                );
              })
          }
        </Panel>

      </div>
    </div>
  );
}