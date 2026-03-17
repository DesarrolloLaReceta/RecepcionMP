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

const isMock = import.meta.env.VITE_USE_MOCK === "true";

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
          {(p.categorias?.length ?? 0) > 0 && (
            <div className="pv-cats">
              {p.categorias?.slice(0, 3).map(c => (
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

// ─── TIPOS AUXILIARES ─────────────────────────────────────────────────────────

interface FormEdicion {
  razonSocial: string;
  telefono: string;
  emailContacto: string;
  direccion: string;
  estado: EstadoProveedor;
}

interface FormDocumento {
  tipoDocumento: string;
  numeroDocumento: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  archivo: File | null;
}

// ─── PANEL DETALLE ────────────────────────────────────────────────────────────

function PanelDetalle({
  prov, onClose, onActualizado,
}: {
  prov: Proveedor;
  onClose: () => void;
  onActualizado: () => void;
}) {
  const [tab, setTab]             = useState<"info" | "docs">("info");
  const [editando, setEditando]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [mostrarFormDoc, setMostrarFormDoc] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const TipoDocumentoOptions = [
    { value: 0, label: "Factura" },
    { value: 1, label: "Orden de Compra" },
    { value: 2, label: "Certificado de Análisis (COA)" },
    { value: 3, label: "Registro INVIMA" },
    { value: 4, label: "Certificado de Transporte" },
    { value: 5, label: "Bitácora de Temperatura" },
    { value: 6, label: "Rotulado" },
    { value: 7, label: "Otro" },
  ];

  const [form, setForm] = useState<FormEdicion>({
    razonSocial:   prov.razonSocial,
    telefono:      prov.telefono ?? "",
    emailContacto: prov.emailContacto ?? "",
    direccion:     prov.direccion ?? "",
    estado:        prov.estado,
  });

  const [formDoc, setFormDoc] = useState<FormDocumento>({
    tipoDocumento:   "",
    numeroDocumento: "",
    fechaExpedicion: "",
    fechaVencimiento:"",
    archivo:         null,
  });

  const upd = (k: keyof FormEdicion, v: string | EstadoProveedor) =>
    setForm(p => ({ ...p, [k]: v }));

  const updDoc = (k: keyof FormDocumento, v: string | File | null) =>
    setFormDoc(p => ({ ...p, [k]: v }));

  const guardar = async () => {
    setSaving(true);
    try {
      await proveedoresService.actualizar({
        id:            prov.id,
        razonSocial:   form.razonSocial,
        telefono:      form.telefono || undefined,
        emailContacto: form.emailContacto || undefined,
        direccion:     form.direccion || undefined,
        estado:        form.estado,
      });
      setEditando(false);
      onActualizado();
    } finally {
      setSaving(false);
    }
  };

  const subirDocumento = async () => {
    if (!formDoc.archivo || !formDoc.tipoDocumento || 
        !formDoc.numeroDocumento || !formDoc.fechaExpedicion || 
        !formDoc.fechaVencimiento) return;
    setSubiendoDoc(true);
    try {
      await proveedoresService.subirDocumento(prov.id, formDoc.tipoDocumento, formDoc.numeroDocumento, formDoc.fechaExpedicion, formDoc.fechaVencimiento, formDoc.archivo);
      setMostrarFormDoc(false);
      setFormDoc({ tipoDocumento: "", numeroDocumento: "", fechaExpedicion: "", fechaVencimiento: "", archivo: null });
      onActualizado();
    } finally {
      setSubiendoDoc(false);
    }
  };

  const contactoPrincipal = prov.contactos?.find(c => c.esPrincipal) ?? prov.contactos?.[0];

  const kpis = [
    { label: "Recepciones", val: String(prov.totalRecepciones ?? 0), color: "#CBD5E1" },
    { label: "Tasa acept.", val: prov.tasaAceptacion != null ? `${prov.tasaAceptacion.toFixed(1)}%` : "—",
      color: prov.tasaAceptacion != null ? (prov.tasaAceptacion >= 95 ? "#86EFAC" : prov.tasaAceptacion >= 80 ? "#FCD34D" : "#FCA5A5") : "#64748B" },
    { label: "Última rec.", val: formatDate(prov.ultimaRecepcion), color: "#94A3B8" },
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
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {!editando && (
            <button
              className="ms-btn-icon"
              onClick={() => setEditando(true)}
              title="Editar proveedor"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem", borderRadius: "6px",
                       background: "var(--surface-2)", border: "1px solid var(--border)",
                       color: "var(--text-secondary)", cursor: "pointer" }}
            >
              Editar
            </button>
          )}
          <button className="pv-panel-close" onClick={onClose} aria-label="Cerrar panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
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
          { key: "docs", label: `Documentos (${prov.documentosSanitarios?.length ?? 0})` },
        ] as const).map(t => (
          <button key={t.key} className="ms-tab" data-active={tab === t.key}
            onClick={() => { setTab(t.key); setEditando(false); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="ms-panel-body">

        {/* ── TAB INFO ── */}
        {tab === "info" && !editando && (
          <div className="ms-info-grid">
            {/* Datos del proveedor */}
            {[
              { label: "Teléfono empresa",  val: prov.telefono },
              { label: "Email empresa",     val: prov.emailContacto },
              { label: "Dirección",         val: prov.direccion },
              { label: "Activo desde",      val: formatDate(prov.creadoEn) },
            ].filter(f => f.val).map(({ label, val }) => (
              <div key={label} className="ms-info-card">
                <p className="ms-info-label">{label}</p>
                <p className="ms-info-value">{val}</p>
              </div>
            ))}

            {/* Contacto principal */}
            {contactoPrincipal && (
              <>
                <div className="ms-info-card" style={{ gridColumn: "1 / -1" }}>
                  <p className="ms-info-label" style={{ color: "var(--primary)", fontWeight: 600 }}>
                    Contacto principal
                  </p>
                </div>
                {[
                  { label: "Nombre",  val: contactoPrincipal.nombre },
                  { label: "Cargo",   val: contactoPrincipal.cargo },
                  { label: "Teléfono", val: contactoPrincipal.telefono },
                  { label: "Email",   val: contactoPrincipal.email },
                ].filter(f => f.val).map(({ label, val }) => (
                  <div key={label} className="ms-info-card">
                    <p className="ms-info-label">{label}</p>
                    <p className="ms-info-value">{val}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── MODO EDICIÓN ── */}
        {tab === "info" && editando && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <TextField label="Razón social" required
              value={form.razonSocial}
              onChange={e => upd("razonSocial", e.target.value)} />
            <TextField label="Teléfono"
              value={form.telefono}
              onChange={e => upd("telefono", e.target.value)} />
            <TextField label="Email" type="email"
              value={form.emailContacto}
              onChange={e => upd("emailContacto", e.target.value)} />
            <TextField label="Dirección"
              value={form.direccion}
              onChange={e => upd("direccion", e.target.value)} />

            {/* Estado */}
            <div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                Estado
              </p>
              <select
                value={form.estado}
                onChange={e => upd("estado", Number(e.target.value) as EstadoProveedor)}
                className="ms-select"
                style={{ width: "100%" }}
              >
                {Object.entries(EstadoProveedorLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <button
                onClick={() => setEditando(false)}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "6px",
                         background: "var(--surface-2)", border: "1px solid var(--border)",
                         color: "var(--text-secondary)", cursor: "pointer", fontSize: "var(--text-sm)" }}
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={saving || !form.razonSocial.trim()}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "6px",
                         background: "var(--primary)", border: "none",
                         color: "#fff", cursor: "pointer", fontSize: "var(--text-sm)",
                         opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB DOCS ── */}
        {tab === "docs" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                Vigencias de habilitaciones sanitarias.
              </p>
              <button
                onClick={() => setMostrarFormDoc(v => !v)}
                style={{ fontSize: "0.7rem", padding: "0.25rem 0.625rem", borderRadius: "6px",
                         background: "var(--surface-2)", border: "1px solid var(--border)",
                         color: "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {mostrarFormDoc ? "Cancelar" : "+ Subir documento"}
              </button>
            </div>

            {/* Form subir documento */}
            {mostrarFormDoc && (
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)",
                            borderRadius: "8px", padding: "0.75rem",
                            display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
                
                {/* ← Reemplaza el TextField de tipo */}
                <div>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                    Tipo de documento
                  </p>
                  <select
                    value={formDoc.tipoDocumento}
                    onChange={e => updDoc("tipoDocumento", e.target.value)}
                    className="ms-select"
                    style={{ width: "100%" }}
                  >
                    <option value="">Seleccionar tipo…</option>
                    {TipoDocumentoOptions.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <TextField label="Número de documento"
                  value={formDoc.numeroDocumento}
                  onChange={e => updDoc("numeroDocumento", e.target.value)} />
                <TextField label="Fecha expedición" type="date"
                  value={formDoc.fechaExpedicion}
                  onChange={e => updDoc("fechaExpedicion", e.target.value)} />
                <TextField label="Fecha vencimiento" type="date"
                  value={formDoc.fechaVencimiento}
                  onChange={e => updDoc("fechaVencimiento", e.target.value)} />

                <div>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                    Archivo (PDF, JPG, PNG — máx. 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => updDoc("archivo", e.target.files?.[0] ?? null)}
                    style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}
                  />
                </div>

                <button
                  onClick={subirDocumento}
                  disabled={subiendoDoc || !formDoc.archivo || !formDoc.tipoDocumento ||
                            !formDoc.numeroDocumento || !formDoc.fechaExpedicion || !formDoc.fechaVencimiento}
                  style={{ padding: "0.5rem", borderRadius: "6px",
                          background: "var(--primary)", border: "none",
                          color: "#fff", cursor: "pointer", fontSize: "var(--text-sm)",
                          opacity: subiendoDoc ? 0.7 : 1, marginTop: "0.25rem" }}
                >
                  {subiendoDoc ? "Subiendo…" : "Subir documento"}
                </button>
              </div>
            )}

            {/* Lista de documentos */}
            {(prov.documentosSanitarios?.length ?? 0) === 0 ? (
              <p style={{ fontSize: "var(--text-md)", color: "var(--text-tertiary)" }}>
                Sin documentos registrados.
              </p>
            ) : (
              prov.documentosSanitarios!.map(doc => {
                console.log("Documento:", doc);
                const color = diasColor(doc.diasParaVencer);
                const urlArchivo = doc.adjuntoUrl
                  ? `http://localhost:5013${doc.adjuntoUrl}`
                  : null;

                return (
                  <div key={doc.id} className="ms-doc-row" style={{position: "relative"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#475569" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="ms-doc-name" style={{ flex: 1 }}>{doc.tipoDocumento}</span>
                    <div className="pv-doc-vencimiento">
                      <span className="ms-doc-dias" style={{ color }}>
                        {doc.diasParaVencer != null
                          ? doc.diasParaVencer <= 0 ? "Vencido" : `${doc.diasParaVencer}d`
                          : "—"}
                      </span>
                    </div>
                    {urlArchivo && (
                      <div style={{ display: "flex", gap: "0.25rem", marginLeft: "0.5rem" }}>
                        <a
                          href={urlArchivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver documento"
                          style={{ color: "var(--text-muted)", lineHeight: 1 }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </a>
                        <a
                          href={urlArchivo}
                          download
                          title="Descargar documento"
                          style={{ color: "var(--text-muted)", lineHeight: 1 }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </a>
                      </div>
                    )}
                    {/* Botón eliminar */}
                    <button
                      onClick={() => setDeletingDocId(doc.id)}
                      title="Eliminar documento"
                      style={{ background: "none", border: "none", cursor: "pointer",
                               color: "#FCA5A5", padding: "0 0.125rem", lineHeight: 1,
                               marginLeft: "0.125rem" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>

                    {/* Confirmación inline */}
                    {deletingDocId === doc.id && (
                      <div style={{ position: "absolute", inset: 0,
                                    background: "var(--surface)", border: "1px solid var(--border)",
                                    borderRadius: "8px", display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    gap: "0.5rem", zIndex: 10, padding: "0.75rem" }}>
                        <p style={{ fontSize: "var(--text-sm)", textAlign: "center",
                                    color: "var(--text-primary)", fontWeight: 500, margin: 0 }}>
                          ¿Eliminar este documento?
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>
                          Esta acción no se puede deshacer.
                        </p>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => setDeletingDocId(null)}
                            style={{ padding: "0.25rem 0.75rem", borderRadius: "6px",
                                     background: "var(--surface-2)", border: "1px solid var(--border)",
                                     color: "var(--text-secondary)", cursor: "pointer",
                                     fontSize: "0.7rem" }}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await proveedoresService.eliminarDocumentoSanitario(prov.id, doc.id);
                                setDeletingDocId(null);
                                onActualizado();
                              } catch {
                                alert("Error al eliminar el documento.");
                              }
                            }}
                            style={{ padding: "0.25rem 0.75rem", borderRadius: "6px",
                                     background: "#EF4444", border: "none",
                                     color: "#fff", cursor: "pointer", fontSize: "0.7rem" }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
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
      const { id } = isMock
        ? { id: `prov-${Date.now()}` }
        : await proveedoresService.crear(form as CrearProveedorCommand);
      onCreado({
        id,
        razonSocial: form.razonSocial!,
        nit: form.nit!,
        direccion: form.direccion,
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
            <TextField label="Razón social" required
              value={form.razonSocial ?? ""} onChange={e => upd("razonSocial", e.target.value)} />
          </div>
          <TextField label="NIT" required placeholder="800.000.000-1"
            value={form.nit ?? ""} onChange={e => upd("nit", e.target.value)} />
          <TextField label="Teléfono" placeholder="+57 601 000 0000"
            value={form.telefono ?? ""} onChange={e => upd("telefono", e.target.value)} />
          <TextField label="Email empresa" type="email"
            value={form.emailContacto ?? ""} onChange={e => upd("emailContacto", e.target.value)} />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextField label="Dirección" placeholder="Cra 1 # 2-3, Bogotá"
              value={form.direccion ?? ""} onChange={e => upd("direccion", e.target.value)} />
          </div>

          {/* Separador contacto */}
          <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Contacto principal (opcional)
            </p>
          </div>
          <TextField label="Nombre contacto"
            value={form.nombreContacto ?? ""} onChange={e => upd("nombreContacto", e.target.value)} />
          <TextField label="Cargo"
            value={form.cargoContacto ?? ""} onChange={e => upd("cargoContacto", e.target.value)} />
          <TextField label="Teléfono contacto"
            value={form.telefonoContacto ?? ""} onChange={e => upd("telefonoContacto", e.target.value)} />
          <TextField label="Email contacto" type="email"
            value={form.emailContactoProveedor ?? ""} onChange={e => upd("emailContactoProveedor", e.target.value)} />
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
              <PanelDetalle
                prov={detalle}
                onClose={() => setSelectedId(null)}
                onActualizado={() => {
                  // Recarga la lista y el detalle
                  cargar();
                  if (selectedId) {
                    setLoadingDet(true);
                    proveedoresService.getById(selectedId)
                      .then(d => setDetalle(d))
                      .finally(() => setLoadingDet(false));
                  }
                }}
              />
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