import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLotes } from "../../Hooks/useLotes";
import { type LotePendiente, type EstadoLote } from "../../Services/lotes.service";
import { ROUTES } from "../../Constants/routes";
import { StatusBadge } from "../../Components/UI/StatusBadge";
import { Spinner, Skeleton } from "../../Components/UI/Spinner";
import { EmptyState } from "../../Components/UI/EmptyState";
import { Badge } from "../../Components/UI/Badge";
import { formatDate, formatTemp, formatQuantity, vencimientoColor } from "../../Utils/formatters";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type FiltroEstado = EstadoLote | "Todos";

const ESTADOS_FILTER: { value: FiltroEstado; label: string }[] = [
  { value: "Todos",            label: "Todos los estados" },
  { value: "PendienteCalidad", label: "Pendiente calidad" },
  { value: "Liberado",         label: "Liberados" },
  { value: "Rechazado",        label: "Rechazados" },
  { value: "Cuarentena",       label: "Cuarentena" },
];

// ─── FILA DE LOTE ─────────────────────────────────────────────────────────────

function LoteRow({ lote, onClick }: { lote: LotePendiente; onClick: () => void }) {
  const urgencia = vencimientoColor(lote.diasParaVencer);
  const tempFuera =
    lote.temperaturaMedida !== undefined &&
    lote.temperaturaMinima !== undefined &&
    lote.temperaturaMaxima !== undefined &&
    (lote.temperaturaMedida < lote.temperaturaMinima ||
     lote.temperaturaMedida > lote.temperaturaMaxima);

  return (
    <div
      onClick={onClick}
      className="grid items-center px-5 py-3.5 cursor-pointer transition-all duration-100"
      style={{
        gridTemplateColumns: "1.8fr 1.2fr 1fr 110px 100px 110px 90px 36px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      {/* Lote + ítem */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[12px] font-mono font-semibold text-[#F59E0B] truncate">
          {lote.numeroLoteInterno}
        </span>
        <span className="text-[11px] text-[#94A3B8] truncate">{lote.itemNombre}</span>
        {lote.tieneDocumentosFaltantes && (
          <span className="text-[9px] font-mono" style={{ color: "#FCA5A5" }}>
            ⚠ Docs incompletos
          </span>
        )}
      </div>

      {/* Proveedor + categoría */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[12px] text-[#CBD5E1] truncate">{lote.proveedorNombre}</span>
        <span className="text-[10px] text-[#475569] font-mono">{lote.categoriaNombre}</span>
      </div>

      {/* Recepción */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-mono text-[#64748B]">{lote.numeroRecepcion}</span>
        <span className="text-[10px] text-[#334155]">{formatDate(lote.fechaRecepcion)}</span>
      </div>

      {/* Cantidad */}
      <div className="text-right">
        <span className="text-[12px] font-mono text-[#CBD5E1]">
          {formatQuantity(lote.cantidadRecibida, lote.unidadMedida)}
        </span>
      </div>

      {/* Temperatura */}
      <div className="text-center">
        {lote.temperaturaMedida !== undefined ? (
          <span
            className="text-[12px] font-mono"
            style={{ color: tempFuera ? "#FCA5A5" : "#86EFAC" }}
          >
            {formatTemp(lote.temperaturaMedida)}
            {tempFuera && " ⚠"}
          </span>
        ) : (
          <span className="text-[10px] text-[#334155]">—</span>
        )}
      </div>

      {/* Vencimiento */}
      <div className="flex flex-col gap-0.5 items-end">
        <span className="text-[11px]" style={{ color: urgencia.text }}>
          {formatDate(lote.fechaVencimiento)}
        </span>
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full" style={{ background: urgencia.dot }} />
          <span className="text-[9px] font-mono" style={{ color: urgencia.text }}>
            {lote.diasParaVencer < 0
              ? "Vencido"
              : lote.diasParaVencer === 0
              ? "Hoy"
              : `${lote.diasParaVencer}d`}
          </span>
        </div>
      </div>

      {/* Estado */}
      <div>
        <StatusBadge domain="lote" value={lote.estado} size="xs" />
      </div>

      {/* Chevron */}
      <div className="flex justify-end">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#334155" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}

// ─── LOTESPAGE ────────────────────────────────────────────────────────────────

export default function LotesPage() {
  const navigate = useNavigate();
  const { lotes, loading, error, kpis, refresh } = useLotes();

  const [search,       setSearch]       = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("Todos");
  const [filtroCat,    setFiltroCat]    = useState("");

  // Categorías únicas para el filtro
  const categorias = useMemo(() =>
    Array.from(new Set(lotes.map(l => l.categoriaNombre))).sort(),
    [lotes]
  );

  // Filtrado
  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    return lotes.filter(l => {
      const matchQ = !q || [l.numeroLoteInterno, l.itemNombre, l.proveedorNombre,
        l.numeroRecepcion, l.itemCodigo].some(v => v?.toLowerCase().includes(q));
      const matchEst = filtroEstado === "Todos" || l.estado === filtroEstado;
      const matchCat = !filtroCat || l.categoriaNombre === filtroCat;
      return matchQ && matchEst && matchCat;
    });
  }, [lotes, search, filtroEstado, filtroCat]);

  // Estilos reutilizables
  const inp = "px-3 py-2 rounded-lg text-[12px] outline-none transition-colors";
  const ist = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" } as React.CSSProperties;
  const onF = (e: React.FocusEvent<HTMLElement>) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.3)");
  const onB = (e: React.FocusEvent<HTMLElement>) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)");

  // ── KPI Cards ───────────────────────────────────────────────────────────────
  const kpiCards = [
    { label: "Pendientes",    value: kpis.pendientes,    color: "#F59E0B" },
    { label: "Liberados hoy", value: kpis.liberadosHoy,  color: "#86EFAC" },
    { label: "Rechazados",    value: kpis.rechazadosHoy, color: "#FCA5A5" },
    { label: "Cuarentena",    value: kpis.enCuarentena,  color: "#C4B5FD" },
  ];

  return (
    <div className="flex flex-col gap-5" style={{ animation: "fadeSlideUp 0.3s ease both" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Lotes</h1>
          <p className="text-[11px] text-[#475569] font-mono mt-0.5">
            Inventario y trazabilidad de lotes recibidos
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-mono transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748B" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.2)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)")}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map(k => (
          <div key={k.label} className="rounded-2xl px-4 py-3.5"
            style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] text-[#475569] font-mono uppercase tracking-wider">{k.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filtros ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar lote, ítem, proveedor, recepción…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inp} pl-8 w-full`}
            style={ist}
            onFocus={onF} onBlur={onB}
          />
        </div>

        {/* Estado */}
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value as FiltroEstado)}
          className={`${inp} pr-8 appearance-none`}
          style={{ ...ist, minWidth: 170 }}
          onFocus={onF} onBlur={onB}
        >
          {ESTADOS_FILTER.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Categoría */}
        <select
          value={filtroCat}
          onChange={e => setFiltroCat(e.target.value)}
          className={`${inp} pr-8 appearance-none`}
          style={{ ...ist, minWidth: 150 }}
          onFocus={onF} onBlur={onB}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Contador */}
        <Badge color="slate" size="sm">
          {filtrados.length} de {lotes.length}
        </Badge>
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Header tabla */}
        <div
          className="grid px-5 py-3 text-[9px] font-mono uppercase tracking-wider text-[#334155]"
          style={{
            gridTemplateColumns: "1.8fr 1.2fr 1fr 110px 100px 110px 90px 36px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,15,26,0.9)",
          }}
        >
          <span>Lote / Ítem</span>
          <span>Proveedor / Cat.</span>
          <span>Recepción</span>
          <span className="text-right">Cantidad</span>
          <span className="text-center">Temperatura</span>
          <span className="text-right">Vencimiento</span>
          <span>Estado</span>
          <span />
        </div>

        {/* Contenido */}
        {loading && <Skeleton variant="table" rows={6} />}

        {!loading && error && (
          <div className="flex items-center gap-2 px-5 py-8 text-sm" style={{ color: "#FCA5A5" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && filtrados.length === 0 && (
          <EmptyState
            title={search || filtroEstado !== "Todos" || filtroCat ? "Sin resultados" : "Sin lotes registrados"}
            subtitle={
              search || filtroEstado !== "Todos" || filtroCat
                ? "Ajusta los filtros para ver más lotes."
                : "Los lotes aparecerán aquí cuando se registren recepciones."
            }
            icon="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"
            className="py-14"
          />
        )}

        {!loading && !error && filtrados.map(lote => (
          <LoteRow
            key={lote.id}
            lote={lote}
            onClick={() => navigate(ROUTES.DETALLE_LOTE(lote.id))}
          />
        ))}
      </div>

      {/* ── Footer info ─────────────────────────────────────────────────────── */}
      {!loading && filtrados.length > 0 && (
        <p className="text-[10px] text-[#2D3748] font-mono text-center">
          Mostrando {filtrados.length} lote{filtrados.length !== 1 ? "s" : ""} · Haz clic en una fila para ver el detalle completo
        </p>
      )}
    </div>
  );
}