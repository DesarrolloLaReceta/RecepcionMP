import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecepciones } from "../../Hooks/useRecepciones";
import { EstadoRecepcion, EstadoRecepcionLabels } from "../../Types/api";
import { ROUTES } from "../../Constants/routes";
import type { RecepcionResumen } from "../../Services/recepciones.service";
import { MOCK_RECEPCIONES } from "./MockData";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

const ESTADO_CONFIG: Record<EstadoRecepcion, { label: string; color: string; bg: string; dot: string }> = {
  [EstadoRecepcion.Iniciada]:           { label: "Iniciada",        color: "#93C5FD", bg: "rgba(59,130,246,0.08)",  dot: "#3B82F6" },
  [EstadoRecepcion.InspeccionVehiculo]: { label: "Insp. vehículo",  color: "#C4B5FD", bg: "rgba(168,85,247,0.08)", dot: "#A855F7" },
  [EstadoRecepcion.RegistroLotes]:      { label: "Registro lotes",  color: "#FCD34D", bg: "rgba(245,158,11,0.08)", dot: "#F59E0B" },
  [EstadoRecepcion.PendienteCalidad]:   { label: "Pend. calidad",   color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",  dot: "#EF4444" },
  [EstadoRecepcion.Liberada]:           { label: "Liberada",        color: "#86EFAC", bg: "rgba(34,197,94,0.08)",  dot: "#22C55E" },
  [EstadoRecepcion.Rechazada]:          { label: "Rechazada",       color: "#94A3B8", bg: "rgba(100,116,139,0.1)", dot: "#64748B" },
};

function EstadoBadge({ estado }: { estado: EstadoRecepcion }) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function LotesBar({ total, liberados, rechazados }: { total: number; liberados: number; rechazados: number }) {
  if (total === 0) return <span className="text-[#334155] text-xs">—</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 rounded-full overflow-hidden w-20 gap-px"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        {liberados > 0 && <div className="h-full bg-green-400" style={{ width: `${(liberados / total) * 100}%` }} />}
        {rechazados > 0 && <div className="h-full bg-red-400" style={{ width: `${(rechazados / total) * 100}%` }} />}
      </div>
      <span className="text-[11px] text-[#64748B] font-mono">{liberados}/{total}</span>
    </div>
  );
}

function RecepcionRow({ rec, onClick }: { rec: RecepcionResumen; onClick: () => void }) {
  const fecha = new Date(rec.fechaRecepcion).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  const hora = rec.horaLlegadaVehiculo?.slice(0, 5) ?? "--:--";
  return (
    <tr onClick={onClick} className="cursor-pointer group transition-colors"
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
      <td className="px-5 py-4">
        <p className="text-[13px] font-bold text-white font-mono group-hover:text-[#F59E0B] transition-colors">
          {rec.numeroRecepcion}
        </p>
        <p className="text-[11px] text-[#475569] font-mono">{rec.ordenCompraNumero}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-[13px] text-[#CBD5E1] font-medium">{rec.proveedorNombre}</p>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <p className="text-[12px] text-[#94A3B8]">{fecha}</p>
        <p className="text-[11px] text-[#475569] font-mono">{hora}</p>
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <span className="text-[11px] px-2 py-1 rounded font-mono"
          style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}>
          {rec.placaVehiculo ?? "—"}
        </span>
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <LotesBar total={rec.totalLotes} liberados={rec.lotesLiberados} rechazados={rec.lotesRechazados} />
      </td>
      <td className="px-4 py-4"><EstadoBadge estado={rec.estado} /></td>
      <td className="px-4 py-4 text-right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#334155" strokeWidth="2" strokeLinecap="round"
          className="inline group-hover:stroke-[#F59E0B] transition-colors">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </td>
    </tr>
  );
}

export default function RecepcionesPage() {
  const navigate = useNavigate();
  const [estadoFilter, setEstadoFilter] = useState<EstadoRecepcion | "">("");
  const [search, setSearch] = useState("");

  const { recepciones: real, loading, error, refresh } = useRecepciones(
    estadoFilter !== "" ? { estado: estadoFilter as EstadoRecepcion } : undefined
  );
  const recepciones = isMock ? MOCK_RECEPCIONES : real;
  const isLoading = isMock ? false : loading;

  const filtered = recepciones.filter((r) => {
    const matchEstado = estadoFilter === "" || r.estado === estadoFilter;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.numeroRecepcion.toLowerCase().includes(q) ||
      r.ordenCompraNumero.toLowerCase().includes(q) ||
      r.proveedorNombre.toLowerCase().includes(q) ||
      (r.placaVehiculo ?? "").toLowerCase().includes(q);
    return matchEstado && matchSearch;
  });

  const hasFilter = search !== "" || estadoFilter !== "";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto"
      style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-[#475569] tracking-[0.3em] uppercase font-mono mb-1">Módulo principal</p>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Recepciones
          </h1>
        </div>
        <button onClick={() => navigate(ROUTES.NUEVA_RECEPCION)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
          style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.2)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.12)")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva recepción
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14"
            viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por No., proveedor, placa…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: "#CBD5E1" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <select value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value === "" ? "" : Number(e.target.value) as EstadoRecepcion)}
          className="text-[13px] px-4 py-2.5 rounded-xl font-mono outline-none"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: estadoFilter !== "" ? "#CBD5E1" : "#475569" }}>
          <option value="">Todos los estados</option>
          {Object.entries(EstadoRecepcionLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button onClick={refresh} disabled={isLoading}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#64748B" strokeWidth="2" strokeLinecap="round"
            className={isLoading ? "animate-spin" : ""}>
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      {/* Chips de estado */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[11px] text-[#334155] font-mono">
          {filtered.length} recepcion{filtered.length !== 1 ? "es" : ""}
        </p>
        {hasFilter && (
          <button onClick={() => { setSearch(""); setEstadoFilter(""); }}
            className="text-[11px] text-[#F59E0B] font-mono hover:underline">
            Limpiar filtros
          </button>
        )}
        <div className="flex gap-1.5 flex-wrap ml-auto">
          {Object.entries(ESTADO_CONFIG).map(([k, cfg]) => {
            const count = (isMock ? MOCK_RECEPCIONES : recepciones).filter((r) => r.estado === Number(k)).length;
            if (!count) return null;
            return (
              <button key={k}
                onClick={() => setEstadoFilter(estadoFilter === Number(k) as any ? "" : Number(k) as EstadoRecepcion)}
                className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg font-mono transition-opacity"
                style={{
                  background: cfg.bg, color: cfg.color,
                  opacity: estadoFilter !== "" && estadoFilter !== Number(k) ? 0.4 : 1,
                }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                {cfg.label} · {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <button onClick={refresh} className="text-xs text-red-400 underline">Reintentar</button>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                ["Recepción / OC", "px-5"],
                ["Proveedor", "px-4"],
                ["Fecha", "px-4 hidden md:table-cell"],
                ["Placa", "px-4 hidden lg:table-cell"],
                ["Lotes", "px-4 hidden lg:table-cell"],
                ["Estado", "px-4"],
                ["", "px-4 w-8"],
              ].map(([label, cls]) => (
                <th key={label} className={`${cls} py-3.5 text-left`}>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#334155] font-mono">{label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 rounded animate-pulse w-24"
                        style={{ background: "rgba(255,255,255,0.05)" }} />
                    </td>
                  ))}
                </tr>
              ))
              : filtered.length === 0
                ? <tr><td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-[#475569] text-sm">
                      {hasFilter ? "Sin resultados para este filtro." : "Aún no hay recepciones."}
                    </p>
                  </div>
                </td></tr>
                : filtered.map((rec) => (
                  <RecepcionRow key={rec.id} rec={rec}
                    onClick={() => navigate(`/recepciones/${rec.id}`)} />
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}