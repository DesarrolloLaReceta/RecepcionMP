import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { recepcionesService } from "../../Services/recepciones.service";
import { ordenesCompraService, type OrdenCompraResumen } from "../../Services/ordenes-compra.service";
import { ROUTES } from "../../Constants/routes";
import { Button } from "../../Components/UI/Index";
import {
  TextField, DateField, NumberField, TextAreaField, SelectField,
} from "../../Components/Forms/Index";
import { MOCK_OC_ABIERTAS } from "../OrdenesCompra/MockData";
import "./StylesRecepciones/NuevaRecepcionPage.css";

const isMock = import.meta.env.VITE_USE_MOCK === "true";
const today   = new Date().toISOString().slice(0, 10);
const nowTime = new Date().toTimeString().slice(0, 5);
const DEV_USER_ID = "a0000000-0000-0000-0000-000000000001";


// ===== CONSTANTES LOCALES PARA ENUMS (coinciden con backend) =====

const ESTADO_SENSORIAL = {
  Optimo: 0,
  Aceptable: 1,
  Deficiente: 2,
} as const;
type EstadoSensorial = typeof ESTADO_SENSORIAL[keyof typeof ESTADO_SENSORIAL];

const ESTADO_SENSORIAL_LABELS: Record<EstadoSensorial, string> = {
  [ESTADO_SENSORIAL.Optimo]: "Óptimo",
  [ESTADO_SENSORIAL.Aceptable]: "Aceptable",
  [ESTADO_SENSORIAL.Deficiente]: "Deficiente",
};

const ESTADO_ROTULADO = {
  Conforme: 0,
  NoConforme: 1,
  SinRotulo: 2,
} as const;
type EstadoRotulado = typeof ESTADO_ROTULADO[keyof typeof ESTADO_ROTULADO];

const ESTADO_ROTULADO_LABELS: Record<EstadoRotulado, string> = {
  [ESTADO_ROTULADO.Conforme]: "Conforme",
  [ESTADO_ROTULADO.NoConforme]: "No conforme",
  [ESTADO_ROTULADO.SinRotulo]: "Sin rótulo",
};

const UBICACION_DESTINO = {
  CD: 0,
  CP: 1,
} as const;
type UbicacionDestino = typeof UBICACION_DESTINO[keyof typeof UBICACION_DESTINO];

const UBICACION_LABELS: Record<UbicacionDestino, string> = {
  [UBICACION_DESTINO.CD]: "Centro de Despacho",
  [UBICACION_DESTINO.CP]: "Centro de Producción",
};

const TIPO_DOCUMENTO = {
  Factura: 0,
  OrdendeCompra: 1,
  COA: 2,
  RegistroINVIMA: 3,
  CertTransporte: 4,
  BitacoraTemperatura: 5,
  Rotulado: 6,
  Otros: 7,
} as const;
type TipoDocumento = typeof TIPO_DOCUMENTO[keyof typeof TIPO_DOCUMENTO];

const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  [TIPO_DOCUMENTO.Factura]: "Factura",
  [TIPO_DOCUMENTO.OrdendeCompra]: "Orden de compra",
  [TIPO_DOCUMENTO.COA]: "Certificado de análisis (COA)",
  [TIPO_DOCUMENTO.RegistroINVIMA]: "Registro INVIMA",
  [TIPO_DOCUMENTO.CertTransporte]: "Certificado de transporte",
  [TIPO_DOCUMENTO.BitacoraTemperatura]: "Bitácora de temperatura",
  [TIPO_DOCUMENTO.Rotulado]: "Rotulado",
  [TIPO_DOCUMENTO.Otros]: "Otro",
};

// ── Tipos internos del wizard ─────────────────────────────────────────────────

interface LoteForm {
  detalleOcId:         string;
  itemId:              string;
  itemNombre:          string;
  categoriaFrio:       boolean;
  temperaturaMinima?:  number;
  temperaturaMaxima?:  number;
  unidadMedida:        string;   // ← viene de la OC
  cantidadEsperada:    number;
  numeroLoteProveedor: string;
  fechaFabricacion:    string;
  fechaVencimiento:    string;
  cantidadRecibida:    string;
  temperaturaMedida:   string;
  estadoSensorial:     EstadoSensorial;
  estadoRotulado:      EstadoRotulado;
  ubicacionDestino:    UbicacionDestino;
}

interface WizardState {
  ocSeleccionada:         OrdenCompraResumen | null;
  fechaRecepcion:         string;
  horaLlegada:            string;
  placaVehiculo:          string;
  nombreTransportista:    string;
  observaciones:          string;
  tempInicial:            string;
  temperaturaDentroRango: boolean;
  integridadEmpaque:      boolean;
  limpiezaVehiculo:       boolean;
  oloresExtranos:         boolean;
  plagasVisible:          boolean;
  documentosTransporteOk: boolean;
  obsInspeccion:          string;
  lotes:                  LoteForm[];
  documentos:             { tipo: TipoDocumento; archivo: File | null }[];
}

function initWizard(): WizardState {
  return {
    ocSeleccionada: null,
    fechaRecepcion: today, horaLlegada: nowTime,
    placaVehiculo: "", nombreTransportista: "", observaciones: "",
    tempInicial: "",
    temperaturaDentroRango: false, integridadEmpaque: false,
    limpiezaVehiculo: false, oloresExtranos: true, plagasVisible: true,
    documentosTransporteOk: false,
    obsInspeccion: "",
    lotes: [], documentos: [],
  };
}

function buildLotes(oc: OrdenCompraResumen): LoteForm[] {
  return oc.detalles.map(d => ({
    detalleOcId:         d.id,
    itemId:              d.itemId,
    itemNombre:          d.itemNombre,
    categoriaFrio:       d.requiereCadenaFrio,
    temperaturaMinima:   d.temperaturaMinima,
    temperaturaMaxima:   d.temperaturaMaxima,
    unidadMedida:        d.unidadMedida,
    cantidadEsperada:    d.cantidadSolicitada,
    numeroLoteProveedor: "",
    fechaFabricacion:    "",
    fechaVencimiento:    "",
    cantidadRecibida:    String(d.cantidadSolicitada),
    temperaturaMedida:   "",
    estadoSensorial:     ESTADO_SENSORIAL.Aceptable,
    estadoRotulado:      ESTADO_ROTULADO.Conforme,
    ubicacionDestino:    UBICACION_DESTINO.CD,
  }));
}

// ── STEP BAR ──────────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "OC" },
  { n: 2, label: "Check-in" },
  { n: 3, label: "Inspección" },
  { n: 4, label: "Lotes" },
  { n: 5, label: "Documentos" },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="nr-stepbar">
      {STEPS.map((s, i) => {
        const state = s.n < current ? "done" : s.n === current ? "active" : "pending";
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div className="nr-step-wrap">
              <div className="nr-step-circle" data-state={state}>
                {state === "done"
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  : s.n}
              </div>
              <span className="nr-step-label" data-state={state}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="nr-step-line"
                data-done={s.n < current}
                style={{ marginBottom: "1.25rem" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Toggle BPM ────────────────────────────────────────────────────────────────

function Toggle({
  on, onChange, label, subLabel,
}: {
  on: boolean; onChange: (v: boolean) => void;
  label: string; subLabel?: string;
}) {
  return (
    <div className="nr-toggle-row">
      <div className="nr-toggle-info">
        <p className="nr-toggle-label">{label}</p>
        {subLabel && <p className="nr-toggle-sub">{subLabel}</p>}
      </div>
      <button
        type="button" className="nr-toggle-btn"
        data-on={on} onClick={() => onChange(!on)} aria-pressed={on}
      >
        <span className="nr-toggle-knob" />
      </button>
    </div>
  );
}

// ── PASO 1: Seleccionar OC ────────────────────────────────────────────────────

function Paso1OC({
  state, setState, onNext,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onNext: () => void;
}) {
  const [query,   setQuery]   = useState("");
  const [ocs,     setOcs]     = useState<OrdenCompraResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const buscar = useCallback(async () => {
    setLoading(true); setBuscado(true);
    try {
      const data = isMock
        ? MOCK_OC_ABIERTAS.filter(o =>
            !query ||
            o.numeroOC.toLowerCase().includes(query.toLowerCase()) ||
            o.proveedorNombre.toLowerCase().includes(query.toLowerCase()))
        : await ordenesCompraService.getAbiertas();
      setOcs(data);
    } finally { setLoading(false); }
  }, [query]);

  const seleccionar = (oc: OrdenCompraResumen) =>
    setState(p => ({ ...p, ocSeleccionada: oc, lotes: buildLotes(oc) }));

  return (
    <div className="nr-form-grid-1">
      <div>
        <h2 className="nr-step-title">Orden de Compra</h2>
        <p className="nr-step-sub">
          Busca y selecciona la OC para iniciar la recepción.
        </p>
      </div>

      <div className="nr-search-row">
        <div className="nr-search-wrap">
          <svg className="nr-search-icon" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="#475569" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            className="nr-search-input" type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && buscar()}
            placeholder="N.° OC o proveedor…"
            aria-label="Buscar OC"
          />
        </div>
        <Button variant="secondary" size="sm" loading={loading} onClick={buscar}>
          Buscar
        </Button>
      </div>

      {buscado && ocs.length === 0 && !loading && (
        <div className="nr-oc-empty">
          No se encontraron órdenes de compra abiertas.
        </div>
      )}

      {!buscado && (
        <div className="nr-oc-placeholder">
          Busca una OC para comenzar la recepción.
        </div>
      )}

      {ocs.length > 0 && (
        <div className="nr-oc-list">
          {ocs.map(oc => (
            <button
              key={oc.id} className="nr-oc-card"
              data-active={state.ocSeleccionada?.id === oc.id}
              onClick={() => seleccionar(oc)}
            >
              <div className="nr-oc-card-top">
                <span className="nr-oc-num">{oc.numeroOC}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {oc.totalItems} ítem{oc.totalItems !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="nr-oc-prov">{oc.proveedorNombre}</p>
              <div className="nr-oc-items-wrap" style={{ marginTop: "0.5rem" }}>
                {oc.detalles.map(d => (
                  <span key={d.id} className="nr-oc-item-tag">
                    {d.itemNombre} · {d.cantidadSolicitada} {d.unidadMedida}
                    {d.requiereCadenaFrio ? " ❄" : ""}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="nr-step-nav">
        <span />
        <Button
          variant="primary" size="sm"
          disabled={!state.ocSeleccionada} onClick={onNext}
          iconRight="M9 18l6-6-6-6"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

// ── PASO 2: Check-in ──────────────────────────────────────────────────────────

function Paso2Checkin({
  state, setState, onNext, onBack,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onNext: () => void; onBack: () => void;
}) {
  const upd = (field: keyof WizardState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setState(p => ({ ...p, [field]: e.target.value }));

  const valid = state.fechaRecepcion && state.horaLlegada;

  return (
    <div className="nr-form-grid-1">
      <div>
        <h2 className="nr-step-title">Check-in del vehículo</h2>
        <p className="nr-step-sub">
          Datos de llegada del proveedor{" "}
          <em>{state.ocSeleccionada?.proveedorNombre}</em>.
        </p>
      </div>

      <div className="nr-form-grid-2">
        <DateField
          label="Fecha de recepción" required
          value={state.fechaRecepcion}
          onChange={upd("fechaRecepcion")} max={today}
        />
        <TextField
          label="Hora de llegada" required type="time"
          value={state.horaLlegada}
          onChange={upd("horaLlegada")}
        />
      </div>
      <div className="nr-form-grid-2">
        <TextField
          label="Placa del vehículo" placeholder="Ej: ABC-123"
          value={state.placaVehiculo}
          onChange={upd("placaVehiculo")}
        />
        <TextField
          label="Transportista" placeholder="Nombre del conductor / empresa"
          value={state.nombreTransportista}
          onChange={upd("nombreTransportista")}
        />
      </div>
      <TextAreaField
        label="Observaciones generales" rows={2}
        placeholder="Novedades al llegar…"
        value={state.observaciones}
        onChange={upd("observaciones")}
      />

      <div className="nr-step-nav">
        <button className="nr-back-step-btn" onClick={onBack}>← Atrás</button>
        <Button
          variant="primary" size="sm"
          disabled={!valid} onClick={onNext}
          iconRight="M9 18l6-6-6-6"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

// ── PASO 3: Inspección vehículo ───────────────────────────────────────────────

function Paso3Inspeccion({
  state, setState, onNext, onBack,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onNext: () => void; onBack: () => void;
}) {
  const tieneCongelados = state.lotes.some(l => l.categoriaFrio);

  // Validación: si requiere cadena de frío, la temperatura inicial no puede estar vacía
  const isValid = !tieneCongelados || (state.tempInicial.trim() !== "");

  const CHECKS: {
    key: keyof WizardState; label: string; sub: string; critical?: boolean;
  }[] = [
    { key: "temperaturaDentroRango", label: "Temperatura dentro de rango",
      sub: "El vehículo mantiene la cadena de frío requerida",
      critical: tieneCongelados },
    { key: "integridadEmpaque",      label: "Integridad de empaque",
      sub: "Sin empaques rotos, húmedos o con signos de deterioro" },
    { key: "limpiezaVehiculo",       label: "Limpieza del vehículo",
      sub: "Interior libre de suciedad, residuos o contaminantes" },
    { key: "documentosTransporteOk", label: "Documentos de transporte OK",
      sub: "Bitácora de temperatura y documentos exigidos presentes" },
    { key: "oloresExtranos",         label: "Sin olores extraños",
      sub: "Ausencia de olores que indiquen contaminación" },
    { key: "plagasVisible",          label: "Sin evidencia de plagas",
      sub: "No se observan insectos, roedores o sus huellas" },
  ];

  return (
    <div className="nr-form-grid-1">
      <div>
        <h2 className="nr-step-title">Inspección del vehículo</h2>
        <p className="nr-step-sub">Checklist BPM — Res. 2674/2013.</p>
      </div>

      {tieneCongelados && (
        <div className="nr-frio-box">
          <div className="nr-frio-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#93C5FD" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v20M12 2l-4 4M12 2l4 4" />
            </svg>
            <p className="nr-frio-label">Temperatura inicial del compartimento</p>
          </div>
          <div className="nr-temp-row">
            <NumberField
              label="" placeholder="Ej: 3.5" step={0.1}
              value={state.tempInicial}
              onChange={e => setState(p => ({ ...p, tempInicial: e.target.value }))}
            />
            <span className="nr-temp-unit">°C</span>
          </div>
        </div>
      )}

      <div className="nr-toggles-card">
        {CHECKS.map(({ key, label, sub, critical }) => (
          <Toggle
            key={key}
            on={key === "oloresExtranos" || key === "plagasVisible"
              ? !(state[key] as boolean)
              : !!(state[key] as boolean)}
            onChange={v => {
              const val = key === "oloresExtranos" || key === "plagasVisible" ? !v : v;
              setState(p => ({ ...p, [key]: val }));
            }}
            label={critical ? `${label}` : label}
            subLabel={sub}
          />
        ))}
      </div>

      <TextAreaField
        label="Observaciones de la inspección" rows={2}
        placeholder="Novedades observadas durante la inspección…"
        value={state.obsInspeccion}
        onChange={e => setState(p => ({ ...p, obsInspeccion: e.target.value }))}
      />

      <div className="nr-step-nav">
        <button className="nr-back-step-btn" onClick={onBack}>← Atrás</button>
        <Button
          variant="primary" size="sm"
          onClick={onNext}
          disabled={!isValid}
          iconRight="M9 18l6-6-6-6"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

// ── PASO 4: Registro de lotes ─────────────────────────────────────────────────

function Paso4Lotes({
  state, setState, onNext, onBack,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onNext: () => void; onBack: () => void;
}) {
  const [activeLote, setActiveLote] = useState(0);

  const updLote = (idx: number, field: keyof LoteForm, value: unknown) =>
    setState(p => {
      const lotes = [...p.lotes];
      lotes[idx] = { ...lotes[idx], [field]: value };
      return { ...p, lotes };
    });

  const lote = state.lotes[activeLote];

  // Función que determina si un lote está completamente diligenciado
  const isLoteCompleto = (lote: LoteForm): boolean => {
    // Campos siempre obligatorios
    if (!lote.fechaVencimiento) return false;
    const cantidad = Number(lote.cantidadRecibida);
    if (isNaN(cantidad) || cantidad <= 0) return false;
    if (lote.estadoSensorial === undefined) return false;
    if (lote.estadoRotulado === undefined) return false;
    if (lote.ubicacionDestino === undefined) return false;

    // Si requiere cadena de frío, la temperatura medida es obligatoria
    if (lote.categoriaFrio) {
      if (!lote.temperaturaMedida || lote.temperaturaMedida.trim() === "") return false;
      const temp = Number(lote.temperaturaMedida);
      if (isNaN(temp)) return false;
    }

    return true;
  };

  const completos = state.lotes.filter(isLoteCompleto).length;
  const todosCompletos = completos === state.lotes.length;

  const sensorialOpts = Object.entries(ESTADO_SENSORIAL_LABELS).map(
    ([k, v]) => ({ value: k, label: v })
  );
  const rotuladoOpts = Object.entries(ESTADO_ROTULADO_LABELS).map(
    ([k, v]) => ({ value: k, label: v })
  );
  const ubicacionOpts = Object.entries(UBICACION_LABELS).map(
    ([k, v]) => ({ value: k, label: v })
  );

  const tempFuera = lote.categoriaFrio &&
    lote.temperaturaMedida !== "" && (
      Number(lote.temperaturaMedida) < (lote.temperaturaMinima ?? -Infinity) ||
      Number(lote.temperaturaMedida) > (lote.temperaturaMaxima ?? Infinity)
    );

  return (
    <div className="nr-form-grid-1">
      <div>
        <h2 className="nr-step-title">Registro de lotes</h2>
        <p className="nr-step-sub">
          Completa los datos de cada ítem.{" "}
          <em>{completos}/{state.lotes.length}</em> lotes completos.
        </p>
      </div>

      {/* Tabs de ítems */}
      <div className="nr-lote-tabs">
        {state.lotes.map((l, i) => {
          const ok = isLoteCompleto(l);
          return (
            <button
              key={i} className="nr-lote-tab"
              data-active={activeLote === i}
              onClick={() => setActiveLote(i)}
            >
              {ok && <span className="nr-lote-ok-dot" />}
              {l.itemNombre}
            </button>
          );
        })}
      </div>

      {/* Campos del lote activo */}
      <div className="nr-lote-body">
        <div className="nr-form-grid-2">
          <TextField
            label="Lote proveedor"
            placeholder="Ej: LOT-20260101"
            value={lote.numeroLoteProveedor}
            onChange={e => updLote(activeLote, "numeroLoteProveedor", e.target.value)}
          />
          <div className="nr-qty-wrap">
            <NumberField
              label="Cantidad recibida *"
              required
              placeholder="0"
              min={0}
              step={0.01}
              value={lote.cantidadRecibida}
              onChange={e => updLote(activeLote, "cantidadRecibida", e.target.value)}
            />
            <span className="nr-qty-um">{lote.unidadMedida}</span>
          </div>
        </div>

        <div className="nr-form-grid-2">
          <DateField
            label="Fecha fabricación"
            max={today}
            value={lote.fechaFabricacion}
            onChange={e => updLote(activeLote, "fechaFabricacion", e.target.value)}
          />
          <DateField
            label="Fecha vencimiento *"
            required
            min={today}
            value={lote.fechaVencimiento}
            onChange={e => updLote(activeLote, "fechaVencimiento", e.target.value)}
          />
        </div>

        {lote.categoriaFrio && (
          <div>
            <div className="nr-qty-wrap">
              <NumberField
                label="Temperatura medida (°C) *"
                required
                placeholder="Ej: 3.2"
                step={0.1}
                value={lote.temperaturaMedida}
                onChange={e => updLote(activeLote, "temperaturaMedida", e.target.value)}
              />
              <span className="nr-qty-um">°C</span>
            </div>
            {tempFuera
              ? <p className="nr-temp-bad">
                  ⚠ Fuera del rango aceptable (
                  {lote.temperaturaMinima}°C – {lote.temperaturaMaxima}°C)
                </p>
              : <p className="nr-temp-hint">
                  Rango aceptable: {lote.temperaturaMinima}°C – {lote.temperaturaMaxima}°C
                </p>
            }
          </div>
        )}

        <div className="nr-form-grid-2">
          <SelectField
            label="Estado sensorial *"
            options={sensorialOpts}
            value={String(lote.estadoSensorial)}
            onChange={e => updLote(activeLote, "estadoSensorial", Number(e.target.value))}
          />
          <SelectField
            label="Estado de rotulado *"
            options={rotuladoOpts}
            value={String(lote.estadoRotulado)}
            onChange={e => updLote(activeLote, "estadoRotulado", Number(e.target.value))}
          />
        </div>

        <SelectField
          label="Ubicación destino *"
          options={ubicacionOpts}
          value={String(lote.ubicacionDestino)}
          onChange={e => updLote(activeLote, "ubicacionDestino", Number(e.target.value))}
        />
      </div>

      {/* Nav entre lotes */}
      {state.lotes.length > 1 && (
        <div className="nr-lote-nav">
          <button
            className="nr-lote-nav-btn"
            disabled={activeLote === 0}
            onClick={() => setActiveLote(p => Math.max(0, p - 1))}
          >
            ← Ítem anterior
          </button>
          <span className="nr-lote-nav-idx">
            {activeLote + 1} / {state.lotes.length}
          </span>
          <button
            className="nr-lote-nav-btn"
            disabled={activeLote === state.lotes.length - 1}
            onClick={() => setActiveLote(p => Math.min(state.lotes.length - 1, p + 1))}
          >
            Ítem siguiente →
          </button>
        </div>
      )}

      <div className="nr-step-nav">
        <button className="nr-back-step-btn" onClick={onBack}>← Atrás</button>
        <Button
          variant="primary"
          size="sm"
          disabled={!todosCompletos}
          onClick={onNext}
          iconRight="M9 18l6-6-6-6"
        >
          Continuar ({completos}/{state.lotes.length})
        </Button>
      </div>
    </div>
  );
}

// ── PASO 5: Documentos + confirmación ─────────────────────────────────────────

function Paso5Documentos({
  state, setState, onSubmit, submitting, onBack,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onSubmit: () => void; submitting: boolean; onBack: () => void;
}) {
  const necesitaFrio = state.lotes.some(l => l.categoriaFrio);
  const TIPOS_REQ = [
    TIPO_DOCUMENTO.RegistroINVIMA,
    TIPO_DOCUMENTO.COA,
    ...(necesitaFrio ? [TIPO_DOCUMENTO.CertTransporte] : []),
  ];

  const getDoc  = (tipo: TipoDocumento) =>
    state.documentos.find(d => d.tipo === tipo);

  const setDoc  = (tipo: TipoDocumento, archivo: File | null) =>
    setState(p => {
      const docs = p.documentos.filter(d => d.tipo !== tipo);
      if (archivo) docs.push({ tipo, archivo });
      return { ...p, documentos: docs };
    });

  return (
    <div className="nr-form-grid-1">
      <div>
        <h2 className="nr-step-title">Documentos y confirmación</h2>
        <p className="nr-step-sub">
          Adjunta los soportes requeridos por normativa (Res. 2674/2013 — INVIMA).
        </p>
      </div>

      <div className="nr-doc-list">
        {TIPOS_REQ.map(tipo => {
          const doc     = getDoc(tipo);
          const inputId = `doc-${tipo}`;
          return (
            <div key={tipo} className="nr-doc-card" data-ok={!!doc}>
              <div
                className="nr-doc-icon"
                style={{
                  background: doc ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                  color:      doc ? "#86EFAC" : "#64748B",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="nr-doc-name">{TIPO_DOCUMENTO_LABELS[tipo]}</p>
                {doc
                  ? <p className="nr-doc-file-name">✓ {doc.archivo?.name}</p>
                  : <p className="nr-doc-no-file">Sin archivo adjunto</p>
                }
              </div>
              <label className="nr-doc-upload-btn" htmlFor={inputId}>
                {doc ? "Cambiar" : "Adjuntar"}
                <input
                  id={inputId} type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="nr-doc-input"
                  onChange={e => setDoc(tipo, e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* Resumen final */}
      <div className="nr-summary">
        <p className="nr-summary-title">Resumen de la recepción</p>
        <div className="nr-summary-grid">
          {[
            ["OC",         state.ocSeleccionada?.numeroOC],
            ["Proveedor",  state.ocSeleccionada?.proveedorNombre],
            ["Fecha",      state.fechaRecepcion],
            ["Placa",      state.placaVehiculo || "—"],
            ["Lotes",      `${state.lotes.filter(l => l.fechaVencimiento).length} de ${state.lotes.length}`],
            ["Documentos", `${state.documentos.length} adjunto(s)`],
          ].map(([k, v]) => (
            <div key={k} className="nr-summary-kv">
              <span className="nr-summary-key">{k}:</span>
              <span className="nr-summary-val">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nr-step-nav">
        <button className="nr-back-step-btn" onClick={onBack}>← Atrás</button>
        <Button
          variant="primary" size="md"
          loading={submitting} onClick={onSubmit}
        >
          Guardar recepción
        </Button>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────

export default function NuevaRecepcionPage() {
  const navigate   = useNavigate();
  const [step,       setStep]       = useState(1);
  const [state,      setState]      = useState<WizardState>(initWizard);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true); setError(null);
    try {
      if (isMock) {
        await new Promise(r => setTimeout(r, 900));
        navigate(ROUTES.RECEPCIONES);
        return;
      }

      const oc = state.ocSeleccionada!;

      // 1. Iniciar recepción (sin fecha/hora)
      const { id: recepcionId } = await recepcionesService.iniciar({
        ordenCompraId: oc.id,
        proveedorId: oc.proveedorId,
        usuarioId: DEV_USER_ID,
        observacionesGenerales: state.observaciones || undefined,
      });

      // 2. Registrar inspección del vehículo
      await recepcionesService.registrarInspeccionVehiculo(recepcionId, {
        temperaturaInicial: state.tempInicial ? Number(state.tempInicial) : undefined,
        temperaturaDentroRango: state.temperaturaDentroRango,
        integridadEmpaque: state.integridadEmpaque,
        limpiezaVehiculo: state.limpiezaVehiculo,
        presenciaOloresExtranos: state.oloresExtranos,
        plagasVisible: state.plagasVisible,
        documentosTransporteOk: state.documentosTransporteOk,
        observaciones: state.obsInspeccion || undefined,
      });

      // 3. Crear RecepcionItems para cada detalle de OC
      const itemIds = new Map<string, string>(); // detalleOcId -> recepcionItemId
      for (const detalle of oc.detalles) {
        const { id: itemId } = await recepcionesService.agregarItem(recepcionId, {
          detalleOrdenCompraId: detalle.id
        });
        itemIds.set(detalle.id, itemId);
      }

      // 4. Registrar lotes asociados a cada RecepcionItem
      for (const l of state.lotes) {
        if (!l.fechaVencimiento || Number(l.cantidadRecibida) <= 0) continue;
        const recepcionItemId = itemIds.get(l.detalleOcId);
        if (!recepcionItemId) continue;
        await recepcionesService.agregarLoteAItem(recepcionId, recepcionItemId, {
          numeroLoteProveedor: l.numeroLoteProveedor || undefined,
          fechaFabricacion: l.fechaFabricacion || undefined,
          fechaVencimiento: l.fechaVencimiento,
          cantidadRecibida: Number(l.cantidadRecibida),
          unidadMedida: l.unidadMedida,
          temperaturaMedida: l.temperaturaMedida ? Number(l.temperaturaMedida) : undefined,
          estadoSensorial: l.estadoSensorial,
          estadoRotulado: l.estadoRotulado,
          ubicacionDestino: l.ubicacionDestino,
        });
      }

      // 5. Subir documentos
      for (const doc of state.documentos) {
        if (doc.archivo) {
          await recepcionesService.subirDocumento(recepcionId, doc.tipo, doc.archivo);
        }
      }

      navigate(ROUTES.DETALLE_RECEPCION(recepcionId));

    } catch (e: unknown) {
      console.error(e);
      setError("Ocurrió un error al guardar la recepción. Revisa los datos e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepProps = { state, setState, onBack: () => setStep(p => p - 1) };

  return (
    <div className="nr-page">

      {/* Encabezado */}
      <div className="nr-header">
        <button
          className="nr-back-btn"
          onClick={() => navigate(ROUTES.RECEPCIONES)}
          aria-label="Volver a recepciones"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="nr-header-label">Nueva recepción</p>
          <h1 className="nr-header-title">Recepción de materia prima</h1>
        </div>
      </div>

      <StepBar current={step} />

      {error && (
        <div className="nr-error">
          <p className="nr-error-text">{error}</p>
        </div>
      )}

      <div className="nr-card">
        {step === 1 && (
          <Paso1OC {...stepProps} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Paso2Checkin {...stepProps} onNext={() => setStep(3)} />
        )}
        {step === 3 && (
          <Paso3Inspeccion {...stepProps} onNext={() => setStep(4)} />
        )}
        {step === 4 && (
          <Paso4Lotes {...stepProps} onNext={() => setStep(5)} />
        )}
        {step === 5 && (
          <Paso5Documentos
            {...stepProps}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>

    </div>
  );
}