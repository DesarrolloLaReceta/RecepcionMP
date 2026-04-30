import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Components/UI/Index";
import { NumberField, SelectField, TextAreaField, TextField } from "../../Components/Forms/Index";
import { ROUTES } from "../../Constants/routes";
import { calidadService } from "../../Services/calidad.service";
import "../Recepciones/StylesRecepciones/NuevaRecepcionPage.css";

const TURNOS = ["Mañana", "Tarde", "Noche"] as const;
const PISOS = ["Piso 1", "Piso 2"] as const;
const ENTRADAS = ["Principal", "Producción", "Despacho"] as const;

const today = new Date().toISOString().slice(0, 10);

export default function LavadoBotasManosPage() {
  const navigate = useNavigate();
  
  // Estados básicos
  const [fecha, setFecha] = useState(today);
  const [turno, setTurno] = useState("");
  const [piso, setPiso] = useState("");
  const [entrada, setEntrada] = useState("");
  const [personasRevisadas, setPersonasRevisadas] = useState("0");
  const [novedades, setNovedades] = useState("");
  const [observaciones, setObservaciones] = useState("");
  
  // Estados del Responsable (Nuevos campos para La Receta Y CIA S.A.S.)
  const [nombreResponsable, setNombreResponsable] = useState("");
  const [cargoResponsable, setCargoResponsable] = useState("");
  
  // Estados de control y archivos
  const [fotoEvidencia, setFotoEvidencia] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onGuardar = async () => {
    // Validación local: Aseguramos que los nuevos campos no estén vacíos
    if (!turno || !piso || !entrada || !nombreResponsable || !cargoResponsable) {
        setFieldErrors({
            General: ["Por favor, completa todos los campos obligatorios, incluyendo los datos del responsable."]
        });
        return;
    }

    setSubmitting(true);
    setFieldErrors({});

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
                nombreResponsable, // Enviado al Command del Backend
                cargoResponsable   // Enviado al Command del Backend
            },
            fotoEvidencia
        );
        
        // Redirección tras éxito (puedes ajustarla según tu flujo)
        navigate(ROUTES.GESTION_CALIDAD); 
    } catch (e: any) {
        console.error(e);
        
        if (e.response && e.response.status === 400) {
            const erroresServidor = e.response.data.errors;
            setFieldErrors(erroresServidor);
        } else {
            setFieldErrors({ General: ["No fue posible guardar la revisión. Verifica la conexión con la API."] });
        }
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="nr-page">
      <div className="nr-header">
        <button className="nr-back-btn" onClick={() => navigate(ROUTES.GESTION_CALIDAD)} aria-label="Volver">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="nr-header-label">Calidad</p>
          <h1 className="nr-header-title">Revisión de Lavado de Botas y Manos</h1>
        </div>
      </div>

      {fieldErrors.General && (
        <div className="nr-error">
          <p className="nr-error-text">{fieldErrors.General[0]}</p>
        </div>
      )}

      <div className="nr-card">
        {/* Sección de Ubicación y Tiempo */}
        <div className="nr-form-grid-2">
          <div className="field-group">
            <label className="field-label">Fecha de Revisión</label>
            <input
              className="nr-search-input"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <SelectField
            label="Turno"
            required
            placeholder="Selecciona turno"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            options={TURNOS.map((t) => ({ value: t, label: t }))}
            error={fieldErrors.Turno?.[0]}
          />
        </div>

        <div className="nr-form-grid-2">
          <SelectField
            label="Piso"
            required
            placeholder="Selecciona piso"
            value={piso}
            onChange={(e) => setPiso(e.target.value)}
            options={PISOS.map((p) => ({ value: p, label: p }))}
            error={fieldErrors.Piso?.[0]}
          />
          <SelectField
            label="Entrada"
            required
            placeholder="Selecciona entrada"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            options={ENTRADAS.map((ent) => ({ value: ent, label: ent }))}
            error={fieldErrors.Entrada?.[0]}
          />
        </div>

        {/* Nueva Sección: Responsable de la revisión */}
        <div className="nr-form-grid-2" style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <TextField
            label="Nombre del Responsable"
            required
            placeholder="Quién realiza la inspección"
            value={nombreResponsable}
            onChange={(e) => setNombreResponsable(e.target.value)}
            error={fieldErrors.NombreResponsable?.[0]}
          />
          <TextField
            label="Cargo del Responsable"
            required
            placeholder="Ej. Analista de Calidad"
            value={cargoResponsable}
            onChange={(e) => setCargoResponsable(e.target.value)}
            error={fieldErrors.CargoResponsable?.[0]}
          />
        </div>

        <div className="nr-form-grid-1">
          <NumberField
            label="Total Personas Revisadas"
            required
            min={0}
            value={personasRevisadas}
            onChange={(e) => setPersonasRevisadas(e.target.value)}
            error={fieldErrors.PersonasRevisadas?.[0]}
          />
        </div>

        <TextAreaField
          label="Novedades Encontradas"
          rows={3}
          placeholder="Describe si hubo incumplimientos..."
          value={novedades}
          onChange={(e) => setNovedades(e.target.value)}
          error={fieldErrors.Novedades?.[0]}
        />

        <TextAreaField
          label="Observaciones Adicionales"
          rows={3}
          placeholder="Notas generales de la jornada..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          error={fieldErrors.Observaciones?.[0]}
        />

        {/* Sección de Evidencia Fotográfica */}
        <div className="nr-form-grid-1">
          <label className="field-label">Foto de Evidencia</label>
          <div className="vi-fotos-col" style={{ alignItems: 'flex-start' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              iconLeft="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8"
              onClick={() => fileInputRef.current?.click()}
            >
              Capturar Foto
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => setFotoEvidencia(e.target.files?.[0] ?? null)}
            />

            <p className="vi-fotos-count" style={{ marginTop: '8px' }}>
              {fotoEvidencia ? "✅ Imagen lista para subir" : "⚠️ Sin evidencia fotográfica"}
            </p>
            
            {fotoEvidencia && (
              <span style={{ fontSize: '11px', color: '#888' }}>{fotoEvidencia.name}</span>
            )}
          </div>
        </div>

        <div className="nr-step-nav" style={{ marginTop: '30px' }}>
          <button 
            type="button"
            className="nr-back-step-btn" 
            onClick={() => navigate(ROUTES.GESTION_CALIDAD)}
          >
            ← Cancelar
          </button>
          <Button 
            variant="primary" 
            size="md" 
            loading={submitting} 
            onClick={onGuardar}
          >
            Finalizar Registro
          </Button>
        </div>
      </div>
    </div>
  );
}