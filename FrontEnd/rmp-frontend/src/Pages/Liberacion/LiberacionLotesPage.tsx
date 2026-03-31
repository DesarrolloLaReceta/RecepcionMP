import { useState, useEffect, useCallback } from "react";
import {
  lotesService,
  type LotePendienteDto,
} from "../../Services/lotes.service";
import { noConformidadesService } from "../../Services/no-conformidades.service";
import { useAuth } from "../../Auth/AuthContext";
import {
  Modal,
  ModalFooter,
  Button,
  Spinner,
  EmptyState,
} from "../../Components/UI/Index";
import { TextAreaField, SelectField, NumberField } from "../../Components/Forms/Index";
import { MOCK_LOTES_PENDIENTES } from "./MockData";
import "./LiberacionLotesPage.css";

// ─── CONSTANTES LOCALES ─────────────────────────────────────────────────────

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

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

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function tempOk(
  med?: number, min?: number, max?: number,
): boolean | null {
  if (med == null || min == null || max == null) return null;
  return med >= min && med <= max;
}

function urgencyColor(dias: number): { dot: string; opacity: number } {
  if (dias <= 0)  return { dot: "#EF4444", opacity: 1 };
  if (dias <= 7)  return { dot: "#F97316", opacity: 1 };
  if (dias <= 14) return { dot: "#EAB308", opacity: 0.7 };
  return           { dot: "#64748B",  opacity: 0 };
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, color, sub,
}: {
  label: string;
  value: number;
  color: string;
  sub?:  string;
}) {
  return (
    <div className="lib-kpi-card">
      <p className="lib-kpi-label">{label}</p>
      <p className="lib-kpi-value" style={{ color }}>{value}</p>
      {sub && <p className="lib-kpi-sub">{sub}</p>}
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: "ok" | "error" }) {
  return (
    <div className="lib-toast" data-type={type} role="status" aria-live="polite">
      <div className="lib-toast-dot" aria-hidden="true">
        {type === "ok"
          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" />
            </svg>
          : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
        }
      </div>
      <p className="lib-toast-text">{msg}</p>
    </div>
  );
}

// ─── MODAL: LIBERAR ──────────────────────────────────────────────────────────

function ModalLiberar({
  lote, open, onConfirm, onClose, loading,
}: {
  lote:      LotePendienteDto;
  open:      boolean;
  onConfirm: (obs: string) => void;
  onClose:   () => void;
  loading:   boolean;
}) {
  const [obs, setObs] = useState("");
  const handleObsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObs(e.target.value);
  };
  const ts = tempOk(lote.temperaturaMedida, lote.temperaturaMinima, lote.temperaturaMaxima);

  const resumen: [string, string][] = [
    ["Proveedor",   lote.proveedorNombre],
    ["Cantidad",    `${lote.cantidadRecibida} ${lote.unidadMedida}`],
    ["Vencimiento", fmtDate(lote.fechaVencimiento)],
    ["Temperatura", lote.temperaturaMedida != null
      ? `${lote.temperaturaMedida}°C ${ts === false ? "⚠" : "✓"}` : "N/A"],
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!loading}
      closeOnEsc={!loading}
      loading={loading}
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={() => onConfirm(obs)}
          cancelLabel="Cancelar"
          confirmLabel={loading ? "Liberando…" : "✓ Confirmar liberación"}
          confirmVariant="success"
          loading={loading}
        />
      }
    >
      {/* Cabecera */}
      <div className="lib-modal-head">
        <div
          className="lib-modal-icon"
          style={{
            background: "rgba(34,197,94,0.10)",
            border:     "1px solid rgba(34,197,94,0.20)",
          }}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#86EFAC" strokeWidth="2" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div>
          <p className="lib-modal-title">Liberar lote</p>
          <p className="lib-modal-subtitle">
            {lote.numeroLoteInterno} · {lote.itemNombre}
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div
        className="lib-modal-summary"
        style={{
          background: "rgba(34,197,94,0.04)",
          border:     "1px solid rgba(34,197,94,0.10)",
        }}
      >
        {resumen.map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: "0.375rem" }}>
            <span className="lib-modal-summary-key">{k}:</span>
            <span
              className="lib-modal-summary-val"
              style={{ color: k === "Temperatura" && ts === false ? "#FCA5A5" : undefined }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* Alerta docs faltantes */}
      {lote.tieneDocumentosFaltantes && (
        <div className="lib-modal-docs-warn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"
            style={{ marginTop: "1px", flexShrink: 0 }} aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
          </svg>
          <div>
            <p className="lib-modal-docs-warn-title">Documentos faltantes al liberar</p>
            {lote.documentosFaltantes.map((d: string) => (
              <p key={d} className="lib-modal-docs-warn-item">{d}</p>
            ))}
          </div>
        </div>
      )}

      {/* Observaciones */}
      <TextAreaField
        label="Observaciones de liberación"
        value={obs}
        onChange={handleObsChange}
        rows={3}
        placeholder="Verificación completada. Documentos conformes. Producto apto para proceso…"
      />
    </Modal>
  );
}

// ─── MODAL: RECHAZAR ─────────────────────────────────────────────────────────

function ModalRechazar({
  lote, open, onConfirm, onClose, loading,
}: {
  lote:      LotePendienteDto;
  open:      boolean;
  onConfirm: (causalId: string, descripcion: string, cantidadAfectada: number) => void;
  onClose:   () => void;
  loading:   boolean;
}) {
  const [causales, setCausales] = useState<{ id: string; nombre: string }[]>([]);
  const [causalId, setCausalId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidadAfectada, setCantidadAfectada] = useState<number>(lote.cantidadRecibida);

  useEffect(() => {
    if (!open) return;
    const loadCausales = async () => {
      try {
        const data = isMock ? [] : await noConformidadesService.getCausales();
        setCausales(data);
        if (data.length) setCausalId(data[0].id);
      } catch (error) {
        console.error("Error cargando causales:", error);
      }
    };
    loadCausales();
  }, [open]);

  const valid = causalId && descripcion.trim().length >= 10 && cantidadAfectada > 0 && cantidadAfectada <= lote.cantidadRecibida;

  const handleDescripcionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescripcion(e.target.value);
  };
  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCantidadAfectada(Math.min(val, lote.cantidadRecibida));
  };

  const causalOptions = causales.map(c => ({ value: c.id, label: c.nombre }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!loading}
      closeOnEsc={!loading}
      loading={loading}
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={() => onConfirm(causalId, descripcion, cantidadAfectada)}
          cancelLabel="Cancelar"
          confirmLabel={loading ? "Rechazando…" : "Confirmar rechazo"}
          confirmVariant="danger"
          loading={loading}
          disabled={!valid}
        />
      }
    >
      {/* Cabecera */}
      <div className="lib-modal-head">
        <div
          className="lib-modal-icon"
          style={{
            background: "rgba(239,68,68,0.10)",
            border:     "1px solid rgba(239,68,68,0.20)",
          }}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="lib-modal-title">Rechazar lote</p>
          <p className="lib-modal-subtitle">
            {lote.numeroLoteInterno} · {lote.itemNombre}
          </p>
        </div>
      </div>

      {/* Causal */}
      {causalOptions.length > 0 && (
        <SelectField
          label="Causal de rechazo"
          required
          options={causalOptions}
          value={causalId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCausalId(e.target.value)}
        />
      )}

      {/* Cantidad afectada */}
      <NumberField
        label="Cantidad afectada"
        required
        min={0}
        max={lote.cantidadRecibida}
        step={0.01}
        value={String(cantidadAfectada)}
        onChange={handleCantidadChange}
        hint={`Máx. ${lote.cantidadRecibida} ${lote.unidadMedida}`}
      />

      {/* Motivo / Descripción */}
      <TextAreaField
        label="Motivo del rechazo"
        required
        hint="mín. 10 caracteres"
        value={descripcion}
        onChange={handleDescripcionChange}
        rows={3}
        placeholder="Descripción detallada del motivo de rechazo…"
      />
    </Modal>
  );
}

// ─── LOTE CARD ───────────────────────────────────────────────────────────────

function LoteCard({
  lote, onLiberar, onRechazar,
}: {
  lote:       LotePendienteDto;
  onLiberar:  (l: LotePendienteDto) => void;
  onRechazar: (l: LotePendienteDto) => void;
}) {
  const urg  = urgencyColor(lote.diasParaVencer);
  const ts   = tempOk(lote.temperaturaMedida, lote.temperaturaMinima, lote.temperaturaMaxima);

  const info: [string, string][] = [
    ["Recepción",  lote.numeroRecepcion],
    ["Vence",      `${fmtDate(lote.fechaVencimiento)} (${lote.diasParaVencer}d)`],
    ["Cantidad",   `${lote.cantidadRecibida} ${lote.unidadMedida}`],
    ["Sensorial",  ESTADO_SENSORIAL_LABELS[lote.estadoSensorial] ?? "—"],
    ["Rotulado",   ESTADO_ROTULADO_LABELS[lote.estadoRotulado] ?? "—"],
    ["Temperatura", lote.temperaturaMedida != null
      ? `${lote.temperaturaMedida}°C ${ts === false ? "⚠" : "✓"}` : "N/A"],
  ];

  return (
    <div className="lib-lote-card">

      {/* Barra de urgencia superior */}
      <div
        className="lib-lote-top-bar"
        style={{
          background: urg.dot,
          opacity:    urg.opacity,
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="lib-lote-header">
        <span className="lib-lote-number">{lote.numeroLoteInterno}</span>
        <span
          className="lib-lote-categoria"
          style={{
            background: "rgba(255,255,255,0.05)",
            color:      "#64748B",
          }}
        >
          {lote.categoriaNombre}
        </span>
      </div>

      <p className="lib-lote-item">{lote.itemNombre}</p>
      <p className="lib-lote-proveedor">{lote.proveedorNombre}</p>

      {/* Grid de datos */}
      <div className="lib-lote-info">
        {info.map(([k, v]) => (
          <div key={k} className="lib-lote-info-item">
            <span className="lib-lote-info-key">{k}:</span>
            <span
              className="lib-lote-info-val"
              style={{ color: k === "Temperatura" && ts === false ? "#FCA5A5" : undefined }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* Alerta docs faltantes */}
      {lote.tieneDocumentosFaltantes && (
        <div className="lib-docs-alert">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"
            style={{ marginTop: "1px", flexShrink: 0 }} aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
          </svg>
          <div>
            <p className="lib-docs-alert-title">Documentos faltantes</p>
            {lote.documentosFaltantes.map((d: string) => (
              <p key={d} className="lib-docs-alert-item">{d}</p>
            ))}
          </div>
        </div>
      )}

      {/* Observaciones */}
      {lote.observacionesRecepcion && (
        <p className="lib-lote-obs">"{lote.observacionesRecepcion}"</p>
      )}

      {/* Acciones */}
      <div className="lib-lote-actions">
        <Button
          variant="success"
          size="sm"
          style={{ flex: 1 }}
          iconLeft="M20 6L9 17l-5-5"
          onClick={() => onLiberar(lote)}
        >
          Liberar
        </Button>
        <Button
          variant="danger"
          size="sm"
          style={{ flex: 1 }}
          iconLeft="M18 6L6 18M6 6l12 12"
          onClick={() => onRechazar(lote)}
        >
          Rechazar
        </Button>
      </div>

    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

type ModalState = { type: "liberar" | "rechazar"; lote: LotePendienteDto } | null;

export default function LiberacionLotesPage() {
  const { displayName } = useAuth();

  const [lotes,         setLotes]         = useState<LotePendienteDto[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal,         setModal]         = useState<ModalState>(null);
  const [toast,         setToast]         = useState<{ msg: string; type: "ok" | "error" } | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");

  const showToast = (msg: string, type: "ok" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = isMock
        ? MOCK_LOTES_PENDIENTES
        : await lotesService.getPendientes();
      setLotes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const kpis = {
    pendientes:    lotes.length,
    docsFaltantes: lotes.filter(l => l.tieneDocumentosFaltantes).length,
    tempFuera:     lotes.filter(l => tempOk(l.temperaturaMedida, l.temperaturaMinima, l.temperaturaMaxima) === false).length,
    urgentes:      lotes.filter(l => l.diasParaVencer <= 7).length,
  };

  const categorias = ["Todas", ...Array.from(new Set(lotes.map(l => l.categoriaNombre)))];
  const filtered = filtroCategoria === "Todas"
    ? lotes
    : lotes.filter(l => l.categoriaNombre === filtroCategoria);
  const sorted = [...filtered].sort((a, b) => a.diasParaVencer - b.diasParaVencer);

  const handleLiberar = async (obs: string) => {
    if (!modal || modal.type !== "liberar") return;
    setActionLoading(true);
    try {
      if (!isMock) await lotesService.liberar({ loteId: modal.lote.id, observaciones: obs });
      else await new Promise(r => setTimeout(r, 800));
      setLotes(p => p.filter(l => l.id !== modal.lote.id));
      setModal(null);
      showToast(`Lote ${modal.lote.numeroLoteInterno} liberado correctamente.`, "ok");
    } catch {
      showToast("Error al liberar el lote. Intenta nuevamente.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async (causalId: string, descripcion: string, cantidadAfectada: number) => {
    if (!modal || modal.type !== "rechazar") return;
    setActionLoading(true);
    try {
      if (!isMock) await lotesService.rechazar({
        loteId: modal.lote.id,
        causalId,
        descripcion,
        cantidadAfectada,
      });
      else await new Promise(r => setTimeout(r, 900));
      setLotes(p => p.filter(l => l.id !== modal.lote.id));
      setModal(null);
      showToast(`Lote ${modal.lote.numeroLoteInterno} rechazado.`, "ok");
    } catch {
      showToast("Error al rechazar el lote. Intenta nuevamente.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="lib-page">

        {/* Header */}
        <div className="lib-header">
          <div>
            <p className="lib-header-meta">
              Rol Calidad · {displayName.split(" ")[0]}
            </p>
            <h1 className="lib-header-title">Liberación de lotes</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={cargar}
            iconLeft="M23 4v6h-6M20.49 15a9 9 0 11-2.12-9.36L23 10"
            loading={loading}
          >
            Actualizar
          </Button>
        </div>

        {/* KPIs */}
        <div className="lib-kpi-grid">
          <KpiCard label="Pendientes"        value={kpis.pendientes}    color="#F59E0B" sub="lotes por revisar"     />
          <KpiCard label="Docs. faltantes"   value={kpis.docsFaltantes} color="#FCD34D" sub="requieren atención"    />
          <KpiCard label="Temp. fuera rango" value={kpis.tempFuera}     color="#FCA5A5" sub="alerta cadena frío"    />
          <KpiCard
            label="Urgentes (≤7d)"
            value={kpis.urgentes}
            color={kpis.urgentes > 0 ? "#FCA5A5" : "#86EFAC"}
            sub="días para vencer"
          />
        </div>

        {/* Chips de categoría */}
        <div className="lib-chips">
          {categorias.map(cat => (
            <button
              key={cat}
              className="lib-chip"
              data-active={filtroCategoria === cat}
              onClick={() => setFiltroCategoria(cat)}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de lotes */}
        <div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
              <Spinner size="lg" />
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              title="¡Sin pendientes!"
              subtitle="No hay lotes esperando liberación en este momento."
              icon="M20 6L9 17l-5-5"
              iconColor="#86EFAC"
            />
          ) : (
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap:                 "1rem",
            }}>
              {sorted.map(lote => (
                <LoteCard
                  key={lote.id}
                  lote={lote}
                  onLiberar={l  => setModal({ type: "liberar",  lote: l })}
                  onRechazar={l => setModal({ type: "rechazar", lote: l })}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modales */}
      {modal?.lote && (
        <>
          <ModalLiberar
            lote={modal.lote}
            open={modal.type === "liberar"}
            onConfirm={handleLiberar}
            onClose={() => !actionLoading && setModal(null)}
            loading={actionLoading}
          />
          <ModalRechazar
            lote={modal.lote}
            open={modal.type === "rechazar"}
            onConfirm={handleRechazar}
            onClose={() => !actionLoading && setModal(null)}
            loading={actionLoading}
          />
        </>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}