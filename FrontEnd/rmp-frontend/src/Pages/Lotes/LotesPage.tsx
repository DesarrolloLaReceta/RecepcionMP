import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLotes } from "../../Hooks/useLotes";
import { type LotePendienteDto } from "../../Services/lotes.service";
import { ROUTES } from "../../Constants/routes";
import { StatusBadge, Skeleton, EmptyState, Badge, Button } from "../../Components/UI/Index";
import { formatDate, formatQuantity, vencimientoColor } from "../../Utils/formatters";
import "./StylesLotes/LotesPage.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type FiltroEstado = string; // Valores: "Todos", "PendienteCalidad", "Liberado", "RechazadoTotal", "RechazadoParcial", "EnCuarentena"

const ESTADOS_FILTER: { value: FiltroEstado; label: string }[] = [
  { value: "Todos",            label: "Todos los estados"  },
  { value: "PendienteCalidad", label: "Pendiente calidad"  },
  { value: "Liberado",         label: "Liberados"          },
  { value: "RechazadoTotal",   label: "Rechazados total"   },
  { value: "RechazadoParcial", label: "Rechazados parcial" },
  { value: "EnCuarentena",     label: "Cuarentena"         },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function tempOk(
  med?: number, min?: number, max?: number,
): boolean | null {
  if (med == null || min == null || max == null) return null;
  return med >= min && med <= max;
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="lt-kpi-card">
      <p className="lt-kpi-label">{label}</p>
      <p className="lt-kpi-value" style={{ color }}>{value}</p>
    </div>
  );
}

// ─── FILA DE LOTE ─────────────────────────────────────────────────────────────

function LoteRow({ lote, onClick }: { lote: LotePendienteDto; onClick: () => void }) {
  const urgencia = vencimientoColor(lote.diasParaVencer);
  const ok       = tempOk(lote.temperaturaMedida, lote.temperaturaMinima, lote.temperaturaMaxima);

  return (
    <div className="lt-row" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}>

      {/* Lote + ítem */}
      <div style={{ minWidth: 0 }}>
        <p className="lt-lote-num">{lote.numeroLoteInterno}</p>
        <p className="lt-lote-item">{lote.itemNombre}</p>
      </div>

      {/* Proveedor + categoría */}
      <div style={{ minWidth: 0 }}>
        <p className="lt-lote-prov">{lote.proveedorNombre}</p>
        <p className="lt-lote-cat">{lote.categoriaNombre}</p>
      </div>

      {/* Recepción */}
      <div style={{ minWidth: 0 }}>
        <p className="lt-lote-rec">{lote.numeroRecepcion}</p>
        <p className="lt-lote-rec-fecha">{formatDate(lote.fechaRecepcion)}</p>
      </div>

      {/* Cantidad */}
      <div className="lt-cell-right">
        <p className="lt-lote-qty">
          {formatQuantity(lote.cantidadRecibida, lote.unidadMedida)}
        </p>
      </div>

      {/* Temperatura */}
      <div className="lt-cell-center">
        {ok === null ? (
          <span className="lt-temp-na">N/A</span>
        ) : (
          <span className="lt-temp-badge" data-ok={ok}>
            {lote.temperaturaMedida}°C
          </span>
        )}
      </div>

      {/* Vencimiento */}
      <div className="lt-venc-wrap">
        <span className="lt-venc-dot" style={{ background: urgencia.dot }} />
        <span className="lt-venc-label" style={{ color: urgencia.text }}>
          {lote.diasParaVencer < 0
            ? "Vencido"
            : lote.diasParaVencer === 0
            ? "Hoy"
            : `${lote.diasParaVencer}d`}
        </span>
      </div>

      {/* Estado */}
      <div>
        <StatusBadge domain="lote" value={lote.estado} size="xs" />
      </div>

      {/* Chevron */}
      <div className="lt-row-chevron" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

    </div>
  );
}

// ─── LOTES PAGE ───────────────────────────────────────────────────────────────

export default function LotesPage() {
  const navigate = useNavigate();
  const { lotes, loading, error, kpis, refresh } = useLotes();

  const [search,       setSearch]       = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("Todos");
  const [filtroCat,    setFiltroCat]    = useState("");

  // Categorías únicas para el select
  const categorias = useMemo(() =>
    Array.from(new Set(lotes.map(l => l.categoriaNombre))).sort(),
    [lotes],
  );

  // Filtrado
  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return lotes.filter(l => {
      const matchQ   = !q || [l.numeroLoteInterno, l.itemNombre, l.proveedorNombre,
        l.numeroRecepcion, l.itemCodigo].some(v => v?.toLowerCase().includes(q));
      const matchEst = filtroEstado === "Todos" || l.estado === filtroEstado;
      const matchCat = !filtroCat || l.categoriaNombre === filtroCat;
      return matchQ && matchEst && matchCat;
    });
  }, [lotes, search, filtroEstado, filtroCat]);

  const kpiCards = [
    { label: "Pendientes",    value: kpis.pendientes,    color: "#F59E0B" },
    { label: "Liberados hoy", value: kpis.liberadosHoy,  color: "#86EFAC" },
    { label: "Rechazados",    value: kpis.rechazadosHoy, color: "#FCA5A5" },
    { label: "Cuarentena",    value: kpis.enCuarentena,  color: "#C4B5FD" },
  ];

  return (
    <div className="lt-page">

      {/* ── Header ── */}
      <div className="lt-header">
        <div>
          <h1 className="lt-title">Lotes</h1>
          <p className="lt-subtitle">Inventario y trazabilidad de lotes recibidos</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          loading={loading}
          iconLeft="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"
        >
          Actualizar
        </Button>
      </div>

      {/* ── KPIs ── */}
      <div className="lt-kpi-grid">
        {kpiCards.map(k => (
          <KpiCard key={k.label} label={k.label} value={k.value} color={k.color} />
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="lt-filters">

        {/* Búsqueda */}
        <div className="lt-search-wrap">
          <svg className="lt-search-icon" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="#475569" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar lote, ítem, proveedor, recepción…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="lt-input lt-search-input"
            aria-label="Buscar lotes"
          />
        </div>

        {/* Estado */}
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="lt-select"
          aria-label="Filtrar por estado"
        >
          {ESTADOS_FILTER.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Categoría */}
        <select
          value={filtroCat}
          onChange={e => setFiltroCat(e.target.value)}
          className="lt-select"
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Contador */}
        <Badge color="slate" size="sm">
          {filtrados.length} de {lotes.length}
        </Badge>

      </div>

      {/* ── Tabla ── */}
      <div className="lt-table">

        {/* Cabecera */}
        <div className="lt-table-head" aria-hidden="true">
          <span>Lote / Ítem</span>
          <span>Proveedor / Cat.</span>
          <span>Recepción</span>
          <span className="lt-table-head-right">Cantidad</span>
          <span className="lt-table-head-center">Temperatura</span>
          <span className="lt-table-head-right">Vencimiento</span>
          <span>Estado</span>
          <span />
        </div>

        {/* Skeleton mientras carga */}
        {loading && <Skeleton variant="table" rows={6} />}

        {/* Error */}
        {!loading && error && (
          <div className="lt-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
            </svg>
            {error}
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && filtrados.length === 0 && (
          <EmptyState
            title={search || filtroEstado !== "Todos" || filtroCat
              ? "Sin resultados"
              : "Sin lotes registrados"}
            subtitle={search || filtroEstado !== "Todos" || filtroCat
              ? "Ajusta los filtros para ver más lotes."
              : "Los lotes aparecerán aquí cuando se registren recepciones."}
            icon="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"
            className="py-14"
          />
        )}

        {/* Filas */}
        {!loading && !error && filtrados.map(lote => (
          <LoteRow
            key={lote.id}
            lote={lote}
            onClick={() => navigate(ROUTES.DETALLE_LOTE(lote.id))}
          />
        ))}

      </div>

      {/* Footer */}
      {!loading && filtrados.length > 0 && (
        <p className="lt-footer-info">
          Mostrando {filtrados.length} lote{filtrados.length !== 1 ? "s" : ""}
          {" · "}Haz clic en una fila para ver el detalle completo
        </p>
      )}

    </div>
  );
}