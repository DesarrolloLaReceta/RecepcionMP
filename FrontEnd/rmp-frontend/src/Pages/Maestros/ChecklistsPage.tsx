import { useState, useEffect, useCallback } from "react";
import {
  checklistsService, categoriasService,
  type ChecklistResumen, type Checklist, type Categoria,
  type CriterioChecklist,
} from "../../Services/maestros.service";
import { MOCK_CHECKLISTS_LIST, MOCK_CHECKLIST_DETALLE, MOCK_CATEGORIAS } from "./MockData";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function CatBadge({ nombre }: { nombre: string }) {
  const colores: Record<string, { bg: string; color: string }> = {
    "Cárnicos":        { bg: "rgba(239,68,68,0.08)",  color: "#FCA5A5" },
    "Lácteos":         { bg: "rgba(59,130,246,0.08)",  color: "#93C5FD" },
    "Secos":           { bg: "rgba(245,158,11,0.08)",  color: "#FCD34D" },
    "Frutas/Verduras": { bg: "rgba(34,197,94,0.08)",   color: "#86EFAC" },
    "Congelados":      { bg: "rgba(168,85,247,0.08)",  color: "#C4B5FD" },
  };
  const c = colores[nombre] ?? { bg: "rgba(255,255,255,0.05)", color: "#64748B" };
  return (
    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium"
      style={{ background: c.bg, color: c.color }}>{nombre}</span>
  );
}

const TIPO_CRITERIO_LABELS: Record<string, string> = {
  SiNo:     "Sí / No",
  Numerico: "Numérico",
  Texto:    "Texto libre",
};

// ─── FILA RESUMEN ─────────────────────────────────────────────────────────────

function ChecklistRow({ cl, active, onClick }: {
  cl: ChecklistResumen; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-4 transition-all"
      style={{
        background: active ? "rgba(245,158,11,0.06)" : "transparent",
        borderLeft: `2px solid ${active ? "#F59E0B" : "transparent"}`,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseEnter={e => !active && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={e => !active && ((e.currentTarget as HTMLElement).style.background = "transparent")}>
      <div className="flex items-start gap-3">
        {/* Ícono versión */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cl.activo ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${cl.activo ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.07)"}` }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={cl.activo ? "#F59E0B" : "#475569"} strokeWidth="1.8">
            <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-[13px] font-semibold text-[#CBD5E1] truncate">{cl.nombre}</p>
            {!cl.activo && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                style={{ background: "rgba(100,116,139,0.1)", color: "#64748B" }}>
                INACTIVO
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <CatBadge nombre={cl.categoriaNombre} />
            <span className="text-[10px] font-mono text-[#475569]">v{cl.version}</span>
            <span className="text-[10px] text-[#334155]">
              {cl.totalCriterios} criterios · {cl.obligatorios} obligatorios
            </span>
          </div>
          <p className="text-[10px] text-[#2D3748] mt-1">Actualizado {fmtDate(cl.updatedAt)}</p>
        </div>
      </div>
    </button>
  );
}

// ─── EDITOR DE CRITERIO ───────────────────────────────────────────────────────

function CriterioEditor({ criterio, index, onChange, onDelete, onMove, totalItems }: {
  criterio: CriterioChecklist;
  index: number;
  onChange: (updated: CriterioChecklist) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
  totalItems: number;
}) {
  const upd = (k: keyof CriterioChecklist, v: unknown) => onChange({ ...criterio, [k]: v });

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Header criterio */}
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Orden */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={() => onMove("up")} disabled={index === 0}
            className="w-5 h-4 flex items-center justify-center rounded text-[#334155] hover:text-[#64748B] disabled:opacity-20 transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <button onClick={() => onMove("down")} disabled={index === totalItems - 1}
            className="w-5 h-4 flex items-center justify-center rounded text-[#334155] hover:text-[#64748B] disabled:opacity-20 transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Número */}
        <span className="text-[11px] font-bold font-mono text-[#334155] w-5 text-center shrink-0">
          {index + 1}
        </span>

        {/* Tipo */}
        <select value={criterio.tipoCriterio}
          onChange={e => upd("tipoCriterio", e.target.value)}
          className="text-[11px] px-2 py-1 rounded-lg outline-none shrink-0"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748B" }}>
          {Object.entries(TIPO_CRITERIO_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {/* Obligatorio toggle */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-[#334155]">Obligatorio</span>
          <button onClick={() => upd("obligatorio", !criterio.obligatorio)}
            className="w-8 h-4 rounded-full relative transition-all duration-200 shrink-0"
            style={{ background: criterio.obligatorio ? "#F59E0B" : "rgba(255,255,255,0.08)" }}>
            <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200"
              style={{ left: criterio.obligatorio ? "18px" : "2px" }} />
          </button>
        </div>

        {/* Eliminar */}
        <button onClick={onDelete}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-[#334155] hover:text-[#FCA5A5] transition-colors shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col gap-3">
        {/* Descripción */}
        <input value={criterio.descripcion}
          onChange={e => upd("descripcion", e.target.value)}
          placeholder="Descripción del criterio de inspección…"
          className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#CBD5E1" }}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />

        {/* Campos numéricos */}
        {criterio.tipoCriterio === "Numerico" && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Mín.", key: "valorMinimo" as keyof CriterioChecklist },
              { label: "Máx.", key: "valorMaximo" as keyof CriterioChecklist },
            ].map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-[9px] text-[#334155] font-mono uppercase">{f.label}</label>
                <input type="number" value={String(criterio[f.key] ?? "")}
                  onChange={e => upd(f.key, e.target.value === "" ? undefined : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] font-mono outline-none"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#94A3B8" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-[#334155] font-mono uppercase">Unidad</label>
              <input value={criterio.unidad ?? ""}
                onChange={e => upd("unidad", e.target.value)}
                placeholder="°C, %, g…"
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#94A3B8" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PANEL EDITOR ─────────────────────────────────────────────────────────────

function PanelEditor({ cl, onClose, onGuardado }: {
  cl: Checklist;
  onClose: () => void;
  onGuardado: (updated: Checklist) => void;
}) {
  const [criterios, setCriterios] = useState<CriterioChecklist[]>(cl.criterios);
  const [dirty, setDirty]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedOk, setSavedOk]     = useState(false);

  const update = (idx: number, updated: CriterioChecklist) => {
    setCriterios(prev => prev.map((c, i) => i === idx ? updated : c));
    setDirty(true); setSavedOk(false);
  };

  const deleteCriterio = (idx: number) => {
    setCriterios(prev => prev.filter((_, i) => i !== idx).map((c, i) => ({ ...c, orden: i + 1 })));
    setDirty(true); setSavedOk(false);
  };

  const moveCriterio = (idx: number, dir: "up" | "down") => {
    const next = [...criterios];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setCriterios(next.map((c, i) => ({ ...c, orden: i + 1 })));
    setDirty(true); setSavedOk(false);
  };

  const addCriterio = () => {
    setCriterios(prev => [
      ...prev,
      {
        id: `cr-new-${Date.now()}`,
        orden: prev.length + 1,
        descripcion: "",
        obligatorio: true,
        tipoCriterio: "SiNo" as const,
      },
    ]);
    setDirty(true); setSavedOk(false);
  };

  const guardar = async () => {
    setSaving(true);
    try {
      if (!isMock) await checklistsService.actualizarCriterios(cl.id, criterios);
      else await new Promise(r => setTimeout(r, 700));
      setDirty(false);
      setSavedOk(true);
      onGuardado({ ...cl, criterios, updatedAt: new Date().toISOString().slice(0, 10) });
      setTimeout(() => setSavedOk(false), 2500);
    } finally { setSaving(false); }
  };

  const publicar = async () => {
    if (dirty) { await guardar(); }
    setPublishing(true);
    try {
      if (!isMock) await checklistsService.publicar(cl.id);
      else await new Promise(r => setTimeout(r, 600));
      onGuardado({ ...cl, criterios, version: cl.version + 1, activo: true });
    } finally { setPublishing(false); }
  };

  const obligatorios = criterios.filter(c => c.obligatorio).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CatBadge nombre={cl.categoriaNombre} />
              <span className="text-[10px] font-mono text-[#475569]">v{cl.version}</span>
              {cl.activo
                ? <span className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: "rgba(34,197,94,0.08)", color: "#86EFAC" }}>ACTIVO</span>
                : <span className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: "rgba(100,116,139,0.08)", color: "#64748B" }}>BORRADOR</span>
              }
            </div>
            <h2 className="text-[15px] font-bold text-white leading-snug">{cl.nombre}</h2>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94A3B8] shrink-0"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Stats + acciones */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] text-[#475569]">
            <span className="font-mono">{criterios.length} criterios</span>
            <span className="font-mono" style={{ color: "#F59E0B" }}>{obligatorios} obligatorios</span>
            {dirty && <span className="text-[#FCA5A5] font-mono">● Sin guardar</span>}
            {savedOk && <span className="text-[#86EFAC] font-mono">✓ Guardado</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={guardar} disabled={!dirty || saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#94A3B8" }}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button onClick={publicar} disabled={publishing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all disabled:opacity-40"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}>
              {publishing ? "Publicando…" : dirty ? "Guardar y publicar" : "Publicar v" + (cl.version + 1)}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de criterios */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {criterios.length === 0 && (
          <div className="rounded-xl py-10 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)" }}>
            <p className="text-[#475569] text-sm">Sin criterios. Agrega el primero.</p>
          </div>
        )}

        {criterios.map((cr, idx) => (
          <CriterioEditor
            key={cr.id}
            criterio={cr}
            index={idx}
            totalItems={criterios.length}
            onChange={updated => update(idx, updated)}
            onDelete={() => deleteCriterio(idx)}
            onMove={dir => moveCriterio(idx, dir)}
          />
        ))}

        {/* Agregar criterio */}
        <button onClick={addCriterio}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium transition-all"
          style={{ background: "rgba(245,158,11,0.04)", border: "1px dashed rgba(245,158,11,0.18)", color: "#F59E0B" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.09)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.04)")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar criterio
        </button>

        {/* Nota normativa */}
        <div className="rounded-xl px-4 py-3 mt-1"
          style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.1)" }}>
          <p className="text-[10px] text-[#8B5CF6] leading-relaxed">
            Los criterios marcados como obligatorios bloquean la recepción si no se completan.
            Al publicar se incrementa la versión y queda trazabilidad del cambio. Res. 2674/2013.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL NUEVO CHECKLIST ────────────────────────────────────────────────────

function ModalNuevo({ categorias, onClose, onCreado }: {
  categorias: Categoria[];
  onClose: () => void;
  onCreado: (cl: ChecklistResumen) => void;
}) {
  const [nombre, setNombre]     = useState("");
  const [catId, setCatId]       = useState("");
  const [saving, setSaving]     = useState(false);
  const valid = nombre.trim() && catId;

  const crear = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const cat = categorias.find(c => c.id === catId);
      if (!isMock) {
        await checklistsService.crear({
          nombre, categoriaId: catId, categoriaNombre: cat?.nombre ?? "",
          activo: false, criterios: [],
        });
      } else {
        await new Promise(r => setTimeout(r, 700));
      }
      onCreado({
        id: `cl-${Date.now()}`, nombre, categoriaNombre: cat?.nombre ?? "",
        version: 1, activo: false, totalCriterios: 0, obligatorios: 0,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
    } finally { setSaving(false); }
  };

  const inp = "w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none";
  const ist = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#CBD5E1" } as React.CSSProperties;
  const lbl = "text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }`}</style>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-[15px] font-bold text-white">Nuevo checklist BPM</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569]"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Nombre <span className="text-[#FCA5A5]">*</span></label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Inspección cárnicos frescos"
              className={inp} style={ist}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Categoría <span className="text-[#FCA5A5]">*</span></label>
            <select value={catId} onChange={e => setCatId(e.target.value)}
              className={inp} style={ist}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>
              <option value="">Selecciona una categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="rounded-xl px-4 py-3"
            style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)" }}>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              El checklist se creará como borrador (v1). Podrás agregar criterios en el editor
              antes de publicarlo y asociarlo a recepciones.
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#94A3B8]">
            Cancelar
          </button>
          <button onClick={crear} disabled={saving || !valid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "#F59E0B", color: "#000" }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Creando…</>
              : "Crear checklist"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function ChecklistsPage() {
  const [lista, setLista]             = useState<ChecklistResumen[]>([]);
  const [categorias, setCategorias]   = useState<Categoria[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [detalle, setDetalle]         = useState<Checklist | null>(null);
  const [loadingDet, setLoadingDet]   = useState(false);
  const [search, setSearch]           = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [showModal, setShowModal]     = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, cats] = isMock
        ? [MOCK_CHECKLISTS_LIST, MOCK_CATEGORIAS]
        : await Promise.all([checklistsService.getAll(), categoriasService.getAll()]);
      setLista(cls); setCategorias(cats);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!selectedId) { setDetalle(null); return; }
    setLoadingDet(true);
    const load = async () => {
      try {
        const d = isMock ? MOCK_CHECKLIST_DETALLE : await checklistsService.getById(selectedId);
        setDetalle(d);
      } finally { setLoadingDet(false); }
    };
    load();
  }, [selectedId]);

  const filtrados = lista.filter(cl => {
    const q = search.toLowerCase();
    return (
      (filtroCategoria === "" || cl.categoriaNombre === filtroCategoria) &&
      (!search || cl.nombre.toLowerCase().includes(q) || cl.categoriaNombre.toLowerCase().includes(q))
    );
  });

  const catOptions = [...new Set(lista.map(c => c.categoriaNombre))];
  const activos   = lista.filter(c => c.activo).length;
  const borradores = lista.filter(c => !c.activo).length;

  return (
    <div className="flex flex-col h-full gap-4" style={{ animation: "fadeSlideUp 0.35s ease both" }}>
      <style>{`@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <p className="text-[10px] text-[#475569] tracking-[0.3em] uppercase font-mono mb-1">Maestros</p>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Checklists BPM
          </h1>
          <p className="text-[12px] text-[#475569] mt-0.5">
            Criterios de inspección por categoría — versionados y auditables
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* KPIs */}
          <div className="hidden sm:flex gap-2">
            <div className="px-3 py-2 rounded-xl text-center"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
              <p className="text-[14px] font-bold font-mono text-[#86EFAC]">{activos}</p>
              <p className="text-[9px] text-[#475569]">Activos</p>
            </div>
            <div className="px-3 py-2 rounded-xl text-center"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
              <p className="text-[14px] font-bold font-mono text-[#FCD34D]">{borradores}</p>
              <p className="text-[9px] text-[#475569]">Borradores</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.2)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.12)")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo checklist
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
            placeholder="Buscar checklist…"
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
      </div>

      {/* Lista + Panel */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Lista */}
        <div className="flex flex-col rounded-xl overflow-hidden"
          style={{
            width: selectedId ? "300px" : "100%", transition: "width 0.25s ease",
            background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}>
          <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] text-[#334155] font-mono">
              {filtrados.length} checklist{filtrados.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="h-4 w-48 rounded animate-pulse mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="h-3 w-24 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
              ))
              : filtrados.length === 0
                ? <div className="flex items-center justify-center py-16">
                    <p className="text-[#334155] text-sm">Sin checklists.</p>
                  </div>
                : filtrados.map(cl => (
                  <ChecklistRow key={cl.id} cl={cl}
                    active={selectedId === cl.id}
                    onClick={() => setSelectedId(prev => prev === cl.id ? null : cl.id)} />
                ))
            }
          </div>
        </div>

        {/* Panel editor */}
        {selectedId && (
          <div className="flex-1 rounded-xl overflow-hidden min-w-0"
            style={{
              background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(255,255,255,0.07)",
              animation: "panelIn 0.2s ease",
            }}>
            <style>{`@keyframes panelIn { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }`}</style>
            {loadingDet
              ? <div className="flex items-center justify-center h-full">
                  <div className="w-7 h-7 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
                </div>
              : detalle
                ? <PanelEditor
                    cl={detalle}
                    onClose={() => setSelectedId(null)}
                    onGuardado={updated => {
                      setDetalle(updated);
                      setLista(prev => prev.map(cl =>
                        cl.id === updated.id ? {
                          ...cl,
                          version: updated.version,
                          activo: updated.activo,
                          totalCriterios: updated.criterios.length,
                          obligatorios: updated.criterios.filter(c => c.obligatorio).length,
                          updatedAt: updated.updatedAt,
                        } : cl
                      ));
                    }}
                  />
                : null
            }
          </div>
        )}
      </div>

      {showModal && (
        <ModalNuevo
          categorias={categorias}
          onClose={() => setShowModal(false)}
          onCreado={cl => { setLista(prev => [...prev, cl]); setShowModal(false); setSelectedId(cl.id); }}
        />
      )}
    </div>
  );
}