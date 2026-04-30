import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Components/UI/Index";
import { SelectField, TextAreaField, TextField } from "../../Components/Forms/Index";
import { ROUTES } from "../../Constants/routes";
import { calidadService } from "../../Services/calidad.service";
import "../Recepciones/StylesRecepciones/NuevaRecepcionPage.css";
// IMPORTANTE: Asegúrate de que el archivo CSS nuevo esté en esta ruta
import "./StylesCalidad/LiberacionCocina.css"; 

const TURNOS = ["Mañana", "Tarde", "Noche"] as const;
const COCINAS = [
  "Caliente", "Wajaca", "Panatti", "Salsa", "Ravioli", "Panaderia", 
  "Hornos Piso 1", "Preliminar", "Postres", "Helados", "Proceso Pollo", 
  "Proceso Res", "Proceso Cerdo", "Tombler", "Hornos 2", "Tajado y Empaque"
] as const;

// Lista actualizada a 11 ítems para mayor detalle
const ITEMS_INSPECCION = [
  "La cocina cuenta con los utensilios necesarios para realizar los procesos:",
  "Las paredes, techos, mesones y pisos se encuentran limpios y en buen estado:",
  "Los atomizadores para desinfectante se encunetran en buen estado y marcados:",
  "Los equipos y utensilios que seran utilizados para los procesos se encuentran limpias:",
  "Las uniones entre paredes se encuentran limpias y en buen estado:",
  "Las puertas y cortinas se encuentran limpias y en buen estado:",
  "La cocina cuenta con dispensador de jabon y toallas adecuado:",
  "Los contenedores de residuos se encuentran limpios, con su tapa y bolsa de color:",
  "Los manipuladores cuentan con EPP adecuado para realizar los procesos:",
  "Se hizo desinfeccion en las areas, superficies, utensilios, equipos y ambientes en la cocina:",
  "Las rejillas de los desagues se encuentran limpias y en su respectivo lugar:"
];

export default function LiberacionCocinaPage() {
  const navigate = useNavigate();
  
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [turno, setTurno] = useState("");
  const [cocina, setCocina] = useState("");
  const [nombreResponsable, setNombreResponsable] = useState("");
  const [cargoResponsable, setCargoResponsable] = useState("");
  const [obsGenerales, setObsGenerales] = useState("");
  
  const [inspeccion, setInspeccion] = useState(
    ITEMS_INSPECCION.map(item => ({ item, estado: "Cumple" }))
  );

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleEstadoChange = (index: number, nuevoEstado: string) => {
    const nuevaInspeccion = [...inspeccion];
    nuevaInspeccion[index].estado = nuevoEstado;
    setInspeccion(nuevaInspeccion);
  };

  const onGuardar = async () => {
    const newErrors: Record<string, string[]> = {};
    
    if (!fecha) newErrors.Fecha = ["La fecha es obligatoria."];
    if (!turno) newErrors.Turno = ["El turno es obligatorio."];
    if (!cocina) newErrors.Cocina = ["La cocina es obligatoria."];
    if (!nombreResponsable.trim()) newErrors.NombreResponsable = ["El nombre del responsable es obligatorio."];
    if (!cargoResponsable.trim()) newErrors.CargoResponsable = ["El cargo del responsable es obligatorio."];

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors({ 
        ...newErrors,
        General: ["Por favor, completa todos los campos obligatorios."] 
      });
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      await calidadService.registrarLiberacionCocina({
        fecha,
        turno,
        cocina,
        nombreResponsable,
        cargoResponsable,
        observacionesInspeccion: "", // Campo requerido por la interfaz pero opcional en lógica
        observacionesGenerales: obsGenerales,
        inspeccion 
      });
      navigate(ROUTES.GESTION_CALIDAD);
    } catch (e: any) {
      if (e.response?.status === 400) {
        setFieldErrors(e.response.data.errors);
      } else {
        setFieldErrors({ General: ["Error al conectar con el servidor."] });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nr-page">
      <div className="nr-header">
        <button className="nr-back-btn" onClick={() => navigate(ROUTES.GESTION_CALIDAD)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <p className="nr-header-label">Gestión de Calidad</p>
          <h1 className="nr-header-title">Liberación de Cocina Diaria</h1>
        </div>
      </div>

      <div className="nr-card">
        {fieldErrors.General && <div className="nr-error"><p className="nr-error-text">{fieldErrors.General[0]}</p></div>}

        <div className="nr-form-grid-2">
          <div className="field-group">
            <label className="field-label">Fecha de Inspección <span style={{color: '#df6129'}}>*</span></label>
            <input
                className="nr-search-input"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{ 
                  borderColor: fieldErrors.Fecha ? '#ef4444' : '#3d2b24',
                  width: '100%'
                }}
              />
            {fieldErrors.Fecha && <span className="nr-error-text" style={{fontSize: '12px'}}>{fieldErrors.Fecha[0]}</span>}
          </div>

          <SelectField
            label="Turno"
            required
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            options={TURNOS.map(t => ({ value: t, label: t }))}
            error={fieldErrors.Turno?.[0]}
          />
        </div>

        <div className="nr-form-grid-2" style={{ marginTop: '15px' }}>
          <SelectField
            label="Cocina"
            required
            value={cocina}
            onChange={(e) => setCocina(e.target.value)}
            options={COCINAS.map(c => ({ value: c, label: c }))}
            error={fieldErrors.Cocina?.[0]}
          />
          <div /> 
        </div>

        {/* SECCIÓN DE LA TABLA CON LAS NUEVAS CLASES CSS */}
        <div className="lc-section">
          <div className="lc-grid-head">
            <div>Ítem de Inspección</div>
            <div style={{ textAlign: 'center' }}>Estado</div>
          </div>

          {inspeccion.map((row, idx) => (
            <div key={idx} className="lc-grid-row">
              <div className="lc-item-text">
                {row.item}
              </div>
              <div>
                <select 
                  className="lc-select"
                  value={row.estado}
                  onChange={(e) => handleEstadoChange(idx, e.target.value)}
                >
                  <option value="Cumple">Cumple</option>
                  <option value="No cumple">No cumple</option>
                  <option value="No aplica">N/A</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="nr-form-grid-2" style={{ marginTop: '20px' }}>
          <TextField
            label="Nombre Responsable"
            required
            value={nombreResponsable}
            onChange={(e) => setNombreResponsable(e.target.value)}
            error={fieldErrors.NombreResponsable?.[0]}
          />
          <TextField
            label="Cargo Responsable"
            required
            value={cargoResponsable}
            onChange={(e) => setCargoResponsable(e.target.value)}
            error={fieldErrors.CargoResponsable?.[0]}
          />
        </div>

        <TextAreaField
          label="Observaciones Generales"
          rows={3}
          value={obsGenerales}
          onChange={(e) => setObsGenerales(e.target.value)}
        />

        <div className="nr-step-nav">
          <button className="nr-back-step-btn" onClick={() => navigate(ROUTES.GESTION_CALIDAD)}>← Atrás</button>
          <Button 
            variant="primary" 
            loading={submitting} 
            onClick={onGuardar}
            disabled={!nombreResponsable.trim() || !cargoResponsable.trim()}
          >
            Guardar Liberación
          </Button>
        </div>
      </div>
    </div>
  );
}