import { useMemo, useRef, useState, useEffect, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";
import { Button } from "../../Components/UI/Index";
import { SelectField, TextAreaField, TextField } from "../../Components/Forms/Index";
import { ROUTES } from "../../Constants/routes";
import { ZONAS_CALIDAD } from "../../Constants/zonasCalidad";
import { calidadService, type GuardarVerificacionPayload } from "../../Services/calidad.service";
import "../Recepciones/StylesRecepciones/NuevaRecepcionPage.css";
import "./StylesCalidad/VerificacionInstalaciones.css";

type Calificacion = 1 | 2;

interface ItemFila {
  id: string;
  item: string;
  calificacion: Calificacion;
  hallazgos: string;
  planAccion: string;
  fotos: File[];
}

interface Seccion {
  id: string;
  titulo: string;
  filas: ItemFila[];
}

const SECCIONES_BASE: Seccion[] = [
  {
    id: "instalaciones-fisicas",
    titulo: "Instalaciones físicas",
    filas: [
      { id: "if-1", item: "Existen sifones y rejillas de drenaje adecuadas y las aguas de lavado.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-2", item: "Las instalaciones eléctricas están debidamente aisladas y protegidas.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-3", item: "Los pisos se encuentran en buen estado, limpios, sin grietas, perforaciones o roturas y tiene la inclinación adecuada para efectos del drenaje.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-4", item: "Las paredes son de material resistente, de colores claros, de material no absorbente, lisas y de fácil limpieza y desinfección, se encuentran limpias y en buen estado.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-5", item: "Las uniones entre las paredes y entre éstas y los pisos son redondeadas, y están diseñadas de tal manera que evite la acumulación de polvo y suciedad.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-6", item: "Techos de fácil limpieza, desinfección y mantenimiento y se encuentra limpio.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-7", item: "No existe evidencia de formación de hongos y levaduras, desprendimiento superficial en techos o zonas altas.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-8", item: "Las puertas y cortinas se encuentran limpias, en buen estado, libres de corrosión o moho y bien ubicadas.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-9", item: "La sala se encuentra con adecuada iluminación en calidad e intensidad (natural o artificial).", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-10", item: "Las lamparas y accesorios son de seguridad, están protegidos para evitar la contaminación en caso de ruptura, están en buen estado y limpias.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-11", item: "La ventilación es adecuada y no afecta la calidad del producto ni la comodidad de los operarios.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-12", item: "La cocina cuenta con lavamanos de accionamiento no manual, dotado con dispensador de jabón desinfectante, toallas de manos desechables.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-13", item: "El dispensador de jabón de manos se encuentra limpio y en buen estado.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-14", item: "El dispensador de toallas de mano se encuentra limpio y en buen estado.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-15", item: "Son apropiados los avisos alusivos al lavado de manos.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-16", item: "Los equipos y utensilios en contacto directo con el alimento están fabricados en materiales resistentes al uso y a la corrosión, libres de grietas y defectos, lisos, no absorbentes, no recubiertas con pintura o materiales desprendibles, fáciles de limpiar y desinfectar.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-17", item: "La cava están construidos con materiales resistentes, fáciles de limpiar, impermeable, se encuentran en buen estado y no presentan condensaciones y estan equipados con termómetro de precisión de fácil lectura desde el exterior, se llevan lo registros.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
    ],
  },
  {
    id: "agua-potable",
    titulo: "Agua potable",
    filas: [
      { id: "ap-1", item: "El suministro de agua y su presión es suficiente para todas las operaciones.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
    ],
  },
  {
    id: "residuos",
    titulo: "Residuos",
    filas: [
      { id: "re-1", item: "El contenedor de residuos se encuentra en buen estado, cuenta con su tapa y bolsa de color según corresponda.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "re-2", item: "Son removidas las basuras con la frecuencia necesaria para evitar generación de olores, molestias sanitarias y proliferación de plagas.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
    ],
  },
  {
    id: "limpieza",
    titulo: "Limpieza",
    filas: [
      { id: "li-1", item: "Se encuentra limpia y ordenada el área de trabajo (mesones, utensilios, grameras).", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "li-2", item: "Los atomizadores para desinfectante se encuentran en buen estado y con la rotulación.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "li-3", item: "Los dispensadores de detergente se encuentran en buen estado y debidamente marcados.", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "li-4", item: "Los utensilios de aseo se encuentran en buen estado y con el color correspondiente al área.", calificacion: 2, hallazgos: "", planAccion: "" , fotos: [] },
    ],
  },
];

function monthYearValue(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function clearErrorsForKeys(
  setFieldErrors: Dispatch<SetStateAction<Record<string, string[]>>>,
  ...keys: string[]
) {
  setFieldErrors((prev) => {
    const next = { ...prev };
    for (const k of keys) delete next[k];
    delete next.General;
    return next;
  });
}

function clearErrorsByPrefix(
  setFieldErrors: Dispatch<SetStateAction<Record<string, string[]>>>,
  prefix: string
) {
  setFieldErrors((prev) => {
    const next = { ...prev };
    for (const k of Object.keys(next)) {
      if (k.startsWith(prefix)) delete next[k];
    }
    delete next.General;
    return next;
  });
}

function calcCumplimiento(filas: ItemFila[]): number {
  if (filas.length === 0) return 0;
  const suma = filas.reduce((acc, fila) => acc + fila.calificacion, 0);
  return Number((((suma / (filas.length * 2)) * 100)).toFixed(2));
}

export default function VerificacionInstalaciones() {
  const navigate = useNavigate();
  const { displayName, roles } = useAuth();
  const [zona, setZona] = useState("");
  const [secciones, setSecciones] = useState<Seccion[]>(SECCIONES_BASE);
  const [observacionesGenerales, setObservacionesGenerales] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [periodoMesAnio, setPeriodoMesAnio] = useState(monthYearValue);
  const [nombreResponsable, setNombreResponsable] = useState("");
  const [cargoResponsable, setCargoResponsable] = useState("");
  const responsableInicializado = useRef(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (responsableInicializado.current) return;
    const nom = displayName?.trim();
    const cargo = roles?.[0]?.trim();
    if (!nom && !cargo) return;
    if (nom) setNombreResponsable(nom);
    if (cargo) setCargoResponsable(cargo);
    responsableInicializado.current = true;
  }, [displayName, roles]);

  // --- ESTADOS DEL STEPPER Y CHECKLIST ---
  const [currentStep, setCurrentStep] = useState(0);
  const [progresoZonas, setProgresoZonas] = useState<{ nombre: string; completada: boolean }[]>(() => {
    const hoy = new Date().toLocaleDateString();
    const guardado = localStorage.getItem('progreso_calidad_total');
    if (guardado) {
      const { fecha, zonas } = JSON.parse(guardado);
      if (fecha === hoy) return zonas;
    }
    return ZONAS_CALIDAD.map(z => ({ nombre: z, completada: false }));
  });

  // Guardar progreso cada vez que cambie
  useEffect(() => {
    const hoy = new Date().toLocaleDateString();
    localStorage.setItem('progreso_calidad_total', JSON.stringify({ fecha: hoy, zonas: progresoZonas }));
  }, [progresoZonas]);

  const seccionesCumplimiento = useMemo(() => {
    return secciones.map((seccion) => ({
      id: seccion.id,
      cumplimiento: calcCumplimiento(seccion.filas),
    }));
  }, [secciones]);

  const cumplimientoTotal = useMemo(() => {
    const todasLasFilas = secciones.flatMap((seccion) => seccion.filas);
    return calcCumplimiento(todasLasFilas);
  }, [secciones]);

  const actualizarFila = (seccionId: string, filaId: string, key: keyof ItemFila, value: string | Calificacion | File[]) => {
    clearErrorsByPrefix(setFieldErrors, "Secciones");
    setSecciones((prev) =>
      prev.map((seccion) =>
        seccion.id !== seccionId
          ? seccion
          : {
              ...seccion,
              filas: seccion.filas.map((fila) =>
                fila.id === filaId ? { ...fila, [key]: value } : fila
              ),
            }
      )
    );
  };

  const onSelectFotos = (seccionId: string, filaId: string, event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      const seccion = secciones.find((s) => s.id === seccionId);
      const fila = seccion?.filas.find((f) => f.id === filaId);
      actualizarFila(seccionId, filaId, "fotos", [...(fila?.fotos ?? []), ...files]);
    }
    event.target.value = "";
  };

  const onGuardar = async () => {
    if (!zona) {
      setFieldErrors({ Zona: ["Selecciona una zona para registrar la verificación."] });
      return;
    }
    if (!nombreResponsable.trim() || !cargoResponsable.trim()) {
      const err: Record<string, string[]> = {};
      if (!nombreResponsable.trim()) {
        err.NombreResponsable = ["El nombre del responsable es obligatorio."];
      }
      if (!cargoResponsable.trim()) {
        err.CargoResponsable = ["El cargo del responsable es obligatorio."];
      }
      setFieldErrors(err);
      return;
    }
    const periodoParts = periodoMesAnio.split("-");
    if (periodoParts.length !== 2) {
      setFieldErrors({ PeriodoMesAnio: ["Selecciona un mes y año válidos."] });
      return;
    }
    const periodoAnio = Number(periodoParts[0]);
    const periodoMes = Number(periodoParts[1]);
    if (!periodoAnio || periodoMes < 1 || periodoMes > 12) {
      setFieldErrors({ PeriodoMesAnio: ["Selecciona un mes y año válidos."] });
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      const payload: GuardarVerificacionPayload = {
        zona,
        periodoAnio,
        periodoMes,
        cumplimientoTotal,
        secciones: secciones.map((seccion) => ({
          seccion: seccion.titulo,
          cumplimiento: calcCumplimiento(seccion.filas),
          filas: seccion.filas.map((fila) => ({
            aspectoId: fila.id,
            item: fila.item,
            calificacion: fila.calificacion,
            hallazgos: fila.hallazgos,
            planAccion: fila.planAccion,
          })),
        })),
        observacionesGenerales: observacionesGenerales || undefined,
        nombreResponsable: nombreResponsable.trim(),
        cargoResponsable: cargoResponsable.trim(),
      };

      const fotosPorAspecto = secciones.flatMap((seccion) =>
        seccion.filas.flatMap((fila) => fila.fotos.map((file) => ({ aspectoId: fila.id, file })))
      );
      await calidadService.guardarVerificacionInstalaciones(payload, fotosPorAspecto);
      
      // Marcar como completada en la lista visual
      setProgresoZonas(prev => prev.map(z => z.nombre === zona ? { ...z, completada: true } : z));
      
      navigate(ROUTES.GESTION_CALIDAD);
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status === 400) {
        setFieldErrors(e.response.data.errors);
      } else {
        setFieldErrors({ General: ["No fue posible guardar la verificación."] });
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
          <h1 className="nr-header-title">Verificación de instalaciones planta</h1>
          <span className="vi-cumplimiento" style={{ fontSize: '12px' }}>
            Paso {currentStep + 1} de {secciones.length + 2}
          </span>
        </div>
      </div>

      {fieldErrors.General && (
        <div className="nr-error">
          <p className="nr-error-text">{fieldErrors.General[0]}</p>
        </div>
      )}
      
      {Object.keys(fieldErrors).length > 0 && !fieldErrors.General && (
        <div className="nr-error">
          <p className="nr-error-text">Hay errores en el formulario. Por favor revisa los campos marcados.</p>
        </div>
      )}

      <div className="nr-card">
        
        {/* --- PASO 0: HOJA DE RUTA INTERACTIVA --- */}
        {currentStep === 0 && (
          <div className="vi-section">
            <h2 className="nr-step-title" style={{ marginBottom: '0.5rem' }}>Plan de Inspección</h2>
            <p style={{ color: '#a3938d', fontSize: '14px', marginBottom: '1.5rem' }}>
              Selecciona la zona que vas a verificar a continuación:
            </p>
    
            <div className="vi-checklist-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '12px', 
              marginBottom: '2rem' 
            }}>
              {progresoZonas.map((item, i) => {
                const esSeleccionada = zona === item.nombre;
        
                return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setZona(item.nombre);
                    clearErrorsForKeys(setFieldErrors, "Zona");
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    // Estilos dinámicos según estado
                    background: esSeleccionada ? 'rgba(223, 97, 41, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: esSeleccionada ? '2px solid #df6129' : '1px solid #3d2b24',
                    color: item.completada ? '#86efac' : (esSeleccionada ? '#fdfbf7' : '#a3938d')
                  }}
                >
                  <span style={{ fontSize: '16px' }}>
                    {item.completada ? '✅' : (esSeleccionada ? '🔘' : '⚪')}
                  </span>
                  <span style={{ 
                    fontWeight: esSeleccionada ? 'bold' : 'normal',
                    textDecoration: item.completada ? 'line-through' : 'none'
                  }}>
                    {item.nombre}
                  </span>
                </button>
              );
            })}
          </div>

            <div className="nr-form-grid-1" style={{ marginTop: "1.25rem" }}>
              <label className="field-label">Periodo de inspección (mes y año)</label>
              <input
                className="nr-search-input"
                type="month"
                value={periodoMesAnio}
                onChange={(e) => {
                  setPeriodoMesAnio(e.target.value);
                  clearErrorsForKeys(setFieldErrors, "PeriodoMesAnio");
                }}
              />
              {fieldErrors.PeriodoMesAnio?.[0] && (
                <p style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "6px" }}>{fieldErrors.PeriodoMesAnio[0]}</p>
              )}
            </div>

            <div className="nr-form-grid-2" style={{ marginTop: "1rem" }}>
              <TextField
                label="Nombre del responsable"
                required
                placeholder="Quién firma la verificación"
                value={nombreResponsable}
                onChange={(e) => {
                  setNombreResponsable(e.target.value);
                  clearErrorsForKeys(setFieldErrors, "NombreResponsable");
                }}
                error={fieldErrors.NombreResponsable?.[0]}
              />
              <TextField
                label="Cargo del responsable"
                required
                placeholder="Ej. Analista de Calidad"
                value={cargoResponsable}
                onChange={(e) => {
                  setCargoResponsable(e.target.value);
                  clearErrorsForKeys(setFieldErrors, "CargoResponsable");
                }}
                error={fieldErrors.CargoResponsable?.[0]}
              />
            </div>

            {/* Mensaje de validación visual */}
            {!zona && (
              <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '-1rem' }}>
                * Debes seleccionar una zona para poder continuar.
              </p>
            )}
          </div>
        )}

        {/* --- PASOS DE SECCIONES --- */}
        {secciones.map((seccion, seccionIndex) => {
          if (currentStep !== seccionIndex + 1) return null;
          const cumplimiento = seccionesCumplimiento.find((s) => s.id === seccion.id)?.cumplimiento ?? 0;
  
          return (
            <section key={seccion.id} className="vi-section">
              <div className="vi-section-header">
                <h2 className="nr-step-title">{seccion.titulo}</h2>
                <span className="vi-cumplimiento">Cumplimiento Sección: {cumplimiento}%</span>
              </div>

              <div className="vi-grid-head">
                <span>Ítem</span>
                <span>Calificación</span>
                <span>Hallazgos</span>
                <span>Plan de acción</span>
                <span>Fotos</span>
              </div>

              {seccion.filas.map((fila, indexFila) => {
                const baseKey = `Secciones[${seccionIndex}].Filas[${indexFila}]`;
                return (
                  <div key={fila.id} className="vi-grid-row">
                    <p className="vi-item-text">{fila.item}</p>
                    <SelectField
                      label=""
                      value={fila.calificacion}
                      onChange={(e) => actualizarFila(seccion.id, fila.id, "calificacion", Number(e.target.value) as Calificacion)}
                      options={[{ value: 1, label: "1" }, { value: 2, label: "2" }]}    
                      error={fieldErrors[`${baseKey}.Calificacion`]?.[0]}
                    />
                    <TextAreaField
                      label=""
                      rows={2}
                      placeholder="Hallazgos..."
                      value={fila.hallazgos}
                      onChange={(e) => actualizarFila(seccion.id, fila.id, "hallazgos", e.target.value)}
                      error={fieldErrors[`${baseKey}.Hallazgos`]?.[0]}
                    />
                    <TextAreaField
                      label=""
                      rows={2}
                      placeholder="Plan de acción..."
                      value={fila.planAccion}
                      onChange={(e) => actualizarFila(seccion.id, fila.id, "planAccion", e.target.value)}
                      error={fieldErrors[`${baseKey}.PlanAccion`]?.[0]}
                    />
                    <div className="vi-fotos-col">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        iconLeft="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8"
                        onClick={() => fileRefs.current[fila.id]?.click()}
                      >Cámara</Button>
                      <input
                        ref={(el) => { fileRefs.current[fila.id] = el; }}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="vi-file-input"
                        onChange={(e) => onSelectFotos(seccion.id, fila.id, e)}
                      />
                      <p className="vi-fotos-count">{fila.fotos.length} foto(s)</p>
                      {fieldErrors[`${baseKey}.Fotos`] && (
                        <span className="error-text-small">{fieldErrors[`${baseKey}.Fotos`][0]}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}

        {/* --- PASO FINAL --- */}
        {currentStep === secciones.length + 1 && (
          <div className="vi-section">
            <h2 className="nr-step-title">Finalizar Verificación</h2>
            <TextAreaField
              label="Observaciones generales"
              rows={4}
              placeholder="Observaciones finales de la verificación..."
              value={observacionesGenerales}
              onChange={(e) => {
                setObservacionesGenerales(e.target.value);
                clearErrorsForKeys(setFieldErrors, "ObservacionesGenerales");
              }}
              error={fieldErrors.ObservacionesGenerales?.[0]}
            />
            <div className="vi-total" style={{ marginTop: '2rem' }}>
              <p className="nr-step-title">Cumplimiento Total de la Planta</p>
              <p className="vi-total-value">{cumplimientoTotal}%</p>
            </div>
          </div>
        )}

        {/* --- NAVEGACIÓN --- */}
        <div className="nr-step-nav" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <button 
            className="nr-back-step-btn" 
            onClick={() => currentStep === 0 ? navigate(ROUTES.GESTION_CALIDAD) : setCurrentStep(prev => prev - 1)}
          >
            ← {currentStep === 0 ? "Salir" : "Anterior"}
          </button>

          {currentStep < secciones.length + 1 ? (
            <Button 
              variant="primary" 
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={currentStep === 0 && !zona}
            >Siguiente →</Button>
          ) : (
            <Button variant="primary" size="md" loading={submitting} onClick={onGuardar}>
              Guardar Verificación
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}