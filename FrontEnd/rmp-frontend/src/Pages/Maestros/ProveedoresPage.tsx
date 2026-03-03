import { useState, useCallback, useEffect } from "react";
import {
  proveedoresService,
  type ProveedorResumen, type Proveedor,
  type CrearProveedorCommand,
  EstadoProveedor, EstadoProveedorLabels,
} from "../../Services/maestros.service";
import { StatusBadge, Button, Modal, ModalFooter, } from "../../Components/UI/Index";
import { TextField } from "../../Components/Forms/Index";
import { formatDate } from "../../Utils/formatters";
import {
  MOCK_PROVEEDORES_LIST, MOCK_PROVEEDOR_DETALLE,
} from "./MockData";
import "./StylesMaestros/MaestrosLayout.css";
import "./StylesMaestros/ProveedoresPage.css";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function initials(nombre: string) {
  return nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function diasColor(dias?: number): string {
  if (dias == null || dias <= 0)  return "#FCA5A5";
  if (dias <= 30)                  return "#FCD34D";
  return "#86EFAC";
}

// ─── FILA PROVEEDOR ──────────────────────────────────────────────────────────

function ProveedorRow({
  p, active, onClick,
}: {
  p: ProveedorResumen;
  active: boolean;
  onClick: () => void;
}) {
  const docAlert = p.documentosPorVencer > 0 || p.documentosVencidos > 0;
  return (
    <div
      className="ms-row"
      data-active={active}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}
    >
      <div className="pv-row-inner">
        <div className="pv-avatar">{initials(p.razonSocial)}</div>
        <div className="pv-row-info">
          <p className="pv-razon-social">{p.razonSocial}</p>
          <p className="pv-nit">{p.nit}</p>
          {p.categorias.length > 0 && (
            <div className="pv-cats">
              {p.categorias.slice(0, 3).map(c => (
                <span key={c} className="pv-cat-pill">{c}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <StatusBadge domain="proveedor" value={p.estado} size="xs" />
          {docAlert && <span className="pv-doc-alert" title="Documentos por vencer o vencidos" />}
        </div>
      </div>
    </div>
  );
}

// ─── PANEL DETALLE ────────────────────────────────────────────────────────────

function PanelDetalle({
  prov, onClose,
}: {
  prov: Proveedor;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"info" | "docs">("info");

  const kpis = [
    { label: "Recepciones", val: String(prov.totalRecepciones ?? 0),                                                    color: "#CBD5E1" },
    { label: "Tasa acept.",  val: prov.tasaAceptacion != null ? `${prov.tasaAceptacion.toFixed(1)}%` : "—",
      color: prov.tasaAceptacion != null ? (prov.tasaAceptacion >= 95 ? "#86EFAC" : prov.tasaAceptacion >= 80 ? "#FCD34D" : "#FCA5A5") : "#64748B" },
    { label: "Última rec.",  val: formatDate(prov.ultimaRecepcion),                                                     color: "#94A3B8" },
  ];

  return (
    <>
      {/* Header */}
      <div className="pv-panel-header">
        <div className="pv-panel-avatar">{initials(prov.razonSocial)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="pv-panel-name">{prov.razonSocial}</p>
          <p className="pv-panel-nit">NIT {prov.nit}</p>
          <div style={{ marginTop: "0.375rem" }}>
            <StatusBadge domain="proveedor" value={prov.estado} size="sm" />
          </div>
        </div>
        <button className="pv-panel-close" onClick={onClose} aria-label="Cerrar panel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mini KPIs */}
      <div style={{ padding: "1rem 1.5rem 0" }}>
        <div className="ms-stat-grid">
          {kpis.map(k => (
            <div key={k.label} className="ms-stat-card">
              <p className="ms-stat-value" style={{ color: k.color }}>{k.val}</p>
              <p className="ms-stat-label">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="ms-tabs" style={{ marginTop: "0.75rem" }}>
        {([
          { key: "info", label: "Información" },
          { key: "docs", label: `Documentos (${prov.documentos.length})` },
        ] as const).map(t => (
          <button key={t.key} className="ms-tab" data-active={tab === t.key}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="ms-panel-body">
        {tab === "info" && (
          <div className="ms-info-grid">
            {[
              { label: "Contacto",     val: prov.nombreContacto },
              { label: "Teléfono",     val: prov.telefonoContacto },
              { label: "Email",        val: prov.emailContacto },
              { label: "Ciudad",       val: prov.ciudad },
              { label: "Dirección",    val: prov.direccion },
              { label: "Activo desde", val: formatDate(prov.createdAt) },
            ].filter(f => f.val).map(({ label, val }) => (
              <div key={label} className="ms-info-card">
                <p className="ms-info-label">{label}</p>
                <p className="ms-info-value">{val}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "docs" && (
          <>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Vigencias de habilitaciones sanitarias y documentos requeridos.
            </p>
            {prov.documentos.length === 0 ? (
              <p style={{ fontSize: "var(--text-md)", color: "var(--text-tertiary)" }}>Sin documentos registrados.</p>
            ) : (
              prov.documentos.map(doc => {
                const color = diasColor(doc.diasParaVencer);
                return (
                  <div key={doc.id} className="ms-doc-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="ms-doc-name">{doc.tipo}</span>
                    <div className="pv-doc-vencimiento">
                      <span className="ms-doc-dias" style={{ color }}>
                        {doc.diasParaVencer != null
                          ? doc.diasParaVencer <= 0
                            ? "Vencido"
                            : `${doc.diasParaVencer}d`
                          : "—"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── MODAL NUEVO PROVEEDOR ────────────────────────────────────────────────────

function ModalNuevo({
  onClose, onCreado,
}: {
  onClose: () => void;
  onCreado: (p: ProveedorResumen) => void;
}) {
  const [form, setForm]   = useState<Partial<CrearProveedorCommand>>({});
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof CrearProveedorCommand, v: string) =>
    setForm(p => ({ ...p, [k]: v }));
  const valid = form.razonSocial?.trim() && form.nit?.trim();

  const crear = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      if (!isMock) await proveedoresService.crear(form as CrearProveedorCommand);
      else await new Promise(r => setTimeout(r, 700));
      onCreado({
        id: `prov-${Date.now()}`,
        razonSocial: form.razonSocial!,
        nit: form.nit!,
        ciudad: form.ciudad,
        estado: EstadoProveedor.Activo,
        categorias: [],
        documentosVigentes: 0,
        documentosPorVencer: 0,
        documentosVencidos: 0,
        totalRecepciones: 0,
        tasaAceptacion: 0,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Nuevo proveedor"
      subtitle="Los campos marcados con * son obligatorios"
      icon="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 100-8 4 4 0 000 8z"
      size="md"
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={crear}
          loading={saving}
          disabled={!valid}
          confirmLabel="Crear proveedor"
        />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Razón social"
              required
              placeholder="Razón social o nombre comercial"
              value={form.razonSocial ?? ""}
              onChange={e => upd("razonSocial", e.target.value)}
            />
          </div>
          <TextField
            label="NIT"
            required
            placeholder="800.000.000-1"
            value={form.nit ?? ""}
            onChange={e => upd("nit", e.target.value)}
          />
          <TextField
            label="Ciudad"
            placeholder="Bogotá"
            value={form.ciudad ?? ""}
            onChange={e => upd("ciudad", e.target.value)}
          />
          <TextField
            label="Contacto"
            placeholder="Nombre del contacto"
            value={form.nombreContacto ?? ""}
            onChange={e => upd("nombreContacto", e.target.value)}
          />
          <TextField
            label="Teléfono"
            placeholder="+57 601 000 0000"
            value={form.telefonoContacto ?? ""}
            onChange={e => upd("telefonoContacto", e.target.value)}
          />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Email"
              type="email"
              placeholder="contacto@proveedor.com"
              value={form.emailContacto ?? ""}
              onChange={e => upd("emailContacto", e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function ProveedoresPage() {
  const [lista,        setLista]        = useState<ProveedorResumen[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [detalle,      setDetalle]      = useState<Proveedor | null>(null);
  const [loadingDet,   setLoadingDet]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoProveedor | "">("");
  const [showModal,    setShowModal]    = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = isMock ? MOCK_PROVEEDORES_LIST : await proveedoresService.getAll();
      setLista(data);
    } finally {
      setLoading(false);
    }
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
      (!q || p.razonSocial.toLowerCase().includes(q) || p.nit.toLowerCase().includes(q))
    );
  });

  const activos  = lista.filter(p => p.estado === EstadoProveedor.Activo).length;
  const alertas  = lista.filter(p => p.documentosVencidos > 0 || p.documentosPorVencer > 0).length;

  const kpis = [
    { label: "Total",           value: lista.length,   color: "#CBD5E1" },
    { label: "Activos",         value: activos,         color: "#86EFAC" },
    { label: "Con alertas doc", value: alertas,         color: "#FCD34D" },
    { label: "Inactivos",       value: lista.length - activos, color: "#94A3B8" },
  ];

  return (
    <div className="ms-page">

      {/* Header */}
      <div className="ms-header">
        <div>
          <p className="ms-breadcrumb">Maestros</p>
          <h1 className="ms-title">Proveedores</h1>
          <p className="ms-subtitle">Registro y vigencias documentales de proveedores</p>
        </div>
        <div className="ms-header-actions">
          <Button variant="ghost" size="sm" onClick={cargar} loading={loading}
            iconLeft="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15">
            Actualizar
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}
            iconLeft="M12 5v14M5 12h14">
            Nuevo proveedor
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="ms-kpi-grid">
        {kpis.map(k => (
          <div key={k.label} className="ms-kpi-card">
            <p className="ms-kpi-label">{k.label}</p>
            <p className="ms-kpi-value" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="ms-filters">
        <div className="ms-search-wrap">
          <svg className="ms-search-icon" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="#475569" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por razón social o NIT…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ms-input ms-input-search"
            aria-label="Buscar proveedor"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value === "" ? "" : Number(e.target.value) as EstadoProveedor)}
          className="ms-select"
          data-empty={filtroEstado === ""}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {Object.entries(EstadoProveedorLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Body: lista + panel */}
      <div className="ms-body">

        {/* Lista */}
        <div className="ms-list" style={{ width: selectedId ? "320px" : "100%" }}>
          <div className="ms-list-header">
            <p className="ms-list-count">
              {filtrados.length} proveedor{filtrados.length !== 1 ? "es" : ""}
            </p>
          </div>
          <div className="ms-list-scroll">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="ms-skeleton-row">
                  <div className="ms-skeleton-line" style={{ height: "0.875rem", width: "60%", marginBottom: "0.5rem" }} />
                  <div className="ms-skeleton-line" style={{ height: "0.625rem", width: "35%" }} />
                </div>
              ))
              : filtrados.length === 0
              ? (
                <div className="ms-list-empty">
                  <p className="ms-list-empty-text">
                    {search || filtroEstado !== "" ? "Sin resultados." : "Sin proveedores."}
                  </p>
                </div>
              )
              : filtrados.map(p => (
                <ProveedorRow
                  key={p.id}
                  p={p}
                  active={selectedId === p.id}
                  onClick={() => setSelectedId(prev => prev === p.id ? null : p.id)}
                />
              ))
            }
          </div>
        </div>

        {/* Panel */}
        {selectedId && (
          <div className="ms-panel">
            {loadingDet ? (
              <div className="ms-panel-loading">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : detalle ? (
              <PanelDetalle prov={detalle} onClose={() => setSelectedId(null)} />
            ) : null}
          </div>
        )}

      </div>

      {showModal && (
        <ModalNuevo
          onClose={() => setShowModal(false)}
          onCreado={p => { setLista(prev => [p, ...prev]); setShowModal(false); }}
        />
      )}
    </div>
  );
}