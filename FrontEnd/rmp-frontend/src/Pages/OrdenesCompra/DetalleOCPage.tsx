import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ordenesCompraService,
  type OrdenCompra,
  EstadoOC, EstadoOCLabels,
} from "../../Services/ordenes-compra.service";
import { Button } from "../../Components/UI/Index";
import { formatDate, formatCOP } from "../../Utils/formatters";
import { MOCK_OC_DETALLE } from "./MockData";
import "./StylesOC/DetalleOCPage.css";

const isMock = import.meta.env.VITE_USE_MOCK === "true";

import { DateField, TextAreaField} from "../../Components/Forms/Index";

// ── helpers
function isVencida(fecha?: string) { return !!fecha && new Date(fecha) < new Date(); }

// ── config visual
const ESTADO_CFG: Record<EstadoOC, { color: string; bg: string; dot: string }> = {
  [EstadoOC.Abierta]:              { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",   dot: "#22C55E" },
  [EstadoOC.ParcialmenteRecibida]: { color: "#FCD34D", bg: "rgba(245,158,11,0.08)",  dot: "#F59E0B" },
  [EstadoOC.TotalmenteRecibida]:   { color: "#93C5FD", bg: "rgba(59,130,246,0.08)",  dot: "#3B82F6" },
  [EstadoOC.Cerrada]:              { color: "#94A3B8", bg: "rgba(100,116,139,0.08)", dot: "#64748B" },
  [EstadoOC.Cancelada]:            { color: "#94A3B8", bg: "rgba(100,116,139,0.06)", dot: "#475569" },
  [EstadoOC.Vencida]:              { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",   dot: "#EF4444" },
};

// ── badge estado
function EstadoBadge({ estado }: { estado: EstadoOC }) {
  const c = ESTADO_CFG[estado];
  return (
    <span className="ocd-badge" style={{ background: c.bg, color: c.color }}>
      <span className="ocd-badge-dot" style={{ background: c.dot }} />
      {EstadoOCLabels[estado].toUpperCase()}
    </span>
  );
}

// ── sección card
function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="ocd-section">
      <div className="ocd-section-header">
        <h3 className="ocd-section-title">{title}</h3>
        {action}
      </div>
      <div className="ocd-section-body">{children}</div>
    </div>
  );
}

// ── fila de datos
function DataRow({ label, val, mono }: { label: string; val: React.ReactNode; mono?: boolean }) {
  return (
    <div className="ocd-datarow">
      <p className="ocd-datarow-label">{label}</p>
      <div className="ocd-datarow-val" style={ mono ? { fontFamily: "var(--font-mono)" } : undefined }>{val}</div>
    </div>
  );
}

// ── PÁGINA ────────────────────────────────────────────────────────────────────

export default function DetalleOCPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [oc,      setOc]      = useState<OrdenCompra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tab,     setTab]     = useState<"items" | "recepciones">("items");
  const [saving,         setSaving]         = useState(false);
  const [showEditar,     setShowEditar]     = useState(false);
  const [showCancelar,   setShowCancelar]   = useState(false);
  const [showEliminar,   setShowEliminar]   = useState(false);
  const [motivo,         setMotivo]         = useState("");
  const [formEdit,       setFormEdit]       = useState({
    fechaEntregaEsperada: oc?.fechaEntregaEsperada ?? "",
    observaciones:        oc?.observaciones ?? "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const data = isMock ? MOCK_OC_DETALLE as OrdenCompra : await ordenesCompraService.getById(id!);
        setOc(data);
      } catch { setError("No se pudo cargar la orden de compra."); }
      finally   { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="ocd-state-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"
        style={{ animation: "spin 0.8s linear infinite" }}>
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p className="ocd-loading-text">Cargando orden de compra…</p>
    </div>
  );

  if (error || !oc) return (
    <div className="ocd-state-center">
      <p className="ocd-error-text">{error ?? "OC no encontrada."}</p>
      <button className="ocd-back-link" onClick={() => navigate("/ordenes-compra")}>
        Volver a órdenes de compra
      </button>
    </div>
  );

  // datos derivados
  const cerrada      = oc.estado === EstadoOC.Cerrada || oc.estado === EstadoOC.Cancelada;
  const vencida      = isVencida(oc.fechaVencimiento);
  const totalSolicitado = oc.detalles.reduce((s, d) => s + d.cantidadSolicitada, 0);
  const totalRecibido   = oc.detalles.reduce((s, d) => s + d.cantidadRecibida,   0);
  const totalPendiente  = oc.detalles.reduce((s, d) => s + d.cantidadPendiente,  0);
  const totalValor      = oc.detalles.reduce((s, d) => s + d.subtotal,            0);
  const pct = totalSolicitado > 0 ? Math.round((totalRecibido / totalSolicitado) * 100) : 0;
  const handleActualizar = async () => {
    setSaving(true);
    try {
      await ordenesCompraService.actualizar(oc!.id, {
        fechaEntregaEsperada: formEdit.fechaEntregaEsperada || undefined,
        observaciones:        formEdit.observaciones || undefined,
      });
      setOc(prev => prev ? {
        ...prev,
        fechaEntregaEsperada: formEdit.fechaEntregaEsperada || undefined,
        observaciones:        formEdit.observaciones || undefined,
      } : prev);
      setShowEditar(false);
    } finally { setSaving(false); }
  };

  const handleCancelar = async () => {
    if (!motivo.trim()) return;
    setSaving(true);
    try {
      await ordenesCompraService.cancelar(oc!.id, motivo);
      setOc(prev => prev ? { ...prev, estado: EstadoOC.Cancelada } : prev);
      setShowCancelar(false);
      setMotivo("");
    } finally { setSaving(false); }
  };

  const handleEliminar = async () => {
    setSaving(true);
    try {
      await ordenesCompraService.eliminar(oc!.id);
      setTimeout(() => navigate("/ordenes-compra"), 1200);
    } finally { setSaving(false); }
  };

  return (
    <div className="ocd-page">

      {/* ── ENCABEZADO ── */}
      <div className="ocd-header">
        <button className="ocd-back-btn" onClick={() => navigate("/ordenes-compra")} aria-label="Volver">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="ocd-header-meta">
          <p className="ocd-numero-label">
            {oc.numeroOC}
            {oc.requiereCadenaFrio && (
              <span style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)",
                padding: "0.125rem 0.5rem", borderRadius: "var(--radius-sm)",
                background: "rgba(59,130,246,0.08)", color: "#93C5FD" }}>
                ❄ cadena frío
              </span>
            )}
          </p>
          <h1 className="ocd-title">{oc.proveedorNombre}</h1>
          <p className="ocd-subtitle">{oc.proveedorNit}</p>
        </div>
        <div className="ocd-header-actions">
          <EstadoBadge estado={oc.estado} />
          {!cerrada && (
            <>
              <Button variant="ghost" size="sm"
                onClick={() => {
                  setFormEdit({
                    fechaEntregaEsperada: oc.fechaEntregaEsperada ?? "",
                    observaciones:        oc.observaciones ?? "",
                  });
                  setShowEditar(true);
                }}>
                Editar
              </Button>
              <Button variant="danger" size="sm"
                onClick={() => setShowCancelar(true)}>
                Cancelar OC
              </Button>
            </>
          )}
          {oc.estado === EstadoOC.Abierta && oc.recepciones.length === 0 && (
            <Button variant="ghost" size="sm"
              onClick={() => setShowEliminar(true)}
              style={{ color: "#FCA5A5", borderColor: "rgba(239,68,68,0.3)" }}>
              Eliminar
            </Button>
          )}
          {!cerrada && (
            <Button variant="primary" size="sm"
              onClick={() => navigate(`/recepciones/nueva?ocId=${oc.id}`)}
              iconLeft="M12 5v14M5 12h14">
              Iniciar recepción
            </Button>
          )}
        </div>
      </div>

      {/* ── BARRA PROGRESO HERO ── */}
      <div className="ocd-progress-card">
        <div className="ocd-progress-header">
          <p className="ocd-progress-label">Progreso de recepción</p>
          <p className="ocd-progress-pct" style={{ color: pct === 100 ? "#86EFAC" : "#F59E0B" }}>
            {pct}% — {totalRecibido.toLocaleString()} / {totalSolicitado.toLocaleString()} uds
          </p>
        </div>
        <div className="ocd-progress-track">
          <div className="ocd-progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? "#22C55E" : "#F59E0B" }} />
        </div>
        <div className="ocd-progress-stats">
          {[
            { label: "Valor total",    val: formatCOP(oc.valorTotal),                             color: "#CBD5E1" },
            { label: "Pendiente",      val: `${totalPendiente.toLocaleString()} uds`,              color: totalPendiente > 0 ? "#FCD34D" : "#86EFAC" },
            { label: "Entrega esp.",   val: formatDate(oc.fechaEntregaEsperada),                   color: "#94A3B8" },
          ].map(k => (
            <div key={k.label} className="ocd-stat-mini">
              <p className="ocd-stat-mini-val" style={{ color: k.color }}>{k.val}</p>
              <p className="ocd-stat-mini-label">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── GRID 1+2 ── */}
      <div className="ocd-grid">

        {/* Columna izquierda — info OC */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Section title="Información general">
            <DataRow label="N.° OC"            val={<span style={{ fontFamily: "var(--font-mono)" }}>{oc.numeroOC}</span>} />
            <DataRow label="Proveedor"          val={oc.proveedorNombre} />
            <DataRow label="NIT"                val={oc.proveedorNit} mono />
            <DataRow label="Fecha emisión"      val={formatDate(oc.fechaEmision)} />
            <DataRow label="Entrega esperada"   val={formatDate(oc.fechaEntregaEsperada)} />
            <DataRow label="Vencimiento"
              val={oc.fechaVencimiento
                ? <span style={{ color: vencida ? "#FCA5A5" : "#94A3B8" }}>{formatDate(oc.fechaVencimiento)}</span>
                : "—"
              }
            />
            <DataRow label="Creado por"         val={oc.creadoPorNombre} />
            <DataRow label="Aprobado por"       val={oc.aprobadoPor ?? "Pendiente"} />
            <DataRow label="Creado el"   val={formatDate(oc.creadoEn)} />
          </Section>

          {oc.observaciones && (
            <div className="ocd-notas-box"
              style={{ margin: 0, borderRadius: "var(--radius-xl)" }}>
              <p className="ocd-notas-label">Observaciones</p>
              <p className="ocd-notas-texto">{oc.observaciones}</p>
            </div>
          )}
        </div>

        {/* Columna derecha — tabs */}
        <div className="ocd-tabs-col">
          <div className="ocd-tabs">
            {([
              { key: "items",       label: `Ítems (${oc.detalles.length})` },
              { key: "recepciones", label: `Recepciones (${oc.recepciones.length})` },
            ] as const).map(t => (
              <button key={t.key} className="ocd-tab" data-active={tab === t.key}
                onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB ÍTEMS */}
          {tab === "items" && (
            <div className="ocd-items-table">
              {/* Cabecera */}
              <div className="ocd-items-header-row">
                {["Ítem", "Solicitado", "Recibido", "Pendiente", "Precio unit.", "Subtotal"].map(h => (
                  <p key={h} className="ocd-items-th">{h}</p>
                ))}
              </div>

              {/* Filas */}
              {oc.detalles.map(det => (
                <div key={det.id} className="ocd-item-row">
                  {/* Ítem */}
                  <div>
                    <p className="ocd-item-nombre">{det.itemNombre}</p>
                    <p className="ocd-item-codigo">{det.itemCodigo}</p>
                    <p className="ocd-item-cat">{det.categoriaNombre}</p>
                    {det.requiereCadenaFrio && (
                      <span className="ocd-frio-tag">❄ {det.temperaturaMinima}°–{det.temperaturaMaxima}°C</span>
                    )}
                  </div>
                  {/* Solicitado */}
                  <p className="ocd-cell-num" style={{ color: "#CBD5E1" }}>
                    {det.cantidadSolicitada.toLocaleString()}
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: "0.25rem" }}>
                      {det.unidadMedida}
                    </span>
                  </p>
                  {/* Recibido */}
                  <p className="ocd-cell-num" style={{ color: det.cantidadRecibida > 0 ? "#86EFAC" : "var(--text-tertiary)" }}>
                    {det.cantidadRecibida.toLocaleString()}
                  </p>
                  {/* Pendiente */}
                  <p className="ocd-cell-num" style={{ color: det.cantidadPendiente > 0 ? "#FCD34D" : "var(--text-tertiary)" }}>
                    {det.cantidadPendiente.toLocaleString()}
                  </p>
                  {/* Precio */}
                  <p className="ocd-cell-price">{formatCOP(det.precioUnitario)}</p>
                  {/* Subtotal */}
                  <p className="ocd-cell-sub">{formatCOP(det.subtotal)}</p>
                </div>
              ))}

              {/* Totales */}
              <div className="ocd-totals-row">
                <p className="ocd-totals-label">TOTALES</p>
                <p className="ocd-cell-num" style={{ color: "#CBD5E1", fontWeight: 700 }}>{totalSolicitado.toLocaleString()}</p>
                <p className="ocd-cell-num" style={{ color: "#86EFAC", fontWeight: 700 }}>{totalRecibido.toLocaleString()}</p>
                <p className="ocd-cell-num" style={{ color: totalPendiente > 0 ? "#FCD34D" : "var(--text-tertiary)", fontWeight: 700 }}>
                  {totalPendiente.toLocaleString()}
                </p>
                <p className="ocd-cell-price">—</p>
                <p style={{ fontSize: "var(--text-md)", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary)" }}>
                  {formatCOP(totalValor)}
                </p>
              </div>
            </div>
          )}

          {/* TAB RECEPCIONES */}
          {tab === "recepciones" && (
            oc.recepciones.length === 0
              ? (
                <div className="ocd-tab-empty">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h6a2 2 0 000-4M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="ocd-tab-empty-text">Sin recepciones registradas para esta OC.</p>
                  {!cerrada && (
                    <Button variant="secondary" size="sm"
                      onClick={() => navigate(`/recepciones/nueva?ocId=${oc.id}`)}
                      iconLeft="M12 5v14M5 12h14">
                      Iniciar recepción para esta OC
                    </Button>
                  )}
                </div>
              )
              : (
                <div className="ocd-rec-list">
                  {oc.recepciones.map(rec => (
                    <a key={rec.id} className="ocd-rec-card" href={`/recepciones/${rec.id}`}>
                      <div>
                        <p className="ocd-rec-num">{rec.numeroRecepcion}</p>
                        <p className="ocd-rec-fecha">{formatDate(rec.fechaRecepcion)}</p>
                      </div>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)"
                        strokeWidth="2" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </a>
                  ))}
                </div>
              )
          )}
        </div>

      </div>
      {/* ── MODAL EDITAR ── */}
      {showEditar && (
        <div className="ocd-modal-overlay" onClick={() => setShowEditar(false)}>
          <div className="ocd-modal" onClick={e => e.stopPropagation()}>
            <p className="ocd-modal-title">Editar orden de compra</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
              <DateField label="Fecha entrega esperada"
                value={formEdit.fechaEntregaEsperada}
                onChange={e => setFormEdit(p => ({ ...p, fechaEntregaEsperada: e.target.value }))} />
              <TextAreaField label="Observaciones" rows={3}
                value={formEdit.observaciones}
                onChange={e => setFormEdit(p => ({ ...p, observaciones: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
              <button onClick={() => setShowEditar(false)} className="ocd-modal-btn-sec">
                Cancelar
              </button>
              <button onClick={handleActualizar} disabled={saving} className="ocd-modal-btn-pri">
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CANCELAR ── */}
      {showCancelar && (
        <div className="ocd-modal-overlay" onClick={() => setShowCancelar(false)}>
          <div className="ocd-modal" onClick={e => e.stopPropagation()}>
            <p className="ocd-modal-title">Cancelar orden de compra</p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Esta acción cambiará el estado a Cancelada. Ingresa el motivo.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <TextAreaField label="Motivo *" rows={3}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Ej: Proveedor no disponible, cambio de requerimientos…" />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
              <button onClick={() => { setShowCancelar(false); setMotivo(""); }} className="ocd-modal-btn-sec">
                Volver
              </button>
              <button onClick={handleCancelar} disabled={saving || !motivo.trim()}
                style={{ opacity: !motivo.trim() ? 0.5 : 1 }}
                className="ocd-modal-btn-danger">
                {saving ? "Cancelando…" : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ELIMINAR ── */}
      {showEliminar && (
        <div className="ocd-modal-overlay" onClick={() => setShowEliminar(false)}>
          <div className="ocd-modal" onClick={e => e.stopPropagation()}>
            <p className="ocd-modal-title">Eliminar orden de compra</p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Se eliminará permanentemente <strong style={{ color: "var(--text-primary)" }}>{oc.numeroOC}</strong>.
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
              <button onClick={() => setShowEliminar(false)} className="ocd-modal-btn-sec">
                Cancelar
              </button>
              <button onClick={handleEliminar} disabled={saving} className="ocd-modal-btn-danger">
                {saving ? "Eliminando…" : "Eliminar definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}