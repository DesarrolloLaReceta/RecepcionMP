import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { lotesService, type LotePendienteDto } from "../../Services/lotes.service";
import { ROUTES } from "../../Constants/routes";
import {
  StatusBadge, Button, Card, CardHeader, CardSection,
} from "../../Components/UI/Index";
import {
  formatDate, formatDateTime, formatQuantity,
  formatTemp, formatTempRange, vencimientoColor,
} from "../../Utils/formatters";
import { MOCK_LOTES_PENDIENTES } from "../Liberacion/MockData";
import "./StylesLotes/DetalleLotePage.css";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ===== CONSTANTES LOCALES =====
const ESTADO_SENSORIAL_LABELS: Record<number, string> = {
  0: "Óptimo",
  1: "Aceptable",
  2: "Deficiente",
};

const ESTADO_ROTULADO_LABELS: Record<number, string> = {
  0: "Conforme",
  1: "No conforme",
  2: "Sin rótulo",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function tempOk(med?: number, min?: number, max?: number): boolean | null {
  if (med == null || min == null || max == null) return null;
  return med >= min && med <= max;
}

// ─── FIELD — label + valor ────────────────────────────────────────────────────

function Field({
  label, value, mono = false, full = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?:  boolean;
  full?:  boolean;
}) {
  return (
    <div className={full ? "dl-field-full" : undefined}>
      <p className="dl-field-label">{label}</p>
      <p className={`dl-field-value${mono ? " dl-field-value--mono" : ""}`}>
        {value ?? <span style={{ color: "#334155" }}>—</span>}
      </p>
    </div>
  );
}

// ─── DETALLE LOTE PAGE ────────────────────────────────────────────────────────

export default function DetalleLotePage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lote,    setLote]    = useState<LotePendienteDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (isMock) {
          await new Promise(r => setTimeout(r, 350));
          const found = MOCK_LOTES_PENDIENTES.find(l => l.id === id)
                     ?? MOCK_LOTES_PENDIENTES[0];
          setLote(found ?? null);
        } else {
          // Cuando el backend exponga getById usar: await lotesService.getById(id)
          const lotes = await lotesService.getPendientes();
          const found = lotes.find(l => l.id === id);
          if (!found) throw new Error("not_found");
          setLote(found);
        }
      } catch {
        setError("No se pudo cargar el detalle del lote.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ── Estados de carga / error ──────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"
            style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            Cargando lote…
          </p>
        </div>
      </div>
    );
  }

  if (error || !lote) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "5rem 0" }}>
        <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
          </svg>
        </div>
        <p style={{ color: "#FCA5A5", fontSize: "var(--text-md)" }}>
          {error ?? "Lote no encontrado."}
        </p>
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOTES)}
          iconLeft="M15 18l-6-6 6-6">
          Volver a lotes
        </Button>
      </div>
    );
  }

  const urgencia  = vencimientoColor(lote.diasParaVencer);
  const ok        = tempOk(lote.temperaturaMedida, lote.temperaturaMinima, lote.temperaturaMaxima);
  const tempFuera = ok === false;

  // Variante de la Card de calidad según estado
  const variantCalidad = tempFuera || lote.tieneDocumentosFaltantes
    ? "warning"
    : lote.estado === "Liberado"
    ? "success"
    : lote.estado.includes("Rechazado")
    ? "danger"
    : "default";

  return (
    <div className="dl-page">

      {/* ── Header ── */}
      <div className="dl-header">
        <div className="dl-header-info">
          <p className="dl-breadcrumb">Lotes / Detalle</p>
          <h1 className="dl-lote-num">{lote.numeroLoteInterno}</h1>
          <p className="dl-lote-item">
            {lote.itemNombre}
            {" · "}
            <span style={{ color: "var(--text-muted)" }}>{lote.itemCodigo}</span>
          </p>
        </div>

        {/* Estado + acción de liberación */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <StatusBadge domain="lote" value={lote.estado} size="sm" />
          {lote.estado === "PendienteCalidad" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.LIBERACION)}
              iconLeft="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 004.438 0 3.42 3.42 0 013.138 3.138 3.42 3.42 0 004.438 0 3.42 3.42 0 010 4.438 3.42 3.42 0 010 4.438 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 01-4.438 0 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 010-4.438 3.42 3.42 0 010-4.438 3.42 3.42 0 013.138-3.138z"
            >
              Ir a liberación
            </Button>
          )}
        </div>
      </div>

      {/* ── Layout principal ── */}
      <div className="dl-grid">

        {/* ── Columna izquierda ── */}
        <div className="dl-col">

          {/* Info del lote */}
          <Card>
            <CardHeader
              title="Información del lote"
              icon="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"
              iconColor="#F59E0B"
            />
            <CardSection>
              <div className="dl-field-grid">
                <Field label="N° Lote interno"   value={lote.numeroLoteInterno}            mono />
                <Field label="N° Lote proveedor"  value={lote.numeroLoteProveedor}          mono />
                <Field label="Fecha fabricación"  value={formatDate(lote.fechaFabricacion)} />
                <Field label="Fecha recepción"    value={formatDate(lote.fechaRecepcion)}   />

                {/* Vencimiento con dot de urgencia */}
                <div className="dl-field-full">
                  <p className="dl-field-label">Vencimiento</p>
                  <div className="dl-venc-row">
                    <span className="dl-field-value">{formatDate(lote.fechaVencimiento)}</span>
                    <span className="dl-venc-dot" style={{ background: urgencia.dot }} aria-hidden="true" />
                    <span className="dl-venc-dias" style={{ color: urgencia.text }}>
                      {lote.diasParaVencer < 0
                        ? `Vencido hace ${Math.abs(lote.diasParaVencer)}d`
                        : `${lote.diasParaVencer} días restantes`}
                    </span>
                  </div>
                </div>

                <Field label="Cantidad recibida"
                  value={formatQuantity(lote.cantidadRecibida, lote.unidadMedida)} mono />
                {/* Cantidad esperada no está disponible en LotePendienteDto, se omite */}
              </div>
            </CardSection>
          </Card>

          {/* Recepción origen */}
          <Card variant="inset">
            <CardHeader
              title="Recepción origen"
              icon="M5 3h14a2 2 0 012 2v3H3V5a2 2 0 012-2zM3 8h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
              iconColor="#93C5FD"
            />
            <CardSection>
              <div className="dl-field-grid">
                <div>
                  <p className="dl-field-label">N° Recepción</p>
                  <Link
                    to={`/recepciones/${lote.recepcionId}`}
                    className="dl-link-rec dl-field-value--mono"
                  >
                    {lote.numeroRecepcion}
                  </Link>
                </div>
                <Field label="Fecha"    value={formatDate(lote.fechaRecepcion)} />
                <Field label="Proveedor" value={lote.proveedorNombre} />
                <Field label="Categoría" value={lote.categoriaNombre} />
              </div>
            </CardSection>
          </Card>

          {/* Observaciones */}
          {lote.observacionesRecepcion && (
            <Card variant="inset">
              <CardHeader
                title="Observaciones de recepción"
                icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                iconColor="#64748B"
              />
              <CardSection>
                <p style={{ fontSize: "var(--text-md)", color: "#94A3B8", lineHeight: 1.6 }}>
                  {lote.observacionesRecepcion}
                </p>
                <p style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", marginTop: "0.75rem" }}>
                  Registrado: {formatDateTime(lote.fechaRecepcion)}
                </p>
              </CardSection>
            </Card>
          )}

        </div>

        {/* ── Columna derecha ── */}
        <div className="dl-col">

          {/* Inspección de calidad */}
          <Card variant={variantCalidad}>
            <CardHeader
              title="Inspección de calidad"
              icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 004.438 0 3.42 3.42 0 013.138 3.138 3.42 3.42 0 004.438 0 3.42 3.42 0 010 4.438 3.42 3.42 0 010 4.438 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 01-4.438 0 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 010-4.438 3.42 3.42 0 010-4.438 3.42 3.42 0 013.138-3.138z"
              iconColor={tempFuera ? "#FCD34D" : "#86EFAC"}
            />
            <CardSection>
              <div className="dl-inspeccion-grid">

                {/* Bloque temperatura */}
                {lote.requiereCadenaFrio && (
                  <div
                    className="dl-temp-bloc"
                    style={{
                      background: tempFuera
                        ? "rgba(239,68,68,0.06)"
                        : "rgba(34,197,94,0.06)",
                      border: `1px solid ${tempFuera
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(34,197,94,0.12)"}`,
                    }}
                  >
                    <div className="dl-temp-header">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke={tempFuera ? "#FCA5A5" : "#86EFAC"}
                        strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 2v20M12 2l-4 4M12 2l4 4" />
                      </svg>
                      <span className="dl-temp-label">Temperatura medida</span>
                      <span className="dl-temp-value"
                        style={{ color: tempFuera ? "#FCA5A5" : "#86EFAC" }}>
                        {lote.temperaturaMedida != null
                          ? formatTemp(lote.temperaturaMedida)
                          : "N/A"}
                      </span>
                    </div>
                    {lote.temperaturaMinima != null && lote.temperaturaMaxima != null && (
                      <p className="dl-temp-range">
                        Rango permitido: {formatTempRange(lote.temperaturaMinima, lote.temperaturaMaxima)}
                      </p>
                    )}
                  </div>
                )}

                {/* Sensorial */}
                <Field label="Estado sensorial"
                  value={ESTADO_SENSORIAL_LABELS[lote.estadoSensorial] ?? "—"} />

                {/* Rotulado */}
                <Field label="Rotulado"
                  value={ESTADO_ROTULADO_LABELS[lote.estadoRotulado] ?? "—"} />

                {/* Cadena de frío */}
                <Field label="Cadena de frío"
                  value={lote.requiereCadenaFrio ? "Requiere" : "No aplica"} />

                {/* Destino */}
                <Field label="Ubicación destino"
                  value={lote.ubicacionDestino === 0 ? "Almacén" : "Cuarentena"} />

              </div>
            </CardSection>

            {/* Alerta docs faltantes */}
            {lote.tieneDocumentosFaltantes && (
              <CardSection>
                <div className="dl-docs-alert">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"
                    style={{ marginTop: "1px", flexShrink: 0 }} aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                  </svg>
                  <div>
                    <p className="dl-docs-alert-title">Documentos faltantes</p>
                    {lote.documentosFaltantes.map((d: string) => (
                      <p key={d} className="dl-docs-alert-item">{d}</p>
                    ))}
                  </div>
                </div>
              </CardSection>
            )}
          </Card>

          {/* Trazabilidad */}
          <Card variant="inset">
            <CardHeader
              title="Trazabilidad"
              icon="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0H5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2H9z"
              iconColor="#C4B5FD"
            />
            <CardSection>
              <div className="dl-field-grid">
                <Field label="Código ítem"  value={lote.itemCodigo}  mono />
                <Field label="Categoría"    value={lote.categoriaNombre}   />
                <Field label="Proveedor"    value={lote.proveedorNombre}   />
                <div>
                  <p className="dl-field-label">Recepción</p>
                  <Link to={`/recepciones/${lote.recepcionId}`} className="dl-link-rec dl-field-value--mono">
                    {lote.numeroRecepcion}
                  </Link>
                </div>
                {lote.numeroLoteProveedor && (
                  <Field label="Lote proveedor" value={lote.numeroLoteProveedor} mono />
                )}
              </div>
            </CardSection>
          </Card>

        </div>
      </div>

      {/* ── Botón volver ── */}
      <div>
        <button
          className="dl-back-btn"
          onClick={() => navigate(ROUTES.LOTES)}
          type="button"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver a lotes
        </button>
      </div>

    </div>
  );
}