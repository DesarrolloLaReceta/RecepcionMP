import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ordenesCompraService,
  type OrdenCompraResumen,
  EstadoOC, EstadoOCLabels,
  type OrdenesCompraFilter,
  type CrearOCCommand,
} from "../../Services/ordenes-compra.service";
import {
  proveedoresService,
  itemsService,
  type ProveedorResumen,
  type ItemResumen,
} from "../../Services/maestros.service";
import { MOCK_OC_TODAS } from "./MockData";
import { MOCK_PROVEEDORES_LIST, MOCK_ITEMS_LIST } from "../Maestros/MockData";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtCOP(val: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);
}
function isVencida(fecha?: string) {
  if (!fecha) return false;
  return new Date(fecha) < new Date();
}

// ─── CONFIGURACIÓN ESTADO ─────────────────────────────────────────────────────

const ESTADO_CFG: Record<EstadoOC, { color: string; bg: string; dot: string }> = {
  [EstadoOC.Abierta]:              { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",   dot: "#22C55E" },
  [EstadoOC.ParcialmenteRecibida]: { color: "#FCD34D", bg: "rgba(245,158,11,0.08)",  dot: "#F59E0B" },
  [EstadoOC.TotalmenteRecibida]:   { color: "#93C5FD", bg: "rgba(59,130,246,0.08)",  dot: "#3B82F6" },
  [EstadoOC.Cerrada]:              { color: "#94A3B8", bg: "rgba(100,116,139,0.08)", dot: "#64748B" },
  [EstadoOC.Cancelada]:            { color: "#94A3B8", bg: "rgba(100,116,139,0.06)", dot: "#475569" },
  [EstadoOC.Vencida]:              { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",   dot: "#EF4444" },
};

// ─── BADGE ESTADO ─────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: EstadoOC }) {
  const c = ESTADO_CFG[estado];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
      {EstadoOCLabels[estado].toUpperCase()}
    </span>
  );
}

// ─── BARRA DE PROGRESO RECEPCIÓN ──────────────────────────────────────────────

function ProgresoBarra({ oc }: { oc: OrdenCompraResumen }) {
  const totalSolicitado = oc.detalles.reduce((s, d) => s + d.cantidadSolicitada, 0);
  const totalRecibido   = oc.detalles.reduce((s, d) => s + d.cantidadRecibida,   0);
  const pct = totalSolicitado > 0 ? Math.round((totalRecibido / totalSolicitado) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full overflow-hidden shrink-0"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: pct === 100 ? "#22C55E" : "#F59E0B" }} />
      </div>
      <span className="text-[10px] font-mono text-[#64748B]">{pct}%</span>
    </div>
  );
}

// ─── FILA DE LISTA ────────────────────────────────────────────────────────────

function OCRow({ oc, active, onClick }: {
  oc: OrdenCompraResumen; active: boolean; onClick: () => void;
}) {
  const vencida = isVencida(oc.fechaVencimiento) &&
    oc.estado !== EstadoOC.Cerrada &&
    oc.estado !== EstadoOC.Cancelada &&
    oc.estado !== EstadoOC.TotalmenteRecibida;

  return (
    <button onClick={onClick} className="w-full text-left px-4 py-4 transition-all relative"
      style={{
        background: active ? "rgba(245,158,11,0.06)" : "transparent",
        borderLeft: `2px solid ${active ? "#F59E0B" : "transparent"}`,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseEnter={e => !active && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={e => !active && ((e.currentTarget as HTMLElement).style.background = "transparent")}>

      {/* Chip vencida */}
      {vencida && (
        <span className="absolute top-3 right-3 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono"
          style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5" }}>
          VENCIDA
        </span>
      )}

      <div className="flex items-start gap-3">
        {/* Ícono cadena de frío */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={oc.requiereCadenaFrio ? "#93C5FD" : "#475569"} strokeWidth="1.8">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h6a2 2 0 000-4M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>

        <div className="flex-1 min-w-0 pr-12">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[12px] font-bold text-[#CBD5E1] font-mono">{oc.numeroOC}</p>
            <EstadoBadge estado={oc.estado} />
          </div>
          <p className="text-[13px] text-[#94A3B8] truncate">{oc.proveedorNombre}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <ProgresoBarra oc={oc} />
            <span className="text-[10px] text-[#334155]">{oc.totalItems} ítem{oc.totalItems !== 1 ? "s" : ""}</span>
            <span className="text-[10px] font-mono text-[#475569]">{fmtCOP(oc.valorTotal)}</span>
          </div>
          <div className="flex gap-3 mt-1 text-[10px] text-[#2D3748]">
            <span>Emisión: {fmtDate(oc.fechaEmision)}</span>
            {oc.fechaEntregaEsperada && <span>Entrega: {fmtDate(oc.fechaEntregaEsperada)}</span>}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── PANEL RESUMEN ────────────────────────────────────────────────────────────

function PanelResumen({ oc, onVerDetalle, onClose }: {
  oc: OrdenCompraResumen;
  onVerDetalle: () => void;
  onClose: () => void;
}) {
  const totalSolicitado = oc.detalles.reduce((s, d) => s + d.cantidadSolicitada, 0);
  const totalRecibido   = oc.detalles.reduce((s, d) => s + d.cantidadRecibida,   0);
  const totalPendiente  = oc.detalles.reduce((s, d) => s + d.cantidadPendiente,  0);
  const pct = totalSolicitado > 0 ? Math.round((totalRecibido / totalSolicitado) * 100) : 0;
  const cfg = ESTADO_CFG[oc.estado];

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="px-6 py-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#475569] font-mono mb-0.5">{oc.numeroOC}</p>
            <h2 className="text-[16px] font-bold text-white leading-snug">{oc.proveedorNombre}</h2>
            <p className="text-[11px] text-[#475569] font-mono mt-0.5">{oc.proveedorNit}</p>
            <div className="flex items-center gap-2 mt-2">
              <EstadoBadge estado={oc.estado} />
              {oc.requiereCadenaFrio && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono"
                  style={{ background: "rgba(59,130,246,0.08)", color: "#93C5FD" }}>
                  ❄ cadena frío
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94A3B8] shrink-0"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Progreso general */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-[#334155] font-mono uppercase tracking-wider">Progreso de recepción</p>
            <p className="text-[11px] font-mono" style={{ color: pct === 100 ? "#86EFAC" : "#F59E0B" }}>
              {pct}% — {totalRecibido.toLocaleString()} / {totalSolicitado.toLocaleString()} uds
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: pct === 100 ? "#22C55E" : "#F59E0B" }} />
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Valor total",  val: fmtCOP(oc.valorTotal), color: "#CBD5E1" },
            { label: "Pendiente",    val: `${totalPendiente.toLocaleString()} uds`, color: totalPendiente > 0 ? "#FCD34D" : "#86EFAC" },
            { label: "Entrega esp.", val: fmtDate(oc.fechaEntregaEsperada) },
          ].map(k => (
            <div key={k.label} className="p-3 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[12px] font-bold font-mono leading-snug" style={{ color: k.color ?? "#94A3B8" }}>
                {k.val}
              </p>
              <p className="text-[9px] text-[#334155] mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Ítems */}
        <div>
          <p className="text-[10px] text-[#334155] uppercase tracking-wider font-mono mb-3">
            Ítems ({oc.totalItems})
          </p>
          <div className="flex flex-col gap-2">
            {oc.detalles.map(det => {
              const pctDet = det.cantidadSolicitada > 0
                ? Math.round((det.cantidadRecibida / det.cantidadSolicitada) * 100)
                : 0;
              return (
                <div key={det.id} className="p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-[12px] text-[#CBD5E1] font-medium truncate">{det.itemNombre}</p>
                      <p className="text-[10px] text-[#475569] font-mono">{det.itemCodigo}</p>
                    </div>
                    <span className="text-[11px] font-bold font-mono shrink-0"
                      style={{ color: pctDet === 100 ? "#86EFAC" : "#F59E0B" }}>
                      {pctDet}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden mb-1.5"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${pctDet}%`, background: pctDet === 100 ? "#22C55E" : "#F59E0B" }} />
                  </div>
                  <p className="text-[10px] text-[#475569] font-mono">
                    {det.cantidadRecibida} / {det.cantidadSolicitada} {det.unidadMedida}
                    {det.requiereCadenaFrio && <span className="text-[#93C5FD] ml-2">❄ {det.temperaturaMinima}°–{det.temperaturaMaxima}°C</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA ver detalle */}
        <button onClick={onVerDetalle}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.18)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)")}>
          Ver detalle completo
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── MODAL NUEVA OC ───────────────────────────────────────────────────────────

interface DetalleForm { itemId: string; cantidad: string; precioUnitario: string; }

function ModalNuevaOC({ proveedores, items, onClose, onCreada }: {
  proveedores: ProveedorResumen[];
  items: ItemResumen[];
  onClose: () => void;
  onCreada: (oc: OrdenCompraResumen) => void;
}) {
  const [proveedorId, setProveedorId]         = useState("");
  const [fechaEntrega, setFechaEntrega]       = useState("");
  const [notas, setNotas]                     = useState("");
  const [detalles, setDetalles]               = useState<DetalleForm[]>([
    { itemId: "", cantidad: "", precioUnitario: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const addDetalle = () =>
    setDetalles(prev => [...prev, { itemId: "", cantidad: "", precioUnitario: "" }]);

  const removeDetalle = (idx: number) =>
    setDetalles(prev => prev.filter((_, i) => i !== idx));

  const updDetalle = (idx: number, k: keyof DetalleForm, v: string) =>
    setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, [k]: v } : d));

  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const valid = proveedorId &&
    detalles.every(d => d.itemId && Number(d.cantidad) > 0 && Number(d.precioUnitario) > 0);

  const crear = async () => {
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
      if (!isMock) await ordenesCompraService.crear(cmd);
      else await new Promise(r => setTimeout(r, 800));

      const prov = proveedores.find(p => p.id === proveedorId);
      const detObjs = detalles.map((d, i) => {
        const item = items.find(it => it.id === d.itemId);
        const cant = Number(d.cantidad);
        const precio = Number(d.precioUnitario);
        return {
          id: `det-new-${i}`,
          itemId: d.itemId,
          itemNombre: item?.nombre ?? "",
          itemCodigo: item?.codigo ?? "",
          categoriaId: "",
          categoriaNombre: item?.categoriaNombre ?? "",
          cantidadSolicitada: cant,
          cantidadRecibida: 0,
          cantidadPendiente: cant,
          unidadMedida: item?.unidadMedida ?? "Kg",
          precioUnitario: precio,
          subtotal: cant * precio,
          requiereCadenaFrio: item?.requiereCadenaFrio ?? false,
          temperaturaMinima: item?.temperaturaMinima,
          temperaturaMaxima: item?.temperaturaMaxima,
        };
      });

      const nueva: OrdenCompraResumen = {
        id: `oc-${Date.now()}`,
        numeroOC: `OC-2026-${String(Date.now()).slice(-4)}`,
        proveedorId,
        proveedorNombre: prov?.razonSocial ?? "",
        proveedorNit: prov?.nit ?? "",
        fechaEmision: new Date().toISOString().slice(0, 10),
        fechaEntregaEsperada: fechaEntrega || undefined,
        estado: EstadoOC.Abierta,
        totalItems: detalles.length,
        valorTotal: detObjs.reduce((s, d) => s + d.subtotal, 0),
        requiereCadenaFrio: detObjs.some(d => d.requiereCadenaFrio),
        detalles: detObjs,
      };
      onCreada(nueva);
    } finally { setSaving(false); }
  };

  const inp  = "w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none";
  const ist  = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" } as React.CSSProperties;
  const lbl  = "text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]";
  const onF  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)");
  const onB  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)");

  const totalValor = detalles.reduce((s, d) =>
    s + (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: "rgba(10,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-[15px] font-bold text-white">Nueva Orden de Compra</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569]"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">

          {/* Proveedor + fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className={lbl}>Proveedor <span className="text-[#FCA5A5]">*</span></label>
              <select value={proveedorId} onChange={e => setProveedorId(e.target.value)}
                className={inp} style={ist} onFocus={onF} onBlur={onB}>
                <option value="">Selecciona un proveedor</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.razonSocial} — {p.nit}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl}>Fecha entrega esperada</label>
              <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)}
                min={minDate} className={inp} style={ist} onFocus={onF} onBlur={onB} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl}>Notas</label>
              <input value={notas} onChange={e => setNotas(e.target.value)}
                placeholder="Instrucciones de entrega, muelle, etc." className={inp} style={ist} onFocus={onF} onBlur={onB} />
            </div>
          </div>

          {/* Ítems */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={lbl}>Ítems <span className="text-[#FCA5A5]">*</span></label>
              {totalValor > 0 && (
                <span className="text-[12px] font-bold font-mono text-[#F59E0B]">
                  Total: {fmtCOP(totalValor)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {detalles.map((det, idx) => {
                const selectedItem = items.find(it => it.id === det.itemId);
                const subtotal = (Number(det.cantidad) || 0) * (Number(det.precioUnitario) || 0);
                return (
                  <div key={idx} className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="grid grid-cols-12 gap-3 items-end">
                      {/* Ítem selector */}
                      <div className="col-span-5 flex flex-col gap-1.5">
                        <label className={lbl}>Ítem</label>
                        <select value={det.itemId} onChange={e => updDetalle(idx, "itemId", e.target.value)}
                          className={inp} style={ist} onFocus={onF} onBlur={onB}>
                          <option value="">Seleccionar…</option>
                          {items.map(it => (
                            <option key={it.id} value={it.id}>
                              [{it.codigo}] {it.nombre}
                            </option>
                          ))}
                        </select>
                        {selectedItem?.requiereCadenaFrio && (
                          <span className="text-[10px] text-[#93C5FD] font-mono">
                            ❄ {selectedItem.temperaturaMinima}°–{selectedItem.temperaturaMaxima}°C
                          </span>
                        )}
                      </div>
                      {/* Cantidad */}
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className={lbl}>Cantidad</label>
                        <input type="number" value={det.cantidad} min="1"
                          onChange={e => updDetalle(idx, "cantidad", e.target.value)}
                          placeholder="0" className={inp} style={ist} onFocus={onF} onBlur={onB} />
                      </div>
                      {/* Precio */}
                      <div className="col-span-3 flex flex-col gap-1.5">
                        <label className={lbl}>Precio unit. (COP)</label>
                        <input type="number" value={det.precioUnitario} min="0"
                          onChange={e => updDetalle(idx, "precioUnitario", e.target.value)}
                          placeholder="0" className={inp} style={ist} onFocus={onF} onBlur={onB} />
                      </div>
                      {/* Subtotal + eliminar */}
                      <div className="col-span-2 flex flex-col items-end gap-1.5">
                        <p className="text-[9px] text-[#334155] font-mono uppercase">Subtotal</p>
                        <p className="text-[12px] font-bold font-mono text-[#94A3B8]">
                          {subtotal > 0 ? fmtCOP(subtotal) : "—"}
                        </p>
                        {detalles.length > 1 && (
                          <button onClick={() => removeDetalle(idx)}
                            className="text-[#334155] hover:text-[#FCA5A5] transition-colors mt-0.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button onClick={addDetalle}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] transition-all self-start"
                style={{ background: "rgba(245,158,11,0.04)", border: "1px dashed rgba(245,158,11,0.18)", color: "#F59E0B" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.09)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.04)")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Agregar ítem
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">
            Cancelar
          </button>
          <button onClick={crear} disabled={saving || !valid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "#F59E0B", color: "#000" }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Creando…</>
              : "Crear orden de compra"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function OrdenesCompraPage() {
  const navigate = useNavigate();
  const [lista, setLista]                 = useState<OrdenCompraResumen[]>([]);
  const [proveedores, setProveedores]     = useState<ProveedorResumen[]>([]);
  const [items, setItems]                 = useState<ItemResumen[]>([]);
  const [loading, setLoading]             = useState(true);
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [search, setSearch]               = useState("");
  const [filtroEstado, setFiltroEstado]   = useState<EstadoOC | "">("");
  const [filtroFrio, setFiltroFrio]       = useState<"" | "si" | "no">("");
  const [showModal, setShowModal]         = useState(false);

  const selectedOC = lista.find(oc => oc.id === selectedId) ?? null;

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      if (isMock) {
        setLista(MOCK_OC_TODAS);
        setProveedores(MOCK_PROVEEDORES_LIST);
        setItems(MOCK_ITEMS_LIST);
      } else {
        const [ocs, provs, its] = await Promise.all([
          ordenesCompraService.getAll(),
          proveedoresService.getAll(),
          itemsService.getAll(),
        ]);
        setLista(ocs); setProveedores(provs); setItems(its);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtradas = lista.filter(oc => {
    const q = search.toLowerCase();
    return (
      (filtroEstado === "" || oc.estado === filtroEstado) &&
      (filtroFrio === "" || (filtroFrio === "si" ? oc.requiereCadenaFrio : !oc.requiereCadenaFrio)) &&
      (!search ||
        oc.numeroOC.toLowerCase().includes(q) ||
        oc.proveedorNombre.toLowerCase().includes(q) ||
        oc.proveedorNit.includes(q)
      )
    );
  });

  // KPIs rápidos
  const abiertas     = lista.filter(oc => oc.estado === EstadoOC.Abierta).length;
  const parciales    = lista.filter(oc => oc.estado === EstadoOC.ParcialmenteRecibida).length;
  const vencidasCnt  = lista.filter(oc =>
    isVencida(oc.fechaVencimiento) &&
    oc.estado !== EstadoOC.Cerrada &&
    oc.estado !== EstadoOC.Cancelada &&
    oc.estado !== EstadoOC.TotalmenteRecibida
  ).length;

  return (
    <div className="flex flex-col h-full gap-4" style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 shrink-0">
        <div>
          <p className="text-[10px] text-[#475569] tracking-[0.3em] uppercase font-mono mb-1">
            Compras / Módulo
          </p>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Órdenes de Compra
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* KPIs */}
          <div className="hidden sm:flex gap-2">
            {[
              { label: "Abiertas",  val: abiertas,  color: "#86EFAC", bg: "rgba(34,197,94,0.06)"  },
              { label: "Parciales", val: parciales,  color: "#FCD34D", bg: "rgba(245,158,11,0.06)" },
              { label: "Vencidas",  val: vencidasCnt, color: "#FCA5A5", bg: "rgba(239,68,68,0.06)"  },
            ].map(k => (
              <div key={k.label} className="px-3 py-2 rounded-xl text-center"
                style={{ background: k.bg, border: `1px solid ${k.color}22` }}>
                <p className="text-[15px] font-bold font-mono" style={{ color: k.color }}>{k.val}</p>
                <p className="text-[9px] text-[#475569] mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.2)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.12)")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva OC
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13"
            viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar OC, proveedor, NIT…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] outline-none"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: "#CBD5E1" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
        </div>
        <select value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value === "" ? "" : Number(e.target.value) as EstadoOC)}
          className="text-[12px] px-3 py-2 rounded-xl outline-none"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: filtroEstado !== "" ? "#CBD5E1" : "#475569" }}>
          <option value="">Todos los estados</option>
          {Object.entries(EstadoOCLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={filtroFrio}
          onChange={e => setFiltroFrio(e.target.value as any)}
          className="text-[12px] px-3 py-2 rounded-xl outline-none"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: filtroFrio ? "#CBD5E1" : "#475569" }}>
          <option value="">Cadena de frío</option>
          <option value="si">Requiere ❄</option>
          <option value="no">Sin cadena de frío</option>
        </select>
        <p className="text-[11px] text-[#334155] font-mono self-center hidden sm:block">
          {filtradas.length} OC{filtradas.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Lista + Panel */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Lista */}
        <div className="flex flex-col rounded-xl overflow-hidden"
          style={{
            width: selectedId ? "340px" : "100%",
            transition: "width 0.25s ease",
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}>
          <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] text-[#334155] font-mono">
              {filtradas.length} orden{filtradas.length !== 1 ? "es" : ""} de compra
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="h-4 w-32 rounded animate-pulse mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="h-3 w-48 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
              ))
              : filtradas.length === 0
                ? <div className="flex items-center justify-center py-16">
                    <p className="text-[#334155] text-sm">Sin órdenes de compra.</p>
                  </div>
                : filtradas.map(oc => (
                  <OCRow key={oc.id} oc={oc}
                    active={selectedId === oc.id}
                    onClick={() => setSelectedId(prev => prev === oc.id ? null : oc.id)} />
                ))
            }
          </div>
        </div>

        {/* Panel resumen */}
        {selectedId && selectedOC && (
          <div className="flex-1 rounded-xl overflow-hidden min-w-0"
            style={{
              background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(255,255,255,0.07)",
              animation: "panelIn 0.2s ease",
            }}>
            <style>{`@keyframes panelIn { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }`}</style>
            <PanelResumen
              oc={selectedOC}
              onVerDetalle={() => navigate(`/ordenes-compra/${selectedOC.id}`)}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>

      {showModal && (
        <ModalNuevaOC
          proveedores={proveedores}
          items={items}
          onClose={() => setShowModal(false)}
          onCreada={oc => { setLista(prev => [oc, ...prev]); setShowModal(false); }}
        />
      )}
    </div>
  );
}