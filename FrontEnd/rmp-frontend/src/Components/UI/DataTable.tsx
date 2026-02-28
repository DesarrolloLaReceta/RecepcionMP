import { type ReactNode, useState, useMemo } from "react";
import { Spinner } from "./Spinner";
import { EmptyState } from "./EmptyState";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type SortDir = "asc" | "desc";

export interface Column<T> {
  /** Clave única de la columna (también usada para acceso a datos si no hay render) */
  key:        string;
  header:     string;
  /** Ancho CSS (ej: "120px", "1fr", "minmax(0,2fr)") — se usa en grid-template-columns */
  width?:     string;
  /** Si false, la columna no es ordenable (default: true si hay accessor) */
  sortable?:  boolean;
  /** Alinear celda a la derecha */
  alignRight?: boolean;
  /** Render custom de la celda */
  render?:    (row: T, idx: number) => ReactNode;
  /** Accede al dato para ordenar/mostrar: string de clave o función */
  accessor?:  keyof T | ((row: T) => string | number);
}

export interface DataTableProps<T> {
  columns:      Column<T>[];
  data:         T[];
  /** Clave única por fila (para key de React y selección) */
  rowKey:       keyof T | ((row: T) => string);
  loading?:     boolean;
  /** Texto del EmptyState cuando data está vacía */
  emptyTitle?:  string;
  emptySubtitle?: string;
  emptyIcon?:   string;
  /** Si true, muestra checkboxes de selección múltiple */
  selectable?:  boolean;
  selectedKeys?: Set<string>;
  onSelectChange?: (keys: Set<string>) => void;
  /** Si true, al hacer click en la fila llama a onRowClick */
  onRowClick?:  (row: T) => void;
  /** Filas por página — si no se pasa, sin paginación */
  pageSize?:    number;
  /** Columna y dirección de orden inicial */
  defaultSort?: { key: string; dir: SortDir };
  className?:   string;
  /** Clase extra de la fila al hacer hover */
  rowClassName?: (row: T) => string;
  /** Footer slot (para totales) */
  footer?:      ReactNode;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getKey<T>(row: T, rowKey: DataTableProps<T>["rowKey"]): string {
  return typeof rowKey === "function"
    ? rowKey(row)
    : String(row[rowKey as keyof T]);
}

function getVal<T>(row: T, col: Column<T>): string | number {
  if (col.accessor) {
    return typeof col.accessor === "function"
      ? col.accessor(row)
      : String(row[col.accessor as keyof T] ?? "");
  }
  return String((row as Record<string, unknown>)[col.key] ?? "");
}

// ─── SORT ICON ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#F59E0B" : "#334155"} strokeWidth="2.5" strokeLinecap="round">
      <path d={dir === "asc" || !active ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
    </svg>
  );
}

// ─── DATATABLE ────────────────────────────────────────────────────────────────

/**
 * Tabla de datos ordenable, seleccionable y paginada.
 *
 * @example
 * <DataTable
 *   columns={[
 *     { key: "numeroOC", header: "N° OC", sortable: true, width: "120px",
 *       render: oc => <span className="font-mono text-amber-400">{oc.numeroOC}</span> },
 *     { key: "proveedor", header: "Proveedor", accessor: oc => oc.proveedorNombre },
 *     { key: "estado",    header: "Estado",
 *       render: oc => <StatusBadge domain="oc" value={oc.estado} /> },
 *     { key: "valor",     header: "Valor", alignRight: true,
 *       render: oc => <span className="font-mono">{fmtCOP(oc.valorTotal)}</span> },
 *   ]}
 *   data={ordenes}
 *   rowKey="id"
 *   loading={loading}
 *   pageSize={15}
 *   onRowClick={oc => navigate(`/ordenes-compra/${oc.id}`)}
 *   emptyTitle="Sin órdenes de compra"
 * />
 */
export function DataTable<T extends object>({
  columns, data, rowKey, loading,
  emptyTitle = "Sin resultados", emptySubtitle, emptyIcon,
  selectable, selectedKeys, onSelectChange,
  onRowClick, pageSize, defaultSort,
  className = "", rowClassName, footer,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState(defaultSort?.key ?? "");
  const [sortDir, setSortDir] = useState<SortDir>(defaultSort?.dir ?? "asc");
  const [page, setPage]       = useState(0);

  // ── Ordenamiento ────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find(c => c.key === sortKey);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const va = getVal(a, col);
      const vb = getVal(b, col);
      const cmp = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb), "es-CO", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  // ── Paginación ──────────────────────────────────────────────────────────────
  const totalPages = pageSize ? Math.ceil(sorted.length / pageSize) : 1;
  const paged = pageSize ? sorted.slice(page * pageSize, (page + 1) * pageSize) : sorted;

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  };

  // ── Selección ────────────────────────────────────────────────────────────────
  const allKeys      = paged.map(r => getKey(r, rowKey));
  const allSelected  = allKeys.every(k => selectedKeys?.has(k));
  const someSelected = allKeys.some(k => selectedKeys?.has(k));

  const toggleAll = () => {
    if (!onSelectChange) return;
    const next = new Set(selectedKeys ?? []);
    if (allSelected) allKeys.forEach(k => next.delete(k));
    else             allKeys.forEach(k => next.add(k));
    onSelectChange(next);
  };

  const toggleRow = (key: string) => {
    if (!onSelectChange) return;
    const next = new Set(selectedKeys ?? []);
    next.has(key) ? next.delete(key) : next.add(key);
    onSelectChange(next);
  };

  // ── Grid columns CSS ─────────────────────────────────────────────────────────
  const gridCols = [
    ...(selectable ? ["2.5rem"] : []),
    ...columns.map(c => c.width ?? "minmax(0,1fr)"),
  ].join(" ");

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden ${className}`}
      style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>

      {/* ── Tabla ── */}
      <div className="overflow-x-auto flex-1">
        {/* Header */}
        <div className="grid sticky top-0 z-10 px-4 py-3 shrink-0"
          style={{ gridTemplateColumns: gridCols, background: "rgba(10,15,26,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {selectable && (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={toggleAll}
                className="accent-amber-400 w-3.5 h-3.5 cursor-pointer"
              />
            </div>
          )}
          {columns.map(col => (
            <div key={col.key}
              className={`
                text-[9px] font-mono uppercase tracking-wider text-[#334155] flex items-center gap-1.5
                ${col.alignRight ? "justify-end" : ""}
                ${col.sortable !== false && col.accessor ? "cursor-pointer select-none hover:text-[#64748B] transition-colors" : ""}
              `}
              onClick={col.sortable !== false && col.accessor ? () => handleSort(col.key) : undefined}>
              {col.header}
              {col.sortable !== false && col.accessor && (
                <SortIcon active={sortKey === col.key} dir={sortDir} />
              )}
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <Spinner size="md" centered label="Cargando…" />
        )}

        {/* Vacío */}
        {!loading && paged.length === 0 && (
          <EmptyState
            title={emptyTitle}
            subtitle={emptySubtitle}
            icon={emptyIcon}
            className="py-14"
          />
        )}

        {/* Filas */}
        {!loading && paged.map((row, rowIdx) => {
          const key = getKey(row, rowKey);
          const selected = selectedKeys?.has(key);
          const clickable = !!onRowClick;

          return (
            <div
              key={key}
              className={`grid px-4 items-center transition-all duration-100 ${rowClassName?.(row) ?? ""}`}
              style={{
                gridTemplateColumns: gridCols,
                borderBottom: rowIdx < paged.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: selected
                  ? "rgba(245,158,11,0.05)"
                  : "transparent",
                cursor: clickable ? "pointer" : "default",
                minHeight: "48px",
              }}
              onClick={clickable ? () => onRowClick!(row) : undefined}
              onMouseEnter={e => {
                if (!selected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = selected ? "rgba(245,158,11,0.05)" : "transparent";
              }}
            >
              {selectable && (
                <div className="flex items-center justify-center py-3"
                  onClick={e => { e.stopPropagation(); toggleRow(key); }}>
                  <input
                    type="checkbox"
                    checked={selected ?? false}
                    onChange={() => toggleRow(key)}
                    className="accent-amber-400 w-3.5 h-3.5 cursor-pointer"
                  />
                </div>
              )}
              {columns.map(col => (
                <div
                  key={col.key}
                  className={`py-3 pr-4 text-[13px] text-[#94A3B8] ${col.alignRight ? "text-right" : ""}`}
                >
                  {col.render ? col.render(row, rowIdx) : String(getVal(row, col))}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ── Footer slot ── */}
      {footer && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {footer}
        </div>
      )}

      {/* ── Paginación ── */}
      {pageSize && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] text-[#334155] font-mono">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} de {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#475569] disabled:opacity-30 transition-colors"
              style={{ background: "rgba(255,255,255,0.03)" }}
              onMouseEnter={e => !!(e.currentTarget as HTMLButtonElement).disabled || ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const targetPage = totalPages <= 7 ? i : i; // simplified for now
              return (
                <button key={i}
                  onClick={() => setPage(i)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-mono transition-all"
                  style={{
                    background: page === i ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
                    color:      page === i ? "#F59E0B" : "#475569",
                    border:     page === i ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent",
                  }}>
                  {i + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#475569] disabled:opacity-30 transition-colors"
              style={{ background: "rgba(255,255,255,0.03)" }}
              onMouseEnter={e => !!(e.currentTarget as HTMLButtonElement).disabled || ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;