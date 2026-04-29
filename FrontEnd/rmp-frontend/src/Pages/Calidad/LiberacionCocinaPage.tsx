import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Components/UI/Index";
import { SelectField, TextAreaField, TextField } from "../../Components/Forms/Index";
import { ROUTES } from "../../Constants/routes";
import { calidadService } from "../../Services/calidad.service";
import "../Recepciones/StylesRecepciones/NuevaRecepcionPage.css";

const TURNOS = ["Mañana", "Tarde", "Noche"] as const;
const COCINAS = ["Caliente", "Wajaca", "Panatti", "Salsa","Ravioli","Panaderia","Hornos Piso 1","Preliminar","Postres","Helados","Proceso Pollo","Proceso Res","Proceso Cerdo","Tombler","Hornos 2","Tajado y Empaque"] as const;
const ITEMS_INSPECCION = [
  "Pisos, paredes y techos limpios",
  "Equipos y utensilios desinfectados",
  "Personal con dotación completa",
  "Ausencia de plagas",
  "Materias primas rotuladas"
];

export default function LiberacionCocinaPage() {
  const navigate = useNavigate();
  const [turno, setTurno] = useState("");
  const [cocina, setCocina] = useState("");
  const [nombreResponsable, setNombreResponsable] = useState("");
  const [cargoResponsable, setCargoResponsable] = useState("");
  const [obsInspeccion, setObsInspeccion] = useState("");
  const [obsGenerales, setObsGenerales] = useState("");
  
  // Estado para la tabla de inspección
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
    if (!turno || !cocina || !nombreResponsable) {
      setFieldErrors({ General: ["Completa Turno, Cocina y Responsable."] });
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      await calidadService.registrarLiberacionCocina({
        turno,
        cocina,
        nombreResponsable,
        cargoResponsable,
        observacionesInspeccion: obsInspeccion,
        observacionesGenerales: obsGenerales,
        inspeccion // Enviamos el array de objetos {item, estado}
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
          <p className="nr-header-label">Calidad</p>
          <h1 className="nr-header-title">Liberación de Cocina Diaria</h1>
        </div>
      </div>

      <div className="nr-card">
        {fieldErrors.General && <div className="nr-error"><p className="nr-error-text">{fieldErrors.General[0]}</p></div>}

        <div className="nr-form-grid-2">
          <SelectField
            label="Turno"
            required
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            options={TURNOS.map(t => ({ value: t, label: t }))}
            error={fieldErrors.Turno?.[0]}
          />
          <SelectField
            label="Cocina"
            required
            value={cocina}
            onChange={(e) => setCocina(e.target.value)}
            options={COCINAS.map(c => ({ value: c, label: c }))}
            error={fieldErrors.Cocina?.[0]}
          />
        </div>

        {/* TABLA DE INSPECCIÓN */}
        <div style={{ marginTop: '20px' }}>
          <label className="field-label">Lista de Inspección</label>
          <div className="nr-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Ítem</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {inspeccion.map((row, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{row.item}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <select 
                        className="nr-search-input" 
                        style={{ padding: '4px', height: 'auto' }}
                        value={row.estado}
                        onChange={(e) => handleEstadoChange(idx, e.target.value)}
                      >
                        <option value="Cumple">Cumple</option>
                        <option value="No cumple">No cumple</option>
                        <option value="No aplica">N/A</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="nr-form-grid-2" style={{ marginTop: '20px' }}>
          <TextField
            label="Nombre Responsable"
            value={nombreResponsable}
            onChange={(e) => setNombreResponsable(e.target.value)}
          />
          <TextField
            label="Cargo Responsable"
            value={cargoResponsable}
            onChange={(e) => setCargoResponsable(e.target.value)}
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
          <Button variant="primary" loading={submitting} onClick={onGuardar}>Guardar Liberación</Button>
        </div>
      </div>
    </div>
  );
}