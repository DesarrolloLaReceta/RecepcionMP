import { useState, useEffect, useCallback } from "react";
import {
  proveedoresService,
  type ProveedorResumen, type Proveedor,
  EstadoProveedor, EstadoProveedorLabels,
  type CrearProveedorCommand,
} from "../../Services/maestros.service";
import { MOCK_PROVEEDORES_LIST, MOCK_PROVEEDOR_DETALLE } from "./MockData";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

const ESTADO_CFG: Record<EstadoProveedor, { color: string; bg: string; dot: string }> = {
  [EstadoProveedor.Activo]:     { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",   dot: "#22C55E" },
  [EstadoProveedor.Inactivo]:   { color: "#94A3B8", bg: "rgba(100,116,139,0.08)", dot: "#64748B" },
  [EstadoProveedor.Suspendido]: { color: "#FCA5A5", bg: "rgba(239,68,68,0.08)",   dot: "#EF4444" },
};

function diasColor(dias?: number): string {
  if (dias === undefined) return "#64748B";
  if (dias <= 0)  return "#EF4444";
  if (dias <= 30) return "#FCA5A5";
  if (dias <= 90) return "#FCD34D";
  return "#86EFAC";
}

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: EstadoProveedor }) {
  const c = ESTADO_CFG[estado];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {EstadoProveedorLabels[estado].toUpperCase()}
    </span>
  );
}

function DocVigenciaBar({ vigentes, porVencer, vencidos }: {
  vigentes: number; porVencer: number; vencidos: number;
}) {
  const total = vigentes + porVencer + vencidos;
  if (total === 0) return <span className="text-[11px] text-[#334155]">Sin docs</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 w-16 rounded-full overflow-hidden gap-px"
        style={{ background: "rgba(255,255,255,0.05)" }}>
        {vigentes > 0   && <div className="h-full bg-green-400" style={{ width: `${(vigentes / total) * 100}%` }} />}
        {porVencer > 0  && <div className="h-full bg-yellow-400" style={{ width: `${(porVencer / total) * 100}%` }} />}
        {vencidos > 0   && <div className="h-full bg-red-500" style={{ width: `${(vencidos / total) * 100}%` }} />}
      </div>
      <span className="text-[10px] font-mono text-[#64748B]">{vigentes}/{total}</span>
    </div>
  );
}

function ProveedorRow({ p, active, onClick }: {
  p: ProveedorResumen; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3.5 transition-all"
      style={{
        background: active ? "rgba(245,158,11,0.06)" : "transparent",
        borderLeft: `2px solid ${active ? "#F59E0B" : "transparent"}`,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseEnter={e => !active && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={e => !active && ((e.currentTarget as HTMLElement).style.background = "transparent")}>

      <div className="flex items-start gap-3">
        {/* Avatar inicial */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0"
          style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
          {p.razonSocial.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-[13px] font-semibold text-[#CBD5E1] truncate">{p.razonSocial}</p>
            {p.estado !== EstadoProveedor.Activo && <EstadoBadge estado={p.estado} />}
          </div>
          <p className="text-[10px] text-[#475569] font-mono">{p.nit}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {p.categorias.map(c => (
                <span key={c} className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}>
                  {c}
                </span>
              ))}
            </div>
            <DocVigenciaBar vigentes={p.documentosVigentes} porVencer={p.documentosPorVencer} vencidos={p.documentosVencidos} />
          </div>
        </div>
        {p.tasaAceptacion !== undefined && (
          <div className="text-right shrink-0">
            <p className="text-[13px] font-bold font-mono"
              style={{ color: p.tasaAceptacion >= 95 ? "#86EFAC" : p.tasaAceptacion >= 80 ? "#FCD34D" : "#FCA5A5" }}>
              {p.tasaAceptacion.toFixed(1)}%
            </p>
            <p className="text-[9px] text-[#334155]">aceptación</p>
          </div>
        )}
      </div>
    </button>
  );
}

// ─── PANEL DETALLE ────────────────────────────────────────────────────────────

function PanelDetalle({ prov, onClose }: { prov: Proveedor; onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "docs">("info");
  const cfg = ESTADO_CFG[prov.estado];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[16px] font-bold shrink-0"
              style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
              {prov.razonSocial.charAt(0)}
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-white leading-snug">{prov.razonSocial}</h2>
              <p className="text-[11px] text-[#475569] font-mono">{prov.nit}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <EstadoBadge estado={prov.estado} />
                {prov.categorias.map(c => (
                  <span key={c} className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}>
                    {c}
                  </span>
                ))}
              </div>
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

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Recepciones", val: prov.totalRecepciones, mono: true },
            { label: "Aceptación",  val: prov.tasaAceptacion !== undefined ? `${prov.tasaAceptacion.toFixed(1)}%` : "—", color: prov.tasaAceptacion !== undefined ? (prov.tasaAceptacion >= 95 ? "#86EFAC" : prov.tasaAceptacion >= 80 ? "#FCD34D" : "#FCA5A5") : "#64748B" },
            { label: "Última rec.", val: fmtDate(prov.ultimaRecepcion) },
          ].map(k => (
            <div key={k.label} className="p-3 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[14px] font-bold font-mono" style={{ color: k.color ?? "#CBD5E1" }}>{k.val}</p>
              <p className="text-[9px] text-[#334155] mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-3 gap-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { key: "info", label: "Información" },
          { key: "docs", label: `Documentos (${prov.documentos.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className="px-3 pb-3 text-[12px] font-medium transition-all border-b-2"
            style={{ color: tab === t.key ? "#F59E0B" : "#475569", borderColor: tab === t.key ? "#F59E0B" : "transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6">

        {tab === "info" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Contacto",   val: prov.nombreContacto },
                { label: "Teléfono",   val: prov.telefonoContacto },
                { label: "Email",      val: prov.emailContacto },
                { label: "Ciudad",     val: prov.ciudad },
                { label: "Dirección",  val: prov.direccion },
                { label: "Activo desde", val: fmtDate(prov.createdAt) },
              ].map(({ label, val }) => val && (
                <div key={label} className="p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-[9px] text-[#334155] font-mono uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-[12px] text-[#94A3B8]">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "docs" && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-[#475569] leading-relaxed">
              Vigencias de habilitaciones sanitarias y documentos requeridos para operar.
            </p>
            {prov.documentos.map(doc => {
              const dc = diasColor(doc.diasParaVencer);
              const vencido = (doc.diasParaVencer ?? 1) <= 0;
              const porVencer = (doc.diasParaVencer ?? 999) > 0 && (doc.diasParaVencer ?? 999) <= 30;
              return (
                <div key={doc.id} className="rounded-xl p-4"
                  style={{
                    background: vencido ? "rgba(239,68,68,0.05)" : porVencer ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${vencido ? "rgba(239,68,68,0.15)" : porVencer ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)"}`,
                  }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#CBD5E1] font-medium leading-snug">{doc.tipo}</p>
                      {doc.numeroDocumento && (
                        <p className="text-[10px] text-[#475569] font-mono mt-0.5">{doc.numeroDocumento}</p>
                      )}
                    </div>
                    {doc.diasParaVencer !== undefined && (
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-bold font-mono" style={{ color: dc }}>
                          {doc.diasParaVencer <= 0 ? "VENCIDO" : `${doc.diasParaVencer}d`}
                        </p>
                        <p className="text-[9px] text-[#334155]">para vencer</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-2 text-[10px] text-[#475569]">
                    {doc.fechaEmision  && <span>Emitido: {fmtDate(doc.fechaEmision)}</span>}
                    {doc.fechaVencimiento && <span>Vence: {fmtDate(doc.fechaVencimiento)}</span>}
                  </div>
                </div>
              );
            })}

            {/* Subir documento */}
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all mt-1"
              style={{ background: "rgba(245,158,11,0.05)", border: "1px dashed rgba(245,158,11,0.2)", color: "#F59E0B" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.05)")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-[13px] font-medium">Adjuntar nuevo documento</span>
              <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL NUEVO PROVEEDOR ────────────────────────────────────────────────────

function ModalNuevo({ onClose, onCreado }: {
  onClose: () => void;
  onCreado: (p: ProveedorResumen) => void;
}) {
  const [form, setForm] = useState<Partial<CrearProveedorCommand>>({});
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof CrearProveedorCommand, v: string) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.razonSocial?.trim() && form.nit?.trim();

  const crear = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      if (!isMock) await proveedoresService.crear(form as CrearProveedorCommand);
      else await new Promise(r => setTimeout(r, 700));
      const nuevo: ProveedorResumen = {
        id: `prov-${Date.now()}`, razonSocial: form.razonSocial!,
        nit: form.nit!, ciudad: form.ciudad,
        estado: EstadoProveedor.Activo, categorias: [],
        documentosVigentes: 0, documentosPorVencer: 0, documentosVencidos: 0,
        totalRecepciones: 0,
        tasaAceptacion: 0
      };
      onCreado(nuevo);
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none";
  const ist = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" } as React.CSSProperties;
  const lbl = "text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]";
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)");
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }`}</style>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-[15px] font-bold text-white">Nuevo proveedor</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569]"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className={lbl}>Razón social <span className="text-[#FCA5A5]">*</span></label>
              <input value={form.razonSocial ?? ""} onChange={e => upd("razonSocial", e.target.value)}
                placeholder="Nombre completo de la empresa" className={inp} style={ist} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl}>NIT <span className="text-[#FCA5A5]">*</span></label>
              <input value={form.nit ?? ""} onChange={e => upd("nit", e.target.value)}
                placeholder="000.000.000-0" className={inp} style={ist} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl}>Ciudad</label>
              <input value={form.ciudad ?? ""} onChange={e => upd("ciudad", e.target.value)}
                placeholder="Bogotá" className={inp} style={ist} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl}>Contacto</label>
              <input value={form.nombreContacto ?? ""} onChange={e => upd("nombreContacto", e.target.value)}
                placeholder="Nombre del contacto" className={inp} style={ist} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl}>Teléfono</label>
              <input value={form.telefonoContacto ?? ""} onChange={e => upd("telefonoContacto", e.target.value)}
                placeholder="+57 601 000 0000" className={inp} style={ist} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className={lbl}>Email</label>
              <input type="email" value={form.emailContacto ?? ""} onChange={e => upd("emailContacto", e.target.value)}
                placeholder="contacto@proveedor.com" className={inp} style={ist} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">Cancelar</button>
          <button onClick={crear} disabled={saving || !valid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "#F59E0B", color: "#000" }}>
            {saving ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Guardando…</> : "Crear proveedor"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function ProveedoresPage() {
  const [lista, setLista]           = useState<ProveedorResumen[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detalle, setDetalle]       = useState<Proveedor | null>(null);
  const [loadingDet, setLoadingDet] = useState(false);
  const [search, setSearch]         = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoProveedor | "">("");
  const [showModal, setShowModal]   = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = isMock ? MOCK_PROVEEDORES_LIST : await proveedoresService.getAll();
      setLista(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!selectedId) { setDetalle(null); return; }
    setLoadingDet(true);
    const load = async () => {
      try {
        const d = isMock ? MOCK_PROVEEDOR_DETALLE : await proveedoresService.getById(selectedId);
        setDetalle(d);
      } finally { setLoadingDet(false); }
    };
    load();
  }, [selectedId]);

  const filtrados = lista.filter(p => {
    const q = search.toLowerCase();
    return (
      (filtroEstado === "" || p.estado === filtroEstado) &&
      (!search || p.razonSocial.toLowerCase().includes(q) || p.nit.toLowerCase().includes(q) || (p.ciudad ?? "").toLowerCase().includes(q))
    );
  });

  const conDocVencidos  = lista.filter(p => p.documentosVencidos > 0).length;
  const conDocPorVencer = lista.filter(p => p.documentosPorVencer > 0).length;

  return (
    <div className="flex flex-col h-full gap-4" style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <p className="text-[10px] text-[#475569] tracking-[0.3em] uppercase font-mono mb-1">Maestros</p>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>Proveedores</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Alertas documentos */}
          {(conDocVencidos > 0 || conDocPorVencer > 0) && (
            <div className="hidden sm:flex gap-2">
              {conDocVencidos > 0 && (
                <div className="px-3 py-2 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
                  <p className="text-[12px] font-bold font-mono text-[#FCA5A5]">{conDocVencidos} <span className="font-normal text-[10px]">docs vencidos</span></p>
                </div>
              )}
              {conDocPorVencer > 0 && (
                <div className="px-3 py-2 rounded-xl"
                  style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
                  <p className="text-[12px] font-bold font-mono text-[#FCD34D]">{conDocPorVencer} <span className="font-normal text-[10px]">por vencer</span></p>
                </div>
              )}
            </div>
          )}
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.2)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.12)")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo proveedor
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13"
            viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, NIT, ciudad…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] outline-none"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: "#CBD5E1" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
        </div>
        <select value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value === "" ? "" : Number(e.target.value) as EstadoProveedor)}
          className="text-[12px] px-3 py-2 rounded-xl outline-none"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: filtroEstado !== "" ? "#CBD5E1" : "#475569" }}>
          <option value="">Todos los estados</option>
          {Object.entries(EstadoProveedorLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Lista + Panel */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Lista */}
        <div className="flex flex-col rounded-xl overflow-hidden"
          style={{
            width: selectedId ? "320px" : "100%", transition: "width 0.25s ease",
            background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}>
          <div className="px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] text-[#334155] font-mono">{filtrados.length} proveedor{filtrados.length !== 1 ? "es" : ""}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="h-4 w-40 rounded animate-pulse mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="h-3 w-24 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
              ))
              : filtrados.length === 0
                ? <div className="flex items-center justify-center py-16">
                    <p className="text-[#334155] text-sm">Sin proveedores.</p>
                  </div>
                : filtrados.map(p => (
                  <ProveedorRow key={p.id} p={p}
                    active={selectedId === p.id}
                    onClick={() => setSelectedId(prev => prev === p.id ? null : p.id)} />
                ))
            }
          </div>
        </div>

        {/* Panel detalle */}
        {selectedId && (
          <div className="flex-1 rounded-xl overflow-hidden min-w-0"
            style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.07)", animation: "panelIn 0.2s ease" }}>
            <style>{`@keyframes panelIn { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }`}</style>
            {loadingDet
              ? <div className="flex items-center justify-center h-full">
                  <div className="w-7 h-7 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
                </div>
              : detalle
                ? <PanelDetalle prov={detalle} onClose={() => setSelectedId(null)} />
                : null
            }
          </div>
        )}
      </div>

      {showModal && (
        <ModalNuevo onClose={() => setShowModal(false)}
          onCreado={p => { setLista(prev => [p, ...prev]); setShowModal(false); }} />
      )}
    </div>
  );
}