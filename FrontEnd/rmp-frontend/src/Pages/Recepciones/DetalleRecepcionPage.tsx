import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { recepcionesService, type RecepcionDetalle, type LoteRecibido } from "../../Services/recepciones.service";
import { EstadoRecepcion, TipoDocumento, TipoDocumentoLabels, OrigenTemperatura } from "../../Types/api";
import { ROUTES } from "../../Constants/routes";
import { formatDate, formatDateTime } from "../../Utils/formatters";
import { MOCK_DETALLE } from "./MockData";
import "./StylesRecepciones/DetalleRecepcionPage.css";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ── Config visual estados
const ESTADO_CFG: Record<EstadoRecepcion, { label: string; color: string; bg: string; dot: string }> = {
  [EstadoRecepcion.Iniciada]:           { label: "Iniciada",       color: "#93C5FD", bg: "rgba(59,130,246,0.1)",  dot: "#3B82F6" },
  [EstadoRecepcion.InspeccionVehiculo]: { label: "Insp. vehículo", color: "#C4B5FD", bg: "rgba(168,85,247,0.1)", dot: "#A855F7" },
  [EstadoRecepcion.RegistroLotes]:      { label: "Reg. lotes",     color: "#FCD34D", bg: "rgba(245,158,11,0.1)", dot: "#F59E0B" },
  [EstadoRecepcion.PendienteCalidad]:   { label: "Pend. calidad",  color: "#FCA5A5", bg: "rgba(239,68,68,0.1)",  dot: "#EF4444" },
  [EstadoRecepcion.Liberada]:           { label: "Liberada",       color: "#86EFAC", bg: "rgba(34,197,94,0.1)",  dot: "#22C55E" },
  [EstadoRecepcion.Rechazada]:          { label: "Rechazada",      color: "#94A3B8", bg: "rgba(100,116,139,0.1)", dot: "#64748B" },
};

const ORIGEN_LABELS: Record<number, string> = {
  [OrigenTemperatura.Manual]:    "Manual",
  [OrigenTemperatura.Bluetooth]: "Bluetooth",
  [OrigenTemperatura.Sensor]:    "Sensor IoT",
};

// ── helpers
function diasParaVencer(fecha?: string): number | null {
  if (!fecha) return null;
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
}

// ── sub-componentes ───────────────────────────────────────────────────────────

function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="dr-section">
      <div className="dr-section-header">
        <h3 className="dr-section-title">{title}</h3>
        {action && <span className="dr-section-action">{action}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function DataRow({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="dr-datarow">
      <span className="dr-datarow-label">{label}</span>
      <span className="dr-datarow-val" data-mono={mono}>{value ?? "—"}</span>
    </div>
  );
}

function CheckItem({ label, value, critical }: { label: string; value: boolean; critical?: boolean }) {
  return (
    <div className="dr-checkitem">
      <span className="dr-checkitem-label">
        {critical && <span className="dr-checkitem-crit-icon">⚡</span>}
        {label}
      </span>
      <span className="dr-checkitem-badge" data-ok={value}>{value ? "✓ OK" : "✗ Fallo"}</span>
    </div>
  );
}

function TempBadge({ temp, min, max }: { temp: number; min?: number; max?: number }) {
  const fuera = (min !== undefined && temp < min) || (max !== undefined && temp > max);
  return (
    <span className="dr-temp-badge" data-fuera={fuera}>
      {temp}°C{fuera && <span className="dr-temp-warn">⚠</span>}
    </span>
  );
}

// ── Tarjeta de lote
function LoteCard({ lote, expanded, onToggle }: {
  lote: LoteRecibido; expanded: boolean; onToggle: () => void;
}) {
  const dias      = diasParaVencer(lote.fechaVencimiento);
  const diasColor = dias === null ? "#64748B" : dias <= 7 ? "#FCA5A5" : dias <= 15 ? "#FCD34D" : "#86EFAC";

  return (
    <div className="dr-lote-card">
      <div className="dr-lote-header" onClick={onToggle} role="button" aria-expanded={expanded}>
        <p className="dr-lote-num">{lote.numeroLoteInterno}</p>
        <p className="dr-lote-item">{lote.itemNombre}</p>
        {dias !== null && (
          <span className="dr-lote-venc" style={{ color: diasColor }}>
            {dias > 0 ? `${dias}d` : `Vencido`}
          </span>
        )}
        <svg className="dr-lote-chevron" data-open={expanded} width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {/* Detalle en dos columnas */}
          <div className="dr-lote-body">
            <div className="dr-lote-detail-col">
              {[
                ["Lote proveedor",  lote.numeroLoteProveedor],
                ["Fabricación",     formatDate(lote.fechaFabricacion)],
                ["Vencimiento",     formatDate(lote.fechaVencimiento)],
                ["Cantidad",        `${lote.cantidadRecibida} ${lote.unidadMedida}`],
              ].map(([k, v]) => (
                <div key={k} className="dr-lote-kv">
                  <span className="dr-lote-k">{k}</span>
                  <span className="dr-lote-v">{v ?? "—"}</span>
                </div>
              ))}
            </div>
            <div className="dr-lote-detail-col">
              {[
                ["Sensorial",   lote.estadoSensorial],
                ["Rotulado",    lote.estadoRotulado],
                ["Destino",     lote.ubicacionDestino === 0 ? "Almacén" : "Cuarentena"],
                ["Temperatura", lote.temperaturaMedida !== undefined ? `${lote.temperaturaMedida}°C` : "N/A"],
              ].map(([k, v]) => (
                <div key={k} className="dr-lote-kv">
                  <span className="dr-lote-k">{k}</span>
                  <span className="dr-lote-v">{v ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documentos del lote */}
          <div className="dr-lote-docs">
            <p className="dr-lote-docs-title">Documentos ({lote.documentos.length})</p>
            {lote.documentos.length === 0
              ? <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Sin documentos adjuntos</p>
              : lote.documentos.map(d => (
                  <a key={d.id} href={d.urlDescarga} className="dr-doc-link" target="_blank" rel="noreferrer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="dr-doc-link-text">
                      {TipoDocumentoLabels[d.tipoDocumento as TipoDocumento]}
                    </span>
                  </a>
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────

export default function DetalleRecepcionPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [recepcion,     setRecepcion]     = useState<RecepcionDetalle | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [expandedLotes, setExpandedLotes] = useState<Set<string>>(new Set());
  const [activeTab,     setActiveTab]     = useState<"lotes" | "inspeccion" | "documentos" | "temperaturas">("lotes");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = isMock ? MOCK_DETALLE : await recepcionesService.getById(id!);
        setRecepcion(data);
      } catch { setError("No se pudo cargar el detalle de la recepción."); }
      finally   { setLoading(false); }
    };
    load();
  }, [id]);

  const toggleLote = (loteId: string) =>
    setExpandedLotes(prev => {
      const next = new Set(prev);
      next.has(loteId) ? next.delete(loteId) : next.add(loteId);
      return next;
    });

  if (loading) return (
    <div className="dr-state-center">
      <svg className="dr-spin" width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      <p className="dr-loading-text">Cargando recepción…</p>
    </div>
  );

  if (error || !recepcion) return (
    <div className="dr-state-center">
      <p className="dr-error-text">{error ?? "Recepción no encontrada."}</p>
      <button className="dr-back-link" onClick={() => navigate(ROUTES.RECEPCIONES)}>
        Volver a recepciones
      </button>
    </div>
  );

  const cfg  = ESTADO_CFG[recepcion.estado];
  const TABS = [
    { key: "lotes",        label: `Lotes (${recepcion.lotes.length})` },
    { key: "inspeccion",   label: "Inspección vehículo" },
    { key: "documentos",   label: `Documentos (${recepcion.documentos.length})` },
    { key: "temperaturas", label: `Temperaturas (${recepcion.temperaturas.length})` },
  ] as const;

  return (
    <div className="dr-page">

      {/* ── Encabezado ── */}
      <div className="dr-header">
        <button className="dr-back-btn" onClick={() => navigate(ROUTES.RECEPCIONES)} aria-label="Volver">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="dr-header-meta">
          <p className="dr-oc-label">
            {recepcion.ordenCompraNumero}
            <span className="dr-estado-badge" style={{ background: cfg.bg, color: cfg.color }}>
              <span className="dr-badge-dot" style={{ background: cfg.dot }} />
              {cfg.label}
            </span>
          </p>
          <h1 className="dr-title">{recepcion.numeroRecepcion}</h1>
          <p className="dr-subtitle">{recepcion.proveedorNombre}</p>
        </div>
      </div>

      {/* ── Datos generales ── */}
      <div className="dr-data-grid">
        <Section title="Datos de la recepción">
          <DataRow label="Fecha"         value={formatDate(recepcion.fechaRecepcion)} />
          <DataRow label="Hora llegada"  value={recepcion.horaLlegadaVehiculo?.slice(0, 5)} mono />
          <DataRow label="Placa"         value={recepcion.placaVehiculo} mono />
          <DataRow label="Transportista" value={recepcion.nombreTransportista} />
          {recepcion.observacionesGenerales && (
            <div className="dr-obs-box">
              <p className="dr-obs-label">Observaciones</p>
              <p className="dr-obs-text">{recepcion.observacionesGenerales}</p>
            </div>
          )}
        </Section>

        <Section title="Resumen de lotes">
          <DataRow label="Total lotes" value={recepcion.totalLotes} />
          <DataRow label="Liberados"   value={<span style={{ color: "#86EFAC" }}>{recepcion.lotesLiberados}</span>} />
          <DataRow label="Rechazados"  value={
            <span style={{ color: recepcion.lotesRechazados > 0 ? "#FCA5A5" : "#64748B" }}>
              {recepcion.lotesRechazados}
            </span>
          } />
          <DataRow label="Pendientes"  value={recepcion.totalLotes - recepcion.lotesLiberados - recepcion.lotesRechazados} />
          <div className="dr-lotes-bar-wrap">
            <div className="dr-lotes-bar-track">
              {recepcion.lotesLiberados > 0 && (
                <div className="dr-lotes-liberados"
                  style={{ width: `${(recepcion.lotesLiberados / recepcion.totalLotes) * 100}%` }} />
              )}
              {recepcion.lotesRechazados > 0 && (
                <div className="dr-lotes-rechazados"
                  style={{ width: `${(recepcion.lotesRechazados / recepcion.totalLotes) * 100}%` }} />
              )}
            </div>
          </div>
        </Section>
      </div>

      {/* ── Tabs ── */}
      <div className="dr-tabs">
        {TABS.map(t => (
          <button key={t.key} className="dr-tab" data-active={activeTab === t.key}
            onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LOTES ── */}
      {activeTab === "lotes" && (
        <Section title={`Lotes recibidos (${recepcion.lotes.length})`}
          action={
            <button className="dr-section-action" onClick={() => {
              if (expandedLotes.size === recepcion.lotes.length) {
                setExpandedLotes(new Set());
              } else {
                setExpandedLotes(new Set(recepcion.lotes.map(l => l.id)));
              }
            }}>
              {expandedLotes.size === recepcion.lotes.length ? "Colapsar todo" : "Expandir todo"}
            </button>
          }>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.75rem 1rem" }}>
            {recepcion.lotes.map(lote => (
              <LoteCard key={lote.id} lote={lote}
                expanded={expandedLotes.has(lote.id)}
                onToggle={() => toggleLote(lote.id)} />
            ))}
          </div>
        </Section>
      )}

      {/* ── INSPECCIÓN ── */}
      {activeTab === "inspeccion" && (
        <Section title="Inspección del vehículo BPM">
          {recepcion.inspeccionVehiculo ? (
            <>
              {recepcion.inspeccionVehiculo.temperaturaInicial !== undefined && (
                <div className="dr-temp-inicial">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2v20M12 2l-4 4M12 2l4 4" />
                  </svg>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Temperatura inicial del compartimento</span>
                  <span className="dr-temp-inicial-val">{recepcion.inspeccionVehiculo.temperaturaInicial}°C</span>
                </div>
              )}
              <CheckItem label="Temperatura dentro de rango" value={recepcion.inspeccionVehiculo.temperaturaDentroRango} critical />
              <CheckItem label="Integridad de empaque"        value={recepcion.inspeccionVehiculo.integridadEmpaque} />
              <CheckItem label="Limpieza del vehículo"        value={recepcion.inspeccionVehiculo.limpiezaVehiculo} />
              <CheckItem label="Sin olores extraños"          value={!recepcion.inspeccionVehiculo.presenciaOloresExtranos} />
              <CheckItem label="Sin evidencia de plagas"      value={!recepcion.inspeccionVehiculo.plagasVisible} />
              <CheckItem label="Documentos de transporte OK"  value={recepcion.inspeccionVehiculo.documentosTransporteOk} />
              {recepcion.inspeccionVehiculo.observaciones && (
                <div className="dr-obs-box">
                  <p className="dr-obs-label">Observaciones</p>
                  <p className="dr-obs-text">{recepcion.inspeccionVehiculo.observaciones}</p>
                </div>
              )}
              <DataRow label="Registrado" value={formatDateTime(recepcion.inspeccionVehiculo.fechaRegistro)} />
            </>
          ) : (
            <div className="dr-tab-empty">Inspección aún no registrada.</div>
          )}
        </Section>
      )}

      {/* ── DOCUMENTOS ── */}
      {activeTab === "documentos" && (
        <Section title="Documentos de la recepción">
          {recepcion.documentos.length === 0
            ? <div className="dr-tab-empty">Sin documentos adjuntos para esta recepción.</div>
            : (
              <div style={{ padding: "0.875rem 1rem" }}>
                <div className="dr-doc-list">
                  {recepcion.documentos.map(doc => (
                    <div key={doc.id} className="dr-doc-card">
                      <div className="dr-doc-icon"
                        style={{ background: "rgba(245,158,11,0.08)", color: "#F59E0B" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="dr-doc-info">
                        <p className="dr-doc-tipo">{TipoDocumentoLabels[doc.tipoDocumento as TipoDocumento]}</p>
                        <p className="dr-doc-meta">{formatDate(doc.fechaCarga)}</p>
                      </div>
                      <a href={doc.urlDescarga} className="dr-doc-dl-btn" target="_blank" rel="noreferrer">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Descargar
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </Section>
      )}

      {/* ── TEMPERATURAS ── */}
      {activeTab === "temperaturas" && (
        <Section title="Registros de temperatura">
          {recepcion.temperaturas.length === 0
            ? <div className="dr-tab-empty">Sin registros de temperatura para esta recepción.</div>
            : (
              <div style={{ padding: "0.875rem 1rem" }}>
                <div className="dr-temp-list">
                  {recepcion.temperaturas.map(t => (
                    <div key={t.id} className="dr-temp-card" data-fuera={t.estaFueraDeRango}>

                      {/* Valor de temperatura */}
                      <span
                        className="dr-temp-card-val"
                        data-fuera={t.estaFueraDeRango}
                      >
                        {t.temperatura}
                        <span style={{ fontSize: "var(--text-xs)", marginLeft: "2px" }}>
                          {t.unidadMedida}
                        </span>
                        {t.estaFueraDeRango && (
                          <span className="dr-temp-warn"> ⚠</span>
                        )}
                      </span>

                      {/* Info contextual */}
                      <div className="dr-temp-card-info">
                        {t.itemNombre
                          ? <p className="dr-temp-item-name">{t.itemNombre}</p>
                          : t.loteNumero
                            ? <p className="dr-temp-item-name">Lote: {t.loteNumero}</p>
                            : <p className="dr-temp-item-name" style={{ color: "var(--text-muted)" }}>Sin ítem asociado</p>
                        }
                        <p className="dr-temp-meta">
                          {ORIGEN_LABELS[t.origen] ?? "Manual"} · {formatDateTime(t.fechaRegistro)}
                        </p>
                        {t.observacion && (
                          <p className="dr-temp-meta" style={{ marginTop: "0.125rem", color: "#94A3B8" }}>
                            {t.observacion}
                          </p>
                        )}
                      </div>

                      {/* Indicador fuera de rango */}
                      {t.estaFueraDeRango && (
                        <span className="dr-temp-rango" style={{ color: "#FCA5A5" }}>
                          Fuera de rango
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </Section>
      )}
    </div>
  );
}