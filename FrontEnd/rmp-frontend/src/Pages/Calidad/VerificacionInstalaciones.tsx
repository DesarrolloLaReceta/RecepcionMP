import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Components/UI/Index";
import { SelectField, TextAreaField } from "../../Components/Forms/Index";
import { ROUTES } from "../../Constants/routes";
import { ZONAS_CALIDAD } from "../../constants/zonasCalidad";
import { calidadService, type VerificacionSeccionPayload } from "../../Services/calidad.service";
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
      { id: "if-1", item: "Pisos y paredes en buen estado sanitario", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-2", item: "Iluminación y ventilación adecuadas", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "if-3", item: "Áreas delimitadas y señalizadas", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
    ],
  },
  {
    id: "agua-potable",
    titulo: "Agua potable",
    filas: [
      { id: "ap-1", item: "Puntos de agua limpios y operativos", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "ap-2", item: "No hay fugas ni estancamientos", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "ap-3", item: "Evidencia de control de potabilidad vigente", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
    ],
  },
  {
    id: "residuos",
    titulo: "Residuos",
    filas: [
      { id: "re-1", item: "Canecas identificadas por tipo de residuo", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "re-2", item: "Frecuencia de recolección adecuada", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "re-3", item: "Zona de almacenamiento temporal limpia", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
    ],
  },
  {
    id: "limpieza",
    titulo: "Limpieza",
    filas: [
      { id: "li-1", item: "Plan de limpieza y desinfección visible", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "li-2", item: "Utensilios/equipos de aseo en buen estado", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
      { id: "li-3", item: "No se observan residuos en superficies críticas", calificacion: 2, hallazgos: "", planAccion: "", fotos: [] },
    ],
  },
];

function calcCumplimiento(filas: ItemFila[]): number {
  if (filas.length === 0) return 0;
  const suma = filas.reduce((acc, fila) => acc + fila.calificacion, 0);
  return Number((((suma / (filas.length * 2)) * 100)).toFixed(2));
}

export default function VerificacionInstalaciones() {
  const navigate = useNavigate();
  const [zona, setZona] = useState("");
  const [secciones, setSecciones] = useState<Seccion[]>(SECCIONES_BASE);
  const [observacionesGenerales, setObservacionesGenerales] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const actualizarFila = (
    seccionId: string,
    filaId: string,
    key: keyof ItemFila,
    value: string | Calificacion | File[]
  ) => {
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
      setError("Selecciona una zona para registrar la verificación.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: {
        zona: string;
        cumplimientoTotal: number;
        secciones: VerificacionSeccionPayload[];
        observacionesGenerales?: string;
      } = {
        zona,
        cumplimientoTotal,
        secciones: secciones.map((seccion) => ({
          seccion: seccion.titulo,
          cumplimiento: calcCumplimiento(seccion.filas),
          filas: seccion.filas.map((fila) => ({
            item: fila.item,
            calificacion: fila.calificacion,
            hallazgos: fila.hallazgos,
            planAccion: fila.planAccion,
          })),
        })),
        observacionesGenerales: observacionesGenerales || undefined,
      };

      const fotos = secciones.flatMap((seccion) => seccion.filas.flatMap((fila) => fila.fotos));
      await calidadService.guardarVerificacionInstalaciones(payload, fotos);
      navigate(ROUTES.LIBERACION);
    } catch (e) {
      console.error(e);
      setError("No fue posible guardar la verificación. Intenta de nuevo.");
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
          <h1 className="nr-header-title">Verificación de instalaciones planta</h1>
        </div>
      </div>

      {error && (
        <div className="nr-error">
          <p className="nr-error-text">{error}</p>
        </div>
      )}

      <div className="nr-card">
        <div className="nr-form-grid-1">
          <SelectField
            label="Zona"
            required
            placeholder="Selecciona una zona"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            options={ZONAS_CALIDAD.map((z) => ({ value: z, label: z }))}
          />
        </div>

        {secciones.map((seccion) => {
          const cumplimiento = seccionesCumplimiento.find((s) => s.id === seccion.id)?.cumplimiento ?? 0;
          return (
            <section key={seccion.id} className="vi-section">
              <div className="vi-section-header">
                <h2 className="nr-step-title">{seccion.titulo}</h2>
                <span className="vi-cumplimiento">Cumplimiento: {cumplimiento}%</span>
              </div>

              <div className="vi-grid-head">
                <span>Ítem</span>
                <span>Calificación</span>
                <span>Hallazgos</span>
                <span>Plan de acción</span>
                <span>Fotos</span>
              </div>

              {seccion.filas.map((fila) => (
                <div key={fila.id} className="vi-grid-row">
                  <p className="vi-item-text">{fila.item}</p>
                  <SelectField
                    label=""
                    value={fila.calificacion}
                    onChange={(e) => actualizarFila(seccion.id, fila.id, "calificacion", Number(e.target.value) as Calificacion)}
                    options={[
                      { value: 1, label: "1" },
                      { value: 2, label: "2" },
                    ]}
                  />
                  <TextAreaField
                    label=""
                    rows={2}
                    placeholder="Hallazgos encontrados..."
                    value={fila.hallazgos}
                    onChange={(e) => actualizarFila(seccion.id, fila.id, "hallazgos", e.target.value)}
                  />
                  <TextAreaField
                    label=""
                    rows={2}
                    placeholder="Plan de acción..."
                    value={fila.planAccion}
                    onChange={(e) => actualizarFila(seccion.id, fila.id, "planAccion", e.target.value)}
                  />
                  <div className="vi-fotos-col">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      iconLeft="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8"
                      onClick={() => fileRefs.current[fila.id]?.click()}
                    >
                      Cámara
                    </Button>
                    <input
                      ref={(el) => {
                        fileRefs.current[fila.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      className="vi-file-input"
                      onChange={(e) => onSelectFotos(seccion.id, fila.id, e)}
                    />
                    <p className="vi-fotos-count">{fila.fotos.length} foto(s)</p>
                  </div>
                </div>
              ))}
            </section>
          );
        })}

        <TextAreaField
          label="Observaciones generales"
          rows={3}
          placeholder="Observaciones finales de la verificación..."
          value={observacionesGenerales}
          onChange={(e) => setObservacionesGenerales(e.target.value)}
        />

        <div className="vi-total">
          <p className="nr-step-title">Cumplimiento total</p>
          <p className="vi-total-value">{cumplimientoTotal}%</p>
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
