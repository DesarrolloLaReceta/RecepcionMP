import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecepciones } from "../../Hooks/useRecepciones";
import { EstadoRecepcion, EstadoRecepcionLabels } from "../../Types/api";
import { ROUTES } from "../../Constants/routes";
import type { RecepcionResumen } from "../../Services/recepciones.service";
import { Button } from "../../Components/UI/Index";
import { formatDate } from "../../Utils/formatters";
import { MOCK_RECEPCIONES } from "./MockData";
import "./StylesRecepciones/RecepcionesPage.css";


const isMock = import.meta.env.VITE_USE_MOCK === "true";



// ── Config visual de estados — alineada con backend
const ESTADO_CFG: Record<EstadoRecepcion, {
  label: string; color: string; bg: string; dot: string;
}> = {
  [EstadoRecepcion.Iniciada]: {
    label: "Iniciada", color: "#93C5FD",
    bg: "rgba(59,130,246,0.08)", dot: "#3B82F6",
  },
  [EstadoRecepcion.InspeccionVehiculo]: {
    label: "Insp. vehículo", color: "#C4B5FD",
    bg: "rgba(168,85,247,0.08)", dot: "#A855F7",
  },
  [EstadoRecepcion.RegistroLotes]: {
    label: "Registro lotes", color: "#FCD34D",
    bg: "rgba(245,158,11,0.08)", dot: "#F59E0B",
  },
  [EstadoRecepcion.PendienteCalidad]: {
    label: "Pend. calidad", color: "#FCA5A5",
    bg: "rgba(239,68,68,0.08)", dot: "#EF4444",
  },
  [EstadoRecepcion.Liberada]: {
    label: "Liberada", color: "#86EFAC",
    bg: "rgba(34,197,94,0.08)", dot: "#22C55E",
  },
  [EstadoRecepcion.Rechazada]: {
    label: "Rechazada", color: "#94A3B8",
    bg: "rgba(100,116,139,0.1)", dot: "#64748B",
  },
};

// ── Badge estado
function EstadoBadge({ estado }: { estado: EstadoRecepcion }) {
  const c = ESTADO_CFG[estado];
  return (
    <span className="rp-badge" style={{ background: c.bg, color: c.color }}>
      <span className="rp-badge-dot" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

// ── Barra de lotes
function LotesBar({
  total, liberados, rechazados,
}: {
  total: number; liberados: number; rechazados: number;
}) {
  if (total === 0)
    return (
      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
        —
      </span>
    );
  return (
    <div className="rp-lotes-bar">
      <div className="rp-lotes-track">
        {liberados > 0 && (
          <div
            className="rp-lotes-liberados"
            style={{ width: `${(liberados / total) * 100}%` }}
          />
        )}
        {rechazados > 0 && (
          <div
            className="rp-lotes-rechazados"
            style={{ width: `${(rechazados / total) * 100}%` }}
          />
        )}
      </div>
      <span className="rp-lotes-count">
        {liberados}/{total}
      </span>
    </div>
  );
}

// ── Fila de recepción
function RecepcionRow({
  rec, onClick,
}: {
  rec: RecepcionResumen; onClick: () => void;
}) {
  const hora = rec.horaLlegadaVehiculo?.toString().slice(0, 5) ?? "--:--";
  return (
    <tr className="rp-row" onClick={onClick}>
      <td className="rp-td">
        <p className="rp-rec-num">{rec.numeroRecepcion}</p>
        <p className="rp-rec-oc">{rec.ordenCompraNumero}</p>
      </td>
      <td className="rp-td">
        <p className="rp-prov">{rec.proveedorNombre}</p>
      </td>
      <td className="rp-td rp-col-md">
        <p className="rp-fecha">{formatDate(rec.fechaRecepcion)}</p>
        <p className="rp-hora">{hora}</p>
      </td>
      <td className="rp-td rp-col-lg">
        <span className="rp-placa">{rec.placaVehiculo ?? "—"}</span>
      </td>
      <td className="rp-td rp-col-lg">
        <LotesBar
          total={rec.totalLotes}
          liberados={rec.lotesLiberados}
          rechazados={rec.lotesRechazados}
        />
      </td>
      <td className="rp-td">
        <EstadoBadge estado={rec.estado} />
      </td>
      <td className="rp-td-last">
        <svg
          className="rp-chevron"
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" strokeWidth="2" strokeLinecap="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </td>
    </tr>
  );
}

// ── PÁGINA ────────────────────────────────────────────────────────────────────

export default function RecepcionesPage() {
  const navigate = useNavigate();
  const [estadoFilter, setEstadoFilter] = useState<EstadoRecepcion | "">("");
  const [search, setSearch] = useState("");

  const {
    recepciones: real, loading, error, refresh,
  } = useRecepciones(
    estadoFilter !== "" ? { estado: estadoFilter } : undefined
  );

  const recepciones = isMock ? MOCK_RECEPCIONES : real;
  const isLoading   = isMock ? false : loading;

  // Filtrado local por búsqueda de texto
  const q = search.toLowerCase();
  const filtered = recepciones.filter(r => {
    const matchEstado = estadoFilter === "" || r.estado === estadoFilter;
    const matchSearch = !search
      || r.numeroRecepcion.toLowerCase().includes(q)
      || r.ordenCompraNumero.toLowerCase().includes(q)
      || r.proveedorNombre.toLowerCase().includes(q)
      || (r.placaVehiculo ?? "").toLowerCase().includes(q);
    return matchEstado && matchSearch;
  });

  const hasFilter = search !== "" || estadoFilter !== "";

  // KPIs derivados
  const kpis = {
    total:      recepciones.length,
    liberadas:  recepciones.filter(r => r.estado === EstadoRecepcion.Liberada).length,
    pendientes: recepciones.filter(r =>
      r.estado === EstadoRecepcion.PendienteCalidad ||
      r.estado === EstadoRecepcion.RegistroLotes
    ).length,
    rechazadas: recepciones.filter(r => r.estado === EstadoRecepcion.Rechazada).length,
  };

  return (
    <div className="rp-page">

      {/* ── Header ── */}
      <div className="rp-header">
        <div>
          <p className="rp-breadcrumb">Recepción / Módulo</p>
          <h1 className="rp-title">Recepciones</h1>
        </div>
        <div className="rp-header-actions">
          <Button
            variant="ghost" size="sm"
            loading={isLoading} onClick={refresh}
            iconLeft="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"
          >
            Actualizar
          </Button>
          <Button
            variant="primary" size="sm"
            onClick={() => navigate(ROUTES.NUEVA_RECEPCION)}
            iconLeft="M12 5v14M5 12h14"
          >
            Nueva recepción
          </Button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "0.75rem",
      }}>
        {[
          { label: "Total",      value: kpis.total,      color: "#CBD5E1" },
          { label: "Liberadas",  value: kpis.liberadas,  color: "#86EFAC" },
          { label: "Pendientes", value: kpis.pendientes, color: "#FCA5A5" },
          { label: "Rechazadas", value: kpis.rechazadas, color: "#94A3B8" },
        ].map(k => (
          <div key={k.label} style={{
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-xl)",
            background: "var(--dark-bg)",
            border: "1px solid var(--dark-border)",
          }}>
            <p style={{
              fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--text-muted)",
            }}>
              {k.label}
            </p>
            <p style={{
              fontSize: "1.5rem", fontWeight: 700,
              fontFamily: "var(--font-mono)", color: k.color,
              marginTop: "0.25rem", lineHeight: 1,
            }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rp-error">
          <p className="rp-error-text">{error}</p>
          <button className="rp-error-retry" onClick={refresh}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="rp-filters">
        <div className="rp-search-wrap">
          <svg
            className="rp-search-icon" width="13" height="13"
            viewBox="0 0 24 24" fill="none" stroke="#475569"
            strokeWidth="2" aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            className="rp-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por N.°, proveedor, placa…"
            aria-label="Buscar recepciones"
          />
          {search && (
            <button
              className="rp-search-clear"
              onClick={() => setSearch("")}
              aria-label="Limpiar búsqueda"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <select
          className="rp-select"
          data-empty={estadoFilter === ""}
          value={estadoFilter}
          onChange={e => setEstadoFilter(
            e.target.value === "" ? "" : Number(e.target.value) as EstadoRecepcion
          )}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {Object.entries(EstadoRecepcionLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* ── Chips de estado ── */}
      <div className="rp-chips-row">
        <p className="rp-count">
          {filtered.length} recepcion{filtered.length !== 1 ? "es" : ""}
        </p>
        {hasFilter && (
          <button
            className="rp-clear-btn"
            onClick={() => { setSearch(""); setEstadoFilter(""); }}
          >
            Limpiar filtros
          </button>
        )}
        <div className="rp-chips">
          {Object.entries(ESTADO_CFG).map(([k, cfg]) => {
            const count = recepciones.filter(r => r.estado === Number(k)).length;
            if (!count) return null;
            const active = estadoFilter === Number(k);
            const dimmed = estadoFilter !== "" && !active;
            return (
              <button
                key={k}
                className="rp-chip"
                data-dimmed={dimmed}
                style={{ background: cfg.bg, color: cfg.color }}
                onClick={() => setEstadoFilter(
                  active ? "" : Number(k) as EstadoRecepcion
                )}
              >
                <span className="rp-chip-dot" style={{ background: cfg.dot }} />
                {cfg.label} · {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="rp-table-wrap">
        <table className="rp-table">
          <thead>
            <tr className="rp-thead-row">
              {[
                { label: "Recepción / OC", cls: "" },
                { label: "Proveedor",      cls: "" },
                { label: "Fecha",          cls: "rp-col-md" },
                { label: "Placa",          cls: "rp-col-lg" },
                { label: "Lotes",          cls: "rp-col-lg" },
                { label: "Estado",         cls: "" },
                { label: "",               cls: "" },
              ].map(({ label, cls }) => (
                <th key={label} className={`rp-th ${cls}`}>
                  {label && (
                    <span className="rp-th-label">{label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="rp-skeleton-td" colSpan={7}>
                    <div
                      className="rp-skeleton-line"
                      style={{ height: "0.875rem", width: `${50 + (i % 3) * 15}%` }}
                    />
                  </td>
                </tr>
              ))
              : filtered.length === 0
                ? (
                  <tr>
                    <td className="rp-empty" colSpan={7}>
                      {hasFilter
                        ? "Sin resultados para los filtros actuales."
                        : "Sin recepciones registradas."}
                    </td>
                  </tr>
                )
                : filtered.map(rec => (
                  <RecepcionRow
                    key={rec.id}
                    rec={rec}
                    onClick={() => navigate(ROUTES.DETALLE_RECEPCION(rec.id))}
                  />
                ))
            }
          </tbody>
        </table>
      </div>

    </div>
  );
}