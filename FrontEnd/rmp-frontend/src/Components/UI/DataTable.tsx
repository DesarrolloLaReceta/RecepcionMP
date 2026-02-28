import { type ReactNode, useState, useMemo } from "react";
import { Spinner } from "./Spinner";
import { EmptyState } from "./EmptyState";
import "./StylesUI/DataTable.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type SortDir = "asc" | "desc";

export interface Column<T> {
  /** Clave única de la columna */
  key:         string;
  header:      string;
  /** Ancho CSS (ej: "120px", "minmax(0,2fr)") — se usa en grid-template-columns */
  width?:      string;
  /** Si false, la columna no es ordenable (default: true si hay accessor) */
  sortable?:   boolean;
  /** Alinear celda a la derecha */
  alignRight?: boolean;
  /** Render custom de la celda */
  render?:     (row: T, idx: number) => ReactNode;
  /** Accessor para ordenar/mostrar */
  accessor?:   keyof T | ((row: T) => string | number);
}

export interface DataTableProps<T> {
  columns:         Column<T>[];
  data:            T[];
  /** Clave única por fila */
  rowKey:          keyof T | ((row: T) => string);
  loading?:        boolean;
  emptyTitle?:     string;
  emptySubtitle?:  string;
  emptyIcon?:      string;
  selectable?:     boolean;
  selectedKeys?:   Set<string>;
  onSelectChange?: (keys: Set<string>) => void;
  onRowClick?:     (row: T) => void;
  /** Filas por página — si no se pasa, sin paginación */
  pageSize?:       number;
  defaultSort?:    { key: string; dir: SortDir };
  className?:      string;
  rowClassName?:   (row: T) => string;
  footer?:         ReactNode;
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
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      className="dt-sort-icon"
      data-active={active}
      aria-hidden="true"
    >
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
 *     { key: "numeroOC", header: "N° OC", width: "120px",
 *       render: oc => <span className="font-mono">{oc.numeroOC}</span> },
 *     { key: "proveedor", header: "Proveedor", accessor: oc => oc.proveedorNombre },
 *     { key: "estado",    header: "Estado",
 *       render: oc => <StatusBadge domain="oc" value={oc.estado} /> },
 *     { key: "valor", header: "Valor", alignRight: true,
 *       render: oc => <span>{fmtCOP(oc.valorTotal)}</span> },
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
  const [page,    setPage]    = useState(0);

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
  const paged      = pageSize ? sorted.slice(page * pageSize, (page + 1) * pageSize) : sorted;

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

  // ── Grid columns CSS (dinámico — debe ser inline) ────────────────────────────
  const gridCols = [
    ...(selectable ? ["2.5rem"] : []),
    ...columns.map(c => c.width ?? "minmax(0,1fr)"),
  ].join(" ");

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className={`dt-root ${className}`}>

      {/* ── Área scroll ── */}
      <div className="dt-scroll">

        {/* Header */}
        <div
          className="dt-header"
          style={{ gridTemplateColumns: gridCols }}
        >
          {selectable && (
            <div className="dt-checkbox-cell">
              <input
                type="checkbox"
                className="dt-checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={toggleAll}
              />
            </div>
          )}

          {columns.map(col => {
            const sortable = col.sortable !== false && !!col.accessor;
            const thCls = [
              "dt-th",
              col.alignRight && "dt-th-right",
              sortable       && "dt-th-sortable",
            ].filter(Boolean).join(" ");

            return (
              <div
                key={col.key}
                className={thCls}
                onClick={sortable ? () => handleSort(col.key) : undefined}
              >
                {col.header}
                {sortable && (
                  <SortIcon active={sortKey === col.key} dir={sortDir} />
                )}
              </div>
            );
          })}
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
            className="dt-empty"
            size="sm"
          />
        )}

        {/* Filas */}
        {!loading && paged.map((row, rowIdx) => {
          const key      = getKey(row, rowKey);
          const selected = selectedKeys?.has(key) ?? false;
          const clickable = !!onRowClick;

          const rowCls = [
            "dt-row",
            clickable && "dt-row-clickable",
            rowClassName?.(row),
          ].filter(Boolean).join(" ");

          return (
            <div
              key={key}
              className={rowCls}
              data-selected={selected}
              style={{ gridTemplateColumns: gridCols }}
              onClick={clickable ? () => onRowClick!(row) : undefined}
            >
              {selectable && (
                <div
                  className="dt-checkbox-cell"
                  onClick={e => { e.stopPropagation(); toggleRow(key); }}
                >
                  <input
                    type="checkbox"
                    className="dt-checkbox"
                    checked={selected}
                    onChange={() => toggleRow(key)}
                  />
                </div>
              )}

              {columns.map(col => (
                <div
                  key={col.key}
                  className={`dt-td${col.alignRight ? " dt-td-right" : ""}`}
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
        <div className="dt-footer">
          {footer}
        </div>
      )}

      {/* ── Paginación ── */}
      {pageSize && totalPages > 1 && (
        <div className="dt-pagination">

          <p className="dt-pagination-info">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} de {sorted.length}
          </p>

          <div className="dt-pagination-controls">

            {/* Prev */}
            <button
              className="dt-page-btn"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Página anterior"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" className="dt-page-icon" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Números */}
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
              <button
                key={i}
                className="dt-page-btn"
                data-active={page === i}
                onClick={() => setPage(i)}
                aria-label={`Página ${i + 1}`}
                aria-current={page === i ? "page" : undefined}
              >
                {i + 1}
              </button>
            ))}

            {/* Next */}
            <button
              className="dt-page-btn"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              aria-label="Página siguiente"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" className="dt-page-icon" aria-hidden="true">
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