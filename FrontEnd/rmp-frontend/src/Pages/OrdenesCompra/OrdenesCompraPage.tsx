import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ordenesCompraService,
  type OrdenCompraResumen,
  type DetalleOC,
  EstadoOC, EstadoOCLabels,
  type CrearOCCommand,
} from "../../Services/ordenes-compra.service";
import {
  proveedoresService, itemsService,
  type ProveedorResumen, type ItemResumen,
} from "../../Services/maestros.service";
import { Button, Modal, ModalFooter } from "../../Components/UI/Index";
import { SelectField, DateField, NumberField, TextAreaField } from "../../Components/Forms/Index";
import { formatDate, formatCOP } from "../../Utils/formatters";
import { MOCK_OC_TODAS } from "./MockData";
import { MOCK_PROVEEDORES_LIST, MOCK_ITEMS_LIST } from "../Maestros/MockData";
import "./StylesOC/OrdenesCompraPage.css";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

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

// badge estado
function EstadoBadge({ estado }: { estado: EstadoOC }) {
  const c = ESTADO_CFG[estado];
  return (
    <span className="oc-state-badge" style={{ background: c.bg, color: c.color }}>
      <span className="oc-state-dot" style={{ background: c.dot }} />
      {EstadoOCLabels[estado].toUpperCase()}
    </span>
  );
}

// barra progreso inline
function ProgresoMini({ oc }: { oc: OrdenCompraResumen }) {
  const solicitado = oc.detalles.reduce((s, d) => s + d.cantidadSolicitada, 0);
  const recibido   = oc.detalles.reduce((s, d) => s + d.cantidadRecibida,   0);
  const pct = solicitado > 0 ? Math.round((recibido / solicitado) * 100) : 0;
  return (
    <div className="oc-row-bar-wrap">
      <div className="oc-row-bar-fill"
        style={{ width: `${pct}%`, background: pct === 100 ? "#22C55E" : "#F59E0B" }} />
    </div>
  );
}

// ── FILA OC ──────────────────────────────────────────────────────────────────

function OCRow({ oc, active, onClick }: { oc: OrdenCompraResumen; active: boolean; onClick: () => void }) {
  return (
    <button className="oc-row" data-active={active} onClick={onClick}>
      <div className="oc-row-top">
        <span className="oc-row-num">{oc.numeroOC}</span>
        <EstadoBadge estado={oc.estado} />
      </div>
      <p className="oc-row-prov">{oc.proveedorNombre}</p>
      <div className="oc-row-bottom">
        <span className="oc-row-meta">Emisión: {formatDate(oc.fechaEmision)}</span>
        {oc.fechaEntregaEsperada && <span className="oc-row-meta">Entrega: {formatDate(oc.fechaEntregaEsperada)}</span>}
        <span className="oc-row-meta" style={{ marginLeft: "auto" }}>{formatCOP(oc.valorTotal)}</span>
      </div>
      <ProgresoMini oc={oc} />
    </button>
  );
}

// ── PANEL RESUMEN ─────────────────────────────────────────────────────────────

function PanelResumen({ oc, onVerDetalle, onClose }: {
  oc: OrdenCompraResumen; onVerDetalle: () => void; onClose: () => void;
}) {
  const solicitado = oc.detalles.reduce((s, d) => s + d.cantidadSolicitada, 0);
  const recibido   = oc.detalles.reduce((s, d) => s + d.cantidadRecibida,   0);
  const pendiente  = oc.detalles.reduce((s, d) => s + d.cantidadPendiente,  0);
  const pct = solicitado > 0 ? Math.round((recibido / solicitado) * 100) : 0;

  return (
    <>
      {/* Header */}
      <div className="oc-panel-header">
        <div className="oc-panel-info">
          <p className="oc-panel-num">{oc.numeroOC}</p>
          <p className="oc-panel-prov">{oc.proveedorNombre}</p>
          <p className="oc-panel-nit">{oc.proveedorNit}</p>
          <div className="oc-panel-badges">
            <EstadoBadge estado={oc.estado} />
            {oc.requiereCadenaFrio && (
              <span style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", padding: "0.125rem 0.5rem",
                borderRadius: "var(--radius-sm)", background: "rgba(59,130,246,0.08)", color: "#93C5FD" }}>
                ❄ cadena frío
              </span>
            )}
          </div>
        </div>
        <button className="oc-panel-close" onClick={onClose} aria-label="Cerrar panel">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progreso */}
      <div className="oc-panel-progress">
        <div className="oc-progress-header">
          <p className="oc-progress-label">Progreso de recepción</p>
          <p className="oc-progress-pct" style={{ color: pct === 100 ? "#86EFAC" : "#F59E0B" }}>
            {pct}% — {recibido.toLocaleString()} / {solicitado.toLocaleString()} uds
          </p>
        </div>
        <div className="oc-progress-track">
          <div className="oc-progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? "#22C55E" : "#F59E0B" }} />
        </div>
      </div>

      {/* KPI mini */}
      <div className="oc-panel-kpis">
        <div className="oc-kpi-mini-grid">
          {[
            { label: "Valor total",  val: formatCOP(oc.valorTotal),              color: "#CBD5E1" },
            { label: "Pendiente",    val: `${pendiente.toLocaleString()} uds`,   color: pendiente > 0 ? "#FCD34D" : "#86EFAC" },
            { label: "Entrega esp.", val: formatDate(oc.fechaEntregaEsperada),   color: "#94A3B8" },
          ].map(k => (
            <div key={k.label} className="oc-kpi-mini">
              <p className="oc-kpi-mini-val" style={{ color: k.color }}>{k.val}</p>
              <p className="oc-kpi-mini-label">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ítems */}
      <div className="oc-panel-items">
        <p className="oc-panel-items-title">Ítems ({oc.totalItems})</p>
        {oc.detalles.map((det: DetalleOC) => {
          const pctDet = det.cantidadSolicitada > 0
            ? Math.round((det.cantidadRecibida / det.cantidadSolicitada) * 100) : 0;
          return (
            <div key={det.id} className="oc-item-card">
              <div className="oc-item-card-top">
                <div>
                  <p className="oc-item-nombre">{det.itemNombre}</p>
                  <p className="oc-item-codigo">{det.itemCodigo}</p>
                </div>
                <span className="oc-item-pct" style={{ color: pctDet === 100 ? "#86EFAC" : "#F59E0B" }}>
                  {pctDet}%
                </span>
              </div>
              <div className="oc-item-bar-track">
                <div className="oc-item-bar-fill"
                  style={{ width: `${pctDet}%`, background: pctDet === 100 ? "#22C55E" : "#F59E0B" }} />
              </div>
              <p className="oc-item-meta">
                {det.cantidadRecibida} / {det.cantidadSolicitada} {det.unidadMedida}
                {det.requiereCadenaFrio && ` ❄ ${det.temperaturaMinima}°–${det.temperaturaMaxima}°C`}
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="oc-panel-cta">
        <button className="oc-ver-detalle-btn" onClick={onVerDetalle}>
          Ver detalle completo
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </>
  );
}

// ── MODAL NUEVA OC ─────────────────────────────────────────────────────────────

interface DetalleForm { itemId: string; cantidad: string; precioUnitario: string; }

function ModalNuevaOC({ proveedores, items, onClose, onCreada }: {
  proveedores: ProveedorResumen[];
  items: ItemResumen[];
  onClose: () => void;
  onCreada: (oc: OrdenCompraResumen) => void;
}) {
  const [proveedorId,   setProveedorId]   = useState("");
  const [fechaEntrega,  setFechaEntrega]  = useState("");
  const [notas,         setNotas]         = useState("");
  const [detalles,      setDetalles]      = useState<DetalleForm[]>([{ itemId: "", cantidad: "", precioUnitario: "" }]);
  const [saving,        setSaving]        = useState(false);

  const addDetalle    = () => setDetalles(p => [...p, { itemId: "", cantidad: "", precioUnitario: "" }]);
  const removeDetalle = (idx: number) => setDetalles(p => p.filter((_, i) => i !== idx));
  const updDetalle    = (idx: number, k: keyof DetalleForm, v: string) =>
    setDetalles(p => p.map((d, i) => i === idx ? { ...d, [k]: v } : d));

  const provOptions = proveedores.map(p => ({ value: p.id, label: `${p.razonSocial} — ${p.nit}` }));
  const itemOptions = items.map(i => ({ value: i.id, label: `${i.codigo} · ${i.nombre}` }));

  const valid = proveedorId && detalles.every(d => d.itemId && Number(d.cantidad) > 0 && Number(d.precioUnitario) > 0);

  const handleCrear = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const cmd: CrearOCCommand = {
        proveedorId,
        fechaEntregaEsperada: fechaEntrega || undefined,
        notas: notas || undefined,
        detalles: detalles.map(d => ({
          itemId: d.itemId,
          cantidadSolicitada: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
        })),
      };
      let oc: OrdenCompraResumen;
      if (isMock) {
        await new Promise(r => setTimeout(r, 700));
        const prov = proveedores.find(p => p.id === proveedorId)!;
        oc = {
          id: `oc-${Date.now()}`, numeroOC: `OC-2026-${Date.now()}`,
          proveedorId, proveedorNombre: prov.razonSocial, proveedorNit: prov.nit,
          fechaEmision: new Date().toISOString().slice(0, 10),
          fechaEntregaEsperada: fechaEntrega || undefined,
          estado: EstadoOC.Abierta, totalItems: detalles.length,
          valorTotal: detalles.reduce((s, d) => s + Number(d.cantidad) * Number(d.precioUnitario), 0),
          requiereCadenaFrio: false,
          detalles: detalles.map((d, i) => {
            const it = items.find(x => x.id === d.itemId)!;
            return {
              id: `det-${i}`, itemId: d.itemId,
              itemNombre: it?.nombre ?? d.itemId, itemCodigo: it?.codigo ?? "",
              categoriaId: "", categoriaNombre: "",
              cantidadSolicitada: Number(d.cantidad), cantidadRecibida: 0,
              cantidadPendiente: Number(d.cantidad),
              unidadMedida: it?.unidadMedida ?? "UN",
              precioUnitario: Number(d.precioUnitario),
              subtotal: Number(d.cantidad) * Number(d.precioUnitario),
              requiereCadenaFrio: false,
            };
          }),
        };
      } else {
        const { id } = await ordenesCompraService.crear(cmd);
        oc = await ordenesCompraService.getById(id) as unknown as OrdenCompraResumen;
      }
      onCreada(oc);
    } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="Nueva Orden de Compra"
      icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      size="lg"
      footer={<ModalFooter onCancel={onClose} onConfirm={handleCrear} loading={saving} disabled={!valid} confirmLabel="Crear OC" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <SelectField label="Proveedor" required options={provOptions}
            value={proveedorId} onChange={e => setProveedorId(e.target.value)} />
          <DateField label="Fecha de entrega esperada"
            value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} />
        </div>

        {/* Ítems */}
        <div className="oc-detalle-sep">
          <span className="oc-detalle-sep-label">Ítems ({detalles.length})</span>
          <button className="oc-add-item-btn" type="button" onClick={addDetalle}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Agregar ítem
          </button>
        </div>

        <div className="oc-modal-detalle-list">
          {detalles.map((d, idx) => (
            <div key={idx} className="oc-detalle-row">
              <SelectField label={idx === 0 ? "Ítem" : undefined} options={itemOptions}
                required value={d.itemId} onChange={e => updDetalle(idx, "itemId", e.target.value)} />
              <NumberField label={idx === 0 ? "Cantidad" : undefined}
                placeholder="0" min={1}
                value={d.cantidad} onChange={e => updDetalle(idx, "cantidad", e.target.value)} />
              <NumberField label={idx === 0 ? "Precio unitario" : undefined}
                placeholder="0" min={0}
                value={d.precioUnitario} onChange={e => updDetalle(idx, "precioUnitario", e.target.value)} />
              <button className="oc-remove-btn" type="button" onClick={() => removeDetalle(idx)}
                disabled={detalles.length === 1} aria-label="Eliminar ítem">
                ✕
              </button>
            </div>
          ))}
        </div>

        <TextAreaField label="Notas / instrucciones" placeholder="Condiciones de entrega, temperatura requerida…"
          rows={2} value={notas} onChange={e => setNotas(e.target.value)} />
      </div>
    </Modal>
  );
}

// ── PÁGINA ────────────────────────────────────────────────────────────────────

export default function OrdenesCompraPage() {
  const navigate = useNavigate();
  const [lista,       setLista]       = useState<OrdenCompraResumen[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorResumen[]>([]);
  const [items,       setItems]       = useState<ItemResumen[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [showModal,   setShowModal]   = useState(false);
  const [search,          setSearch]          = useState("");
  const [filtroEstado,    setFiltroEstado]    = useState<EstadoOC | "">("");
  const [filtroFrio,      setFiltroFrio]      = useState<"" | "si" | "no">("");

  const cargar = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [ocs, provs, its] = await Promise.all([
        isMock ? Promise.resolve(MOCK_OC_TODAS) : ordenesCompraService.getAll(),
        isMock ? Promise.resolve(MOCK_PROVEEDORES_LIST) : proveedoresService.getAll(),
        isMock ? Promise.resolve(MOCK_ITEMS_LIST)       : itemsService.getAll(),
      ]);
      setLista(ocs); setProveedores(provs); setItems(its);
    } catch { setError("No se pudo cargar las órdenes de compra."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const q = search.toLowerCase();
  const filtradas = lista.filter(oc =>
    (filtroEstado === "" || oc.estado === filtroEstado) &&
    (filtroFrio   === "" || (filtroFrio === "si" ? oc.requiereCadenaFrio : !oc.requiereCadenaFrio)) &&
    (!search || oc.numeroOC.toLowerCase().includes(q) || oc.proveedorNombre.toLowerCase().includes(q) || oc.proveedorNit.includes(q))
  );

  const abiertas    = lista.filter(o => o.estado === EstadoOC.Abierta).length;
  const parciales   = lista.filter(o => o.estado === EstadoOC.ParcialmenteRecibida).length;
  const vencidasCnt = lista.filter(o =>
    isVencida(o.fechaVencimiento) && o.estado !== EstadoOC.Cerrada && o.estado !== EstadoOC.Cancelada && o.estado !== EstadoOC.TotalmenteRecibida
  ).length;

  const selectedOC = lista.find(o => o.id === selectedId) ?? null;
  const estadoOptions = Object.entries(EstadoOCLabels).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div className="oc-page">
      {/* Header */}
      <div className="oc-header">
        <div>
          <p className="oc-breadcrumb">Compras / Módulo</p>
          <h1 className="oc-title">Órdenes de Compra</h1>
        </div>
        <div className="oc-header-right">
          {/* KPI pills */}
          <div className="oc-kpi-pills">
            {[
              { label: "Abiertas",  val: abiertas,    color: "#86EFAC", bg: "rgba(34,197,94,0.06)"  },
              { label: "Parciales", val: parciales,   color: "#FCD34D", bg: "rgba(245,158,11,0.06)" },
              { label: "Vencidas",  val: vencidasCnt, color: "#FCA5A5", bg: "rgba(239,68,68,0.06)"  },
            ].map(k => (
              <div key={k.label} className="oc-kpi-pill" style={{ background: k.bg, borderColor: k.color + "22" }}>
                <p className="oc-kpi-pill-val" style={{ color: k.color }}>{k.val}</p>
                <p className="oc-kpi-pill-label">{k.label}</p>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" loading={loading} onClick={cargar}
            iconLeft="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"
            >Actualizar</Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}
            iconLeft="M12 5v14M5 12h14" >Nueva OC</Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", flexShrink: 0,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          color: "#FCA5A5", fontSize: "var(--text-sm)" }}>
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="oc-filters">
        <div className="oc-search-wrap">
          <svg className="oc-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input className="oc-input oc-input-search" type="text"
            placeholder="Buscar OC, proveedor, NIT…"
            value={search} onChange={e => setSearch(e.target.value)}
            aria-label="Buscar órdenes de compra" />
        </div>
        <select className="oc-select" data-empty={filtroEstado === ""}
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value === "" ? "" : Number(e.target.value) as EstadoOC)}
          aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {estadoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="oc-select" data-empty={filtroFrio === ""}
          value={filtroFrio} onChange={e => setFiltroFrio(e.target.value as any)}
          aria-label="Filtrar por cadena de frío">
          <option value="">Cadena de frío</option>
          <option value="si">Requiere ❄</option>
          <option value="no">Sin cadena de frío</option>
        </select>
        <span className="oc-count">{filtradas.length} OC{filtradas.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Body */}
      <div className="oc-body">
        {/* Lista */}
        <div className="oc-list" data-panel={selectedId !== null}>
          <div className="oc-list-header">
            <p className="oc-list-count">{filtradas.length} orden{filtradas.length !== 1 ? "es" : ""} de compra</p>
          </div>
          <div className="oc-list-scroll">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="oc-skeleton-row">
                    <div className="oc-skeleton-line" style={{ height: "0.875rem", width: "55%", marginBottom: "0.5rem" }} />
                    <div className="oc-skeleton-line" style={{ height: "0.625rem", width: "75%" }} />
                  </div>
                ))
              : filtradas.length === 0
                ? <div className="oc-list-empty">Sin órdenes de compra.</div>
                : filtradas.map(oc => (
                    <OCRow key={oc.id} oc={oc}
                      active={selectedId === oc.id}
                      onClick={() => setSelectedId(p => p === oc.id ? null : oc.id)} />
                  ))
            }
          </div>
        </div>

        {/* Panel resumen */}
        {selectedId && selectedOC && (
          <div className="oc-panel">
            <PanelResumen oc={selectedOC}
              onVerDetalle={() => navigate(`/ordenes-compra/${selectedOC.id}`)}
              onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>

      {showModal && (
        <ModalNuevaOC proveedores={proveedores} items={items}
          onClose={() => setShowModal(false)}
          onCreada={oc => { setLista(p => [oc, ...p]); setShowModal(false); }} />
      )}
    </div>
  );
}