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
  type LiberacionCocinaDetalle,
  type LiberacionCocinaHistorialItem,
} from "../../Services/calidad.service";
import "../Recepciones/StylesRecepciones/NuevaRecepcionPage.css";
import "./StylesCalidad/LiberacionCocina.css";
import "./StylesCalidad/HistorialLiberacionPage.css";

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Ícono ojo (SVG path) compatible con `Button` (`iconLeft`). */
const ICON_EYE =
  "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z";

export default function HistorialLiberacionPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LiberacionCocinaHistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalle, setDetalle] = useState<LiberacionCocinaDetalle | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await calidadService.getLiberacionesCocinasHistorial();
      setRows(data);
    } catch {
      setError("No fue posible cargar el historial. Verifica tu sesión y la conexión con la API.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const openDetalle = useCallback(async (id: number) => {
    setModalOpen(true);
    setDetalleLoading(true);
    setDetalle(null);
    try {
      const d = await calidadService.getLiberacionCocinaById(id);
      setDetalle(d);
    } catch {
      setDetalle(null);
    } finally {
      setDetalleLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setDetalle(null);
  }, []);

  const columns: Column<LiberacionCocinaHistorialItem>[] = useMemo(
    () => [
      {
        key: "fecha",
        header: "Fecha",
        width: "130px",
        accessor: (row) => row.fecha,
        render: (row) => <span>{formatFecha(row.fecha)}</span>,
      },
      {
        key: "cocina",
        header: "Cocina",
        width: "minmax(0,1.4fr)",
        accessor: (row) => row.cocina,
      },
      {
        key: "responsable",
        header: "Responsable",
        width: "minmax(0,1.2fr)",
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
              void openDetalle(row.id);
            }}
          />
        ),
      },
    ],
    [openDetalle]
  );

  return (
    <div className="nr-page hl-page">
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
          <h1 className="nr-header-title">Historial — Liberación de cocina</h1>
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
          <DataTable<LiberacionCocinaHistorialItem>
            columns={columns}
            data={rows}
            rowKey="id"
            loading={false}
            defaultSort={{ key: "fecha", dir: "desc" }}
            emptyTitle="Sin liberaciones registradas"
            emptySubtitle="Cuando se guarden formularios de liberación, aparecerán aquí."
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Detalle de liberación"
        subtitle={detalle ? formatFecha(detalle.fecha) : undefined}
        size="lg"
        loading={detalleLoading}
        footer={<ModalFooter cancelLabel="Cerrar" onCancel={closeModal} />}
      >
        {!detalleLoading && detalle && (
          <>
            <div className="hl-modal-meta">
              <div>
                Cocina
                <strong>{detalle.cocina}</strong>
              </div>
              <div>
                Turno
                <strong>{detalle.turno}</strong>
              </div>
              <div>
                Responsable
                <strong>{detalle.nombreResponsable}</strong>
              </div>
              <div>
                Cargo
                <strong>{detalle.cargoResponsable}</strong>
              </div>
            </div>

            {(detalle.observacionesInspeccion?.trim() ||
              detalle.observacionesGenerales?.trim()) && (
              <div className="hl-modal-obs">
                {!!detalle.observacionesInspeccion?.trim() && (
                  <p>
                    <strong>Observaciones inspección:</strong>{" "}
                    {detalle.observacionesInspeccion}
                  </p>
                )}
                {!!detalle.observacionesGenerales?.trim() && (
                  <p>
                    <strong>Observaciones generales:</strong>{" "}
                    {detalle.observacionesGenerales}
                  </p>
                )}
              </div>
            )}

            <div className="lc-section" style={{ marginTop: 0 }}>
              <div className="lc-grid-head">
                <div>Ítem</div>
                <div style={{ textAlign: "center" }}>Estado</div>
              </div>
              {detalle.detalles.map((d, i) => (
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

        {!detalleLoading && !detalle && modalOpen && (
          <p className="nr-error-text">No se pudo cargar el detalle.</p>
        )}
      </Modal>
    </div>
  );
}
