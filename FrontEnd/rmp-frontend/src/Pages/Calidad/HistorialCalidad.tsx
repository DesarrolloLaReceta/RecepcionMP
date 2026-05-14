import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  DataTable,
  Modal,
  ModalFooter,
  Skeleton,
} from "../../Components/UI/Index";
import type { Column } from "../../Components/UI/Index";
import { ROUTES } from "../../Constants/routes";
import {
  calidadService,
  type LavadoManosDetalle,
  type LavadoManosHistorialItem,
  type LiberacionCocinaDetalle,
  type LiberacionCocinaHistorialItem,
  type VerificacionInstalacionDetalle,
  type VerificacionInstalacionHistorialItem,
} from "../../Services/calidad.service";
import "../Recepciones/StylesRecepciones/NuevaRecepcionPage.css";
import "./StylesCalidad/LiberacionCocina.css";
import "./StylesCalidad/HistorialLiberacionPage.css";
import "./StylesCalidad/HistorialCalidad.css";

const PAGE_SIZE = 10;

/** Paleta corporativa La Receta / il forno (tokens en `tokens.css`) */
const BADGE_TIPO_LIBERACION = "#df6129";
const BADGE_TIPO_VERIFICACION = "#273719";
const BADGE_TIPO_LAVADO = "#2f855a";

export type HistorialCalidadTipo =
  | "liberacion_cocina"
  | "verificacion_instalaciones"
  | "lavado_botas_manos";

export interface HistorialCalidadFila {
  tipo: HistorialCalidadTipo;
  /** Clave estable para React / DataTable */
  id: string;
  fechaIso: string;
  /** Cocina, zona o punto físico; "-" si no aplica */
  puntoArea: string;
  nombreResponsable: string;
  tieneFallas: boolean;
  liberacionId?: number;
  verificacionId?: string;
  lavadoId?: string;
}

const TIPO_LABEL: Record<HistorialCalidadTipo, string> = {
  liberacion_cocina: "Liberación de cocina",
  verificacion_instalaciones: "Verificación de instalaciones",
  lavado_botas_manos: "Lavado de botas y manos",
};

function dashIfEmpty(value: string | null | undefined): string {
  const t = (value ?? "").trim();
  return t.length > 0 ? t : "-";
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPuntoLavado(piso: string, entrada: string): string {
  const p = (piso ?? "").trim();
  const e = (entrada ?? "").trim();
  if (!p && !e) return "-";
  if (p && e) return `${p} · ${e}`;
  return p || e;
}

function mapLiberacion(row: LiberacionCocinaHistorialItem): HistorialCalidadFila {
  return {
    tipo: "liberacion_cocina",
    id: `liberacion_cocina:${row.id}`,
    fechaIso: row.fecha,
    puntoArea: dashIfEmpty(row.cocina),
    nombreResponsable: row.nombreResponsable,
    tieneFallas: row.tieneFallas,
    liberacionId: row.id,
  };
}

function mapVerificacion(row: VerificacionInstalacionHistorialItem): HistorialCalidadFila {
  return {
    tipo: "verificacion_instalaciones",
    id: `verificacion_instalaciones:${row.id}`,
    fechaIso: row.fecha,
    puntoArea: dashIfEmpty(row.zona),
    nombreResponsable: row.nombreResponsable,
    tieneFallas: row.tieneFallas,
    verificacionId: row.id,
  };
}

function mapLavado(row: LavadoManosHistorialItem): HistorialCalidadFila {
  return {
    tipo: "lavado_botas_manos",
    id: `lavado_botas_manos:${row.id}`,
    fechaIso: row.fecha,
    puntoArea: formatPuntoLavado(row.piso, row.entrada),
    nombreResponsable: row.nombreResponsable,
    tieneFallas: row.tieneFallas,
    lavadoId: row.id,
  };
}

function tipoBadgeToken(tipo: HistorialCalidadTipo): string {
  switch (tipo) {
    case "liberacion_cocina":
      return BADGE_TIPO_LIBERACION;
    case "verificacion_instalaciones":
      return BADGE_TIPO_VERIFICACION;
    default:
      return BADGE_TIPO_LAVADO;
  }
}

const ICON_EYE =
  "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z";

export default function HistorialCalidad() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<HistorialCalidadFila[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleLiberacion, setDetalleLiberacion] = useState<LiberacionCocinaDetalle | null>(null);
  const [detalleVerificacion, setDetalleVerificacion] =
    useState<VerificacionInstalacionDetalle | null>(null);
  const [detalleLavado, setDetalleLavado] = useState<LavadoManosDetalle | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lib, ver, lav] = await Promise.all([
        calidadService.getLiberacionesCocinasHistorial(),
        calidadService.getVerificacionesInstalacionesHistorial(),
        calidadService.getLavadosManosHistorial(),
      ]);

      const merged: HistorialCalidadFila[] = [
        ...lib.map(mapLiberacion),
        ...ver.map(mapVerificacion),
        ...lav.map(mapLavado),
      ].sort((a, b) => new Date(b.fechaIso).getTime() - new Date(a.fechaIso).getTime());

      setRows(merged);
    } catch {
      setError(
        "No fue posible cargar el historial unificado. Verifica tu sesión y la conexión con la API."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const tipoTxt = TIPO_LABEL[row.tipo].toLowerCase();
      const estadoTxt = row.tieneFallas ? "con novedad" : "cumple";
      const punto = row.puntoArea.toLowerCase();
      const resp = row.nombreResponsable.toLowerCase();
      return (
        tipoTxt.includes(q) ||
        punto.includes(q) ||
        resp.includes(q) ||
        estadoTxt.includes(q)
      );
    });
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageSlice = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [filtered, safePage]
  );

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  const openDetalle = useCallback(async (row: HistorialCalidadFila) => {
    setModalOpen(true);
    setDetalleLoading(true);
    setDetalleLiberacion(null);
    setDetalleVerificacion(null);
    setDetalleLavado(null);
    try {
      if (row.tipo === "liberacion_cocina" && row.liberacionId != null) {
        const d = await calidadService.getLiberacionCocinaById(row.liberacionId);
        setDetalleLiberacion(d);
      } else if (row.tipo === "verificacion_instalaciones" && row.verificacionId) {
        const d = await calidadService.getVerificacionInstalacionById(row.verificacionId);
        setDetalleVerificacion(d);
      } else if (row.tipo === "lavado_botas_manos" && row.lavadoId) {
        const d = await calidadService.getLavadoManosById(row.lavadoId);
        setDetalleLavado(d);
      }
    } catch {
      setDetalleLiberacion(null);
      setDetalleVerificacion(null);
      setDetalleLavado(null);
    } finally {
      setDetalleLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setDetalleLiberacion(null);
    setDetalleVerificacion(null);
    setDetalleLavado(null);
  }, []);

  const modalTitle = useMemo(() => {
    if (detalleLiberacion) return "Detalle — Liberación de cocina";
    if (detalleVerificacion) return "Detalle — Verificación de instalaciones";
    if (detalleLavado) return "Detalle — Lavado de botas y manos";
    return "Detalle";
  }, [detalleLiberacion, detalleVerificacion, detalleLavado]);

  const columns: Column<HistorialCalidadFila>[] = useMemo(
    () => [
      {
        key: "fecha",
        header: "Fecha",
        width: "130px",
        sortable: false,
        accessor: (row) => row.fechaIso,
        render: (row) => <span>{formatFecha(row.fechaIso)}</span>,
      },
      {
        key: "tipo",
        header: "Tipo de Formulario",
        width: "minmax(0,1.5fr)",
        sortable: false,
        accessor: (row) => TIPO_LABEL[row.tipo],
        render: (row) => (
          <Badge
            color="custom"
            colorToken={tipoBadgeToken(row.tipo)}
            size="sm"
            className="hc-badge-tipo"
          >
            {TIPO_LABEL[row.tipo]}
          </Badge>
        ),
      },
      {
        key: "puntoArea",
        header: "Punto / área",
        width: "minmax(0,1.35fr)",
        sortable: false,
        accessor: (row) => row.puntoArea,
        render: (row) => <span>{row.puntoArea}</span>,
      },
      {
        key: "responsable",
        header: "Responsable",
        width: "minmax(0,1.2fr)",
        sortable: false,
        accessor: (row) => row.nombreResponsable,
      },
      {
        key: "estado",
        header: "Estado",
        width: "140px",
        sortable: false,
        render: (row) => (
          <Badge color={row.tieneFallas ? "red" : "green"} size="sm">
            {row.tieneFallas ? "Con Novedad" : "Cumple"}
          </Badge>
        ),
      },
      {
        key: "acciones",
        header: "Acciones",
        width: "100px",
        alignRight: true,
        sortable: false,
        render: (row) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            iconLeft={ICON_EYE}
            aria-label="Ver detalle"
            onClick={(e) => {
              e.stopPropagation();
              void openDetalle(row);
            }}
          />
        ),
      },
    ],
    [openDetalle]
  );

  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((safePage + 1) * PAGE_SIZE, filtered.length);

  const paginationFooter =
    filtered.length > 0 ? (
      <div className="hc-pagination">
        <p className="hc-pagination-info">
          {rangeStart}–{rangeEnd} de {filtered.length}
          {search.trim() ? ` · filtrado` : ""}
        </p>
        <div className="hc-pagination-actions">
          <button
            type="button"
            className="hc-page-btn"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </button>
          <button
            type="button"
            className="hc-page-btn"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Siguiente
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="nr-page hl-page hc-page">
      <div className="nr-header">
        <button
          type="button"
          className="nr-back-btn"
          onClick={() => navigate(ROUTES.GESTION_CALIDAD)}
          aria-label="Volver"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="nr-header-label">Gestión de Calidad</p>
          <h1 className="nr-header-title">Historial unificado — Calidad</h1>
        </div>
      </div>

      {error && (
        <div className="nr-error" role="alert">
          <p className="nr-error-text">{error}</p>
        </div>
      )}

      <div className="nr-card">
        {loading ? (
          <Skeleton rows={6} variant="list" />
        ) : (
          <>
            <div className="hc-toolbar">
              <div className="hc-search-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-4-4" />
                </svg>
                <input
                  type="search"
                  className="hc-search-input"
                  placeholder="Buscar por tipo, punto/área, responsable o estado (Cumple / Con novedad)…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Buscar en historial"
                />
              </div>
            </div>

            <div className="hc-table-wrap">
              <DataTable<HistorialCalidadFila>
                columns={columns}
                data={pageSlice}
                rowKey="id"
                loading={false}
                emptyTitle={search.trim() ? "Sin coincidencias" : "Sin registros"}
                emptySubtitle={
                  search.trim()
                    ? "Prueba con otro término o revisa el filtro."
                    : "Cuando se guarden formularios de calidad, aparecerán aquí."
                }
                footer={paginationFooter ?? undefined}
              />
            </div>
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        subtitle={
          detalleLiberacion
            ? formatFecha(detalleLiberacion.fecha)
            : detalleVerificacion
              ? formatFecha(detalleVerificacion.fecha)
              : detalleLavado
                ? formatFecha(detalleLavado.fecha)
                : undefined
        }
        size="lg"
        loading={detalleLoading}
        footer={<ModalFooter cancelLabel="Cerrar" onCancel={closeModal} />}
      >
        {!detalleLoading && detalleLiberacion && (
          <>
            <div className="hl-modal-meta">
              <div>
                Cocina
                <strong>{detalleLiberacion.cocina}</strong>
              </div>
              <div>
                Turno
                <strong>{detalleLiberacion.turno}</strong>
              </div>
              <div>
                Responsable
                <strong>{detalleLiberacion.nombreResponsable}</strong>
              </div>
              <div>
                Cargo
                <strong>{detalleLiberacion.cargoResponsable}</strong>
              </div>
            </div>

            {(detalleLiberacion.observacionesInspeccion?.trim() ||
              detalleLiberacion.observacionesGenerales?.trim()) && (
              <div className="hl-modal-obs">
                {!!detalleLiberacion.observacionesInspeccion?.trim() && (
                  <p>
                    <strong>Observaciones inspección:</strong>{" "}
                    {detalleLiberacion.observacionesInspeccion}
                  </p>
                )}
                {!!detalleLiberacion.observacionesGenerales?.trim() && (
                  <p>
                    <strong>Observaciones generales:</strong>{" "}
                    {detalleLiberacion.observacionesGenerales}
                  </p>
                )}
              </div>
            )}

            <div className="lc-section" style={{ marginTop: 0 }}>
              <div className="lc-grid-head">
                <div>Ítem</div>
                <div style={{ textAlign: "center" }}>Estado</div>
              </div>
              {detalleLiberacion.detalles.map((d, i) => (
                <div key={i} className="lc-grid-row">
                  <div className="lc-item-text">{d.item}</div>
                  <div style={{ textAlign: "center" }}>
                    <Badge
                      color={
                        d.estado.toLowerCase() === "no cumple"
                          ? "red"
                          : d.estado.toLowerCase() === "cumple"
                            ? "green"
                            : "slate"
                      }
                      size="sm"
                    >
                      {d.estado}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!detalleLoading && detalleVerificacion && (
          <>
            <div className="hl-modal-meta">
              <div>
                Zona
                <strong>{detalleVerificacion.zona}</strong>
              </div>
              <div>
                Cumplimiento total
                <strong>{detalleVerificacion.cumplimientoTotal}%</strong>
              </div>
              <div>
                Responsable
                <strong>{detalleVerificacion.nombreResponsable}</strong>
              </div>
              <div>
                Cargo
                <strong>{detalleVerificacion.cargoResponsable}</strong>
              </div>
            </div>

            <div className="lc-section" style={{ marginTop: 0 }}>
              <div className="lc-grid-head">
                <div>Aspecto</div>
                <div style={{ textAlign: "center" }}>Calificación</div>
              </div>
              {detalleVerificacion.detalles.map((d) => (
                <div key={d.aspectoId} className="lc-grid-row">
                  <div className="lc-item-text">{d.aspectoNombre}</div>
                  <div style={{ textAlign: "center" }}>
                    <Badge color={d.calificacion === 1 ? "red" : "green"} size="sm">
                      {d.calificacion === 1 ? "Con hallazgo" : "Cumple"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!detalleLoading && detalleLavado && (
          <>
            <div className="hl-modal-meta">
              <div>
                Turno
                <strong>{detalleLavado.turno}</strong>
              </div>
              <div>
                Punto / área
                <strong>{formatPuntoLavado(detalleLavado.piso, detalleLavado.entrada)}</strong>
              </div>
              <div>
                Personas revisadas
                <strong>{detalleLavado.personasRevisadas}</strong>
              </div>
              <div>
                Responsable
                <strong>{detalleLavado.nombreResponsable}</strong>
              </div>
              <div>
                Cargo
                <strong>{detalleLavado.cargoResponsable}</strong>
              </div>
            </div>

            {(detalleLavado.novedades?.trim() || detalleLavado.observaciones?.trim()) && (
              <div className="hl-modal-obs">
                {!!detalleLavado.novedades?.trim() && (
                  <p>
                    <strong>Novedades:</strong> {detalleLavado.novedades}
                  </p>
                )}
                {!!detalleLavado.observaciones?.trim() && (
                  <p>
                    <strong>Observaciones:</strong> {detalleLavado.observaciones}
                  </p>
                )}
              </div>
            )}

            {detalleLavado.fotoUrl && (
              <div style={{ marginTop: "0.75rem" }}>
                <p className="nr-header-label" style={{ marginBottom: "0.35rem" }}>
                  Evidencia fotográfica
                </p>
                <img
                  src={detalleLavado.fotoUrl}
                  alt="Evidencia lavado de botas y manos"
                  style={{ maxWidth: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}
                />
              </div>
            )}
          </>
        )}

        {!detalleLoading &&
          modalOpen &&
          !detalleLiberacion &&
          !detalleVerificacion &&
          !detalleLavado && (
            <p className="nr-error-text">No se pudo cargar el detalle.</p>
          )}
      </Modal>
    </div>
  );
}
