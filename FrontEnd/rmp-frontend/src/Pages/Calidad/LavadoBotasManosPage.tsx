import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Components/UI/Index";
import { NumberField, SelectField, TextAreaField } from "../../Components/Forms/Index";
import { ROUTES } from "../../Constants/routes";
import { calidadService } from "../../Services/calidad.service";
import "../Recepciones/StylesRecepciones/NuevaRecepcionPage.css";

const TURNOS = ["Mañana", "Tarde", "Noche"] as const;
const PISOS = ["Piso 1", "Piso 2"] as const;
const ENTRADAS = ["Principal", "Producción", "Despacho"] as const;

const today = new Date().toISOString().slice(0, 10);

export default function LavadoBotasManosPage() {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(today);
  const [turno, setTurno] = useState("");
  const [piso, setPiso] = useState("");
  const [entrada, setEntrada] = useState("");
  const [personasRevisadas, setPersonasRevisadas] = useState("0");
  const [novedades, setNovedades] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fotoEvidencia, setFotoEvidencia] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGuardar = async () => {
    if (!turno || !piso || !entrada) {
      setError("Completa Turno, Piso y Entrada.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await calidadService.registrarLavadoBotasManos(
        {
          fecha,
          turno,
          piso,
          entrada,
          personasRevisadas: Number(personasRevisadas || "0"),
          novedades,
          observaciones,
        },
        fotoEvidencia
      );
      navigate(ROUTES.LIBERACION);
    } catch (e) {
      console.error(e);
      setError("No fue posible guardar la revisión de lavado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nr-page">
      <div className="nr-header">
        <button className="nr-back-btn" onClick={() => navigate(ROUTES.LIBERACION)} aria-label="Volver">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="nr-header-label">Calidad</p>
          <h1 className="nr-header-title">Revisión de Lavado de Botas y Manos</h1>
        </div>
      </div>

      {error && (
        <div className="nr-error">
          <p className="nr-error-text">{error}</p>
        </div>
      )}

      <div className="nr-card">
        <div className="nr-form-grid-2">
          <SelectField
            label="Turno"
            required
            placeholder="Selecciona turno"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            options={TURNOS.map((t) => ({ value: t, label: t }))}
          />
          <SelectField
            label="Piso"
            required
            placeholder="Selecciona piso"
            value={piso}
            onChange={(e) => setPiso(e.target.value)}
            options={PISOS.map((p) => ({ value: p, label: p }))}
          />
        </div>

        <div className="nr-form-grid-2">
          <SelectField
            label="Entrada"
            required
            placeholder="Selecciona entrada"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            options={ENTRADAS.map((ent) => ({ value: ent, label: ent }))}
          />
          <NumberField
            label="Personas revisadas"
            required
            min={0}
            value={personasRevisadas}
            onChange={(e) => setPersonasRevisadas(e.target.value)}
          />
        </div>

        <TextAreaField
          label="Novedades"
          rows={3}
          placeholder="Novedades durante la revisión..."
          value={novedades}
          onChange={(e) => setNovedades(e.target.value)}
        />

        <TextAreaField
          label="Observaciones"
          rows={3}
          placeholder="Observaciones generales..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />

        <div className="nr-form-grid-1">
          <label className="field-label">Foto evidencia</label>
          <input
            className="nr-search-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFotoEvidencia(e.target.files?.[0] ?? null)}
          />
          <p className="nr-step-sub">{fotoEvidencia ? `Archivo: ${fotoEvidencia.name}` : "Sin foto cargada."}</p>
        </div>

        <div className="nr-step-nav">
          <button className="nr-back-step-btn" onClick={() => navigate(ROUTES.LIBERACION)}>← Atrás</button>
          <Button variant="primary" size="md" loading={submitting} onClick={onGuardar}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}

