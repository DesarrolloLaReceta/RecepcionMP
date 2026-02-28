import { useState, useEffect, useCallback } from "react";
import {
  itemsService, categoriasService,
  type ItemResumen, type Item, type Categoria,
  EstadoItem, EstadoItemLabels,
  type CrearItemCommand,
} from "../../Services/maestros.service";
import { MOCK_ITEMS_LIST, MOCK_ITEM_DETALLE, MOCK_CATEGORIAS } from "./MockData";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const ESTADO_CFG: Record<EstadoItem, { color: string; bg: string; dot: string }> = {
  [EstadoItem.Activo]:   { color: "#86EFAC", bg: "rgba(34,197,94,0.08)",   dot: "#22C55E" },
  [EstadoItem.Inactivo]: { color: "#94A3B8", bg: "rgba(100,116,139,0.08)", dot: "#64748B" },
};

function CatBadge({ nombre }: { nombre: string }) {
  const colores: Record<string, { bg: string; color: string }> = {
    "Cárnicos":       { bg: "rgba(239,68,68,0.08)",   color: "#FCA5A5" },
    "Lácteos":        { bg: "rgba(59,130,246,0.08)",   color: "#93C5FD" },
    "Secos":          { bg: "rgba(245,158,11,0.08)",   color: "#FCD34D" },
    "Frutas/Verduras":{ bg: "rgba(34,197,94,0.08)",    color: "#86EFAC" },
    "Congelados":     { bg: "rgba(168,85,247,0.08)",   color: "#C4B5FD" },
  };
  const c = colores[nombre] ?? { bg: "rgba(255,255,255,0.05)", color: "#64748B" };
  return (
    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium"
      style={{ background: c.bg, color: c.color }}>
      {nombre}
    </span>
  );
}

// ─── FILA ÍTEM ────────────────────────────────────────────────────────────────

function ItemRow({ item, active, onClick }: { item: ItemResumen; active: boolean; onClick: () => void }) {
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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={item.requiereCadenaFrio ? "#93C5FD" : "#64748B"} strokeWidth="1.8">
            {item.requiereCadenaFrio
              ? <path d="M12 2v20M12 2l-4 4M12 2l4 4M4.5 6.5l3 3M19.5 6.5l-3 3M4.5 17.5l3-3M19.5 17.5l-3-3" strokeLinecap="round" />
              : <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
            }
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[13px] font-semibold text-[#CBD5E1] truncate">{item.nombre}</p>
            {item.estado === EstadoItem.Inactivo && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                style={{ background: "rgba(100,116,139,0.1)", color: "#64748B" }}>
                INACTIVO
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#475569] font-mono">{item.codigo}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <CatBadge nombre={item.categoriaNombre} />
            <span className="text-[10px] text-[#475569] font-mono">{item.unidadMedida}</span>
            {item.requiereCadenaFrio && item.temperaturaMinima !== undefined && (
              <span className="text-[10px] text-[#93C5FD] font-mono">
                ❄ {item.temperaturaMinima}°–{item.temperaturaMaxima}°C
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[13px] font-bold font-mono text-[#94A3B8]">{item.totalLotesRecibidos}</p>
          <p className="text-[9px] text-[#334155]">lotes</p>
        </div>
      </div>
    </button>
  );
}

// ─── PANEL DETALLE ────────────────────────────────────────────────────────────

function PanelDetalle({ item, onClose }: { item: Item; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="px-6 py-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={item.requiereCadenaFrio ? "#93C5FD" : "#64748B"} strokeWidth="1.8">
                {item.requiereCadenaFrio
                  ? <path d="M12 2v20M12 2l-4 4M12 2l4 4M4.5 6.5l3 3M19.5 6.5l-3 3M4.5 17.5l3-3M19.5 17.5l-3-3" strokeLinecap="round" />
                  : <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
                }
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-[16px] font-bold text-white">{item.nombre}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold"
                  style={{ ...{ background: ESTADO_CFG[item.estado].bg, color: ESTADO_CFG[item.estado].color } }}>
                  {EstadoItemLabels[item.estado].toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-[#475569] font-mono">{item.codigo}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <CatBadge nombre={item.categoriaNombre} />
                <span className="text-[10px] text-[#64748B] font-mono">{item.unidadMedida}</span>
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
      </div>

      <div className="p-6 flex flex-col gap-5">
        {/* Descripción */}
        {item.descripcion && (
          <p className="text-[13px] text-[#94A3B8] leading-relaxed">{item.descripcion}</p>
        )}

        {/* Cadena de frío */}
        {item.requiereCadenaFrio && (
          <div className="rounded-xl p-4"
            style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2">
                <path d="M12 2v20M12 2l-4 4M12 2l4 4M4.5 6.5l3 3M19.5 6.5l-3 3" strokeLinecap="round" />
              </svg>
              <p className="text-[11px] text-[#93C5FD] font-semibold uppercase tracking-wider font-mono">Cadena de frío</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "T° mínima",  val: `${item.temperaturaMinima}°C` },
                { label: "T° máxima",  val: `${item.temperaturaMaxima}°C` },
                { label: "Vida útil mín.", val: item.vidaUtilMinimaDias ? `${item.vidaUtilMinimaDias}d` : "—" },
              ].map(k => (
                <div key={k.label} className="text-center p-2 rounded-lg"
                  style={{ background: "rgba(59,130,246,0.08)" }}>
                  <p className="text-[14px] font-bold font-mono text-[#93C5FD]">{k.val}</p>
                  <p className="text-[9px] text-[#475569] mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documentos requeridos */}
        <div>
          <p className="text-[10px] text-[#334155] uppercase tracking-wider font-mono mb-3">
            Documentos requeridos en recepción
          </p>
          <div className="flex flex-col gap-2">
            {item.documentosRequeridos.map(doc => (
              <div key={doc.tipoDocumento} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: doc.obligatorio ? "#F59E0B" : "#334155" }} />
                <p className="text-[12px] text-[#94A3B8] flex-1">{doc.nombreTipo}</p>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background: doc.obligatorio ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                    color: doc.obligatorio ? "#F59E0B" : "#334155",
                  }}>
                  {doc.obligatorio ? "Obligatorio" : "Opcional"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Criterios de aceptación */}
        {item.criteriosAceptacion && (
          <div>
            <p className="text-[10px] text-[#334155] uppercase tracking-wider font-mono mb-2">
              Criterios de aceptación / rechazo
            </p>
            <div className="rounded-xl p-4"
              style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)" }}>
              <p className="text-[12px] text-[#94A3B8] leading-relaxed">{item.criteriosAceptacion}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL NUEVO ÍTEM ─────────────────────────────────────────────────────────

function ModalNuevoItem({ categorias, onClose, onCreado }: {
  categorias: Categoria[];
  onClose: () => void;
  onCreado: (item: ItemResumen) => void;
}) {
  const [form, setForm] = useState<Partial<CrearItemCommand>>({
    requiereCadenaFrio: false, unidadMedida: "Kg",
  });
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof CrearItemCommand, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.codigo?.trim() && form.nombre?.trim() && form.categoriaId;

  const crear = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      if (!isMock) await itemsService.crear(form as CrearItemCommand);
      else await new Promise(r => setTimeout(r, 700));
      const cat = categorias.find(c => c.id === form.categoriaId);
      onCreado({
        id: `item-${Date.now()}`, codigo: form.codigo!, nombre: form.nombre!,
        categoriaNombre: cat?.nombre ?? "", unidadMedida: form.unidadMedida ?? "Kg",
        estado: EstadoItem.Activo, requiereCadenaFrio: form.requiereCadenaFrio ?? false,
        temperaturaMinima: form.temperaturaMinima, temperaturaMaxima: form.temperaturaMaxima,
        totalLotesRecibidos: 0,
      });
    } finally { setSaving(false); }
  };

  const inp = "w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none";
  const ist = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" } as React.CSSProperties;
  const lbl = "text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]";
  const onF = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)");
  const onB = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }`}</style>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-[15px] font-bold text-white">Nuevo ítem</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569]"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={lbl}>Código <span className="text-[#FCA5A5]">*</span></label>
              <input value={form.codigo ?? ""} onChange={e => upd("codigo", e.target.value)}
                placeholder="CAT-001" className={inp} style={ist} onFocus={onF} onBlur={onB} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl}>Unidad <span className="text-[#FCA5A5]">*</span></label>
              <select value={form.unidadMedida} onChange={e => upd("unidadMedida", e.target.value)}
                className={inp} style={ist} onFocus={onF} onBlur={onB}>
                {["Kg", "g", "L", "mL", "Und", "Caja"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className={lbl}>Nombre <span className="text-[#FCA5A5]">*</span></label>
              <input value={form.nombre ?? ""} onChange={e => upd("nombre", e.target.value)}
                placeholder="Nombre del ítem" className={inp} style={ist} onFocus={onF} onBlur={onB} />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className={lbl}>Categoría <span className="text-[#FCA5A5]">*</span></label>
              <select value={form.categoriaId ?? ""} onChange={e => {
                const cat = categorias.find(c => c.id === e.target.value);
                upd("categoriaId", e.target.value);
                if (cat) upd("requiereCadenaFrio", cat.requiereCadenaFrio);
              }} className={inp} style={ist} onFocus={onF} onBlur={onB}>
                <option value="">Selecciona una categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Cadena de frío */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl"
            style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)" }}>
            <div>
              <p className="text-[13px] text-[#CBD5E1]">Requiere cadena de frío</p>
              <p className="text-[10px] text-[#475569] mt-0.5">Activa el control de temperatura en recepción</p>
            </div>
            <button onClick={() => upd("requiereCadenaFrio", !form.requiereCadenaFrio)}
              className="w-10 h-5 rounded-full relative transition-all duration-200 shrink-0"
              style={{ background: form.requiereCadenaFrio ? "#3B82F6" : "rgba(255,255,255,0.08)" }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
                style={{ left: form.requiereCadenaFrio ? "22px" : "2px" }} />
            </button>
          </div>

          {form.requiereCadenaFrio && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "T° mínima (°C)", key: "temperaturaMinima" as keyof CrearItemCommand },
                { label: "T° máxima (°C)", key: "temperaturaMaxima" as keyof CrearItemCommand },
                { label: "Vida útil mín. (días)", key: "vidaUtilMinimaDias" as keyof CrearItemCommand },
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-1.5">
                  <label className={lbl}>{f.label}</label>
                  <input type="number" value={String(form[f.key] ?? "")}
                    onChange={e => upd(f.key, Number(e.target.value))}
                    className={inp} style={ist} onFocus={onF} onBlur={onB} />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Criterios de aceptación</label>
            <textarea value={form.criteriosAceptacion ?? ""}
              onChange={e => upd("criteriosAceptacion", e.target.value)}
              rows={3} placeholder="Describe los criterios para aceptar o rechazar este ítem…"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
              style={ist}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">Cancelar</button>
          <button onClick={crear} disabled={saving || !valid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "#F59E0B", color: "#000" }}>
            {saving ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Guardando…</> : "Crear ítem"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function ItemsPage() {
  const [lista, setLista]             = useState<ItemResumen[]>([]);
  const [categorias, setCategorias]   = useState<Categoria[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [detalle, setDetalle]         = useState<Item | null>(null);
  const [loadingDet, setLoadingDet]   = useState(false);
  const [search, setSearch]           = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroFrio, setFiltroFrio]   = useState<"" | "si" | "no">("");
  const [showModal, setShowModal]     = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [items, cats] = isMock
        ? [MOCK_ITEMS_LIST, MOCK_CATEGORIAS]
        : await Promise.all([itemsService.getAll(), categoriasService.getAll()]);
      setLista(items); setCategorias(cats);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!selectedId) { setDetalle(null); return; }
    setLoadingDet(true);
    const load = async () => {
      try {
        const d = isMock ? MOCK_ITEM_DETALLE : await itemsService.getById(selectedId);
        setDetalle(d);
      } finally { setLoadingDet(false); }
    };
    load();
  }, [selectedId]);

  const filtrados = lista.filter(item => {
    const q = search.toLowerCase();
    return (
      (filtroCategoria === "" || item.categoriaNombre === filtroCategoria) &&
      (filtroFrio === "" || (filtroFrio === "si" ? item.requiereCadenaFrio : !item.requiereCadenaFrio)) &&
      (!search || item.nombre.toLowerCase().includes(q) || item.codigo.toLowerCase().includes(q))
    );
  });

  const catOptions = [...new Set(lista.map(i => i.categoriaNombre))];

  return (
    <div className="flex flex-col h-full gap-4" style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <p className="text-[10px] text-[#475569] tracking-[0.3em] uppercase font-mono mb-1">Maestros</p>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>Ítems</h1>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all self-start"
          style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.2)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.12)")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo ítem
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13"
            viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] outline-none"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: "#CBD5E1" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="text-[12px] px-3 py-2 rounded-xl outline-none"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: filtroCategoria ? "#CBD5E1" : "#475569" }}>
          <option value="">Todas las categorías</option>
          {catOptions.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filtroFrio} onChange={e => setFiltroFrio(e.target.value as any)}
          className="text-[12px] px-3 py-2 rounded-xl outline-none"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: filtroFrio ? "#CBD5E1" : "#475569" }}>
          <option value="">Cadena de frío</option>
          <option value="si">Requiere ❄</option>
          <option value="no">Sin cadena de frío</option>
        </select>
      </div>

      {/* Lista + Panel */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col rounded-xl overflow-hidden"
          style={{
            width: selectedId ? "300px" : "100%", transition: "width 0.25s ease",
            background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
          }}>
          <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] text-[#334155] font-mono">{filtrados.length} ítem{filtrados.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="h-4 w-36 rounded animate-pulse mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="h-3 w-20 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
              ))
              : filtrados.length === 0
                ? <div className="flex items-center justify-center py-16">
                    <p className="text-[#334155] text-sm">Sin ítems.</p>
                  </div>
                : filtrados.map(item => (
                  <ItemRow key={item.id} item={item}
                    active={selectedId === item.id}
                    onClick={() => setSelectedId(prev => prev === item.id ? null : item.id)} />
                ))
            }
          </div>
        </div>

        {selectedId && (
          <div className="flex-1 rounded-xl overflow-hidden min-w-0"
            style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.07)", animation: "panelIn 0.2s ease" }}>
            <style>{`@keyframes panelIn { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }`}</style>
            {loadingDet
              ? <div className="flex items-center justify-center h-full">
                  <div className="w-7 h-7 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
                </div>
              : detalle
                ? <PanelDetalle item={detalle} onClose={() => setSelectedId(null)} />
                : null
            }
          </div>
        )}
      </div>

      {showModal && (
        <ModalNuevoItem categorias={categorias}
          onClose={() => setShowModal(false)}
          onCreado={item => { setLista(prev => [item, ...prev]); setShowModal(false); }} />
      )}
    </div>
  );
}