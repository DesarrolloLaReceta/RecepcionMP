import { forwardRef, type InputHTMLAttributes, useRef } from "react";
import { type FieldBaseProps, FieldWrapper } from "./TextField";
import "./StylesForms/Fields.css";
import "./StylesForms/NumberField.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface NumberFieldProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  /** Unidad de medida como badge a la derecha (°C, Kg, %, etc.) */
  unit?:        string;
  /** Muestra botones +/- para incrementar/decrementar */
  stepper?:     boolean;
  /** Step para los botones +/- (default: coincide con el step del input o 1) */
  stepperStep?: number;
  /** Formato de display: "decimal" | "currency" | "none" (default: "none") */
  format?:      "decimal" | "currency" | "none";
  /** Decimales cuando format !== "none" */
  decimals?:    number;
  /** Si el valor está fuera del rango, activa alerta visual */
  rangeMin?:    number;
  rangeMax?:    number;
}

// ─── NUMBER FIELD ─────────────────────────────────────────────────────────────

/**
 * Campo numérico con validación visual de rango, badge de unidad y stepper.
 *
 * @example
 * <NumberField
 *   label="Temperatura de recepción"
 *   unit="°C"
 *   rangeMin={0}
 *   rangeMax={4}
 *   value={temp}
 *   onChange={e => setTemp(e.target.value)}
 *   hint="Rango aceptable: 0 °C – 4 °C"
 * />
 *
 * // Con stepper y unidad
 * <NumberField
 *   label="Cantidad recibida"
 *   unit="Kg"
 *   stepper
 *   stepperStep={0.5}
 *   min={0}
 *   value={form.cantidad}
 *   onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))}
 * />
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
    {
      label,
      error,
      hint,
      required,
      fullWidth   = true,
      className   = "",
      unit,
      stepper,
      stepperStep,
      format      = "none",
      decimals    = 2,
      rangeMin,
      rangeMax,
      value,
      onChange,
      style,
      min,
      max,
      step        = 1,
      ...rest
    },
    ref
  ) {
    const internalRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    // ── Validación de rango ───────────────────────────────────────────────────
    const numVal = value !== undefined && value !== "" ? Number(value) : undefined;

    const outOfRange = numVal !== undefined && (
      (rangeMin !== undefined && numVal < rangeMin) ||
      (rangeMax !== undefined && numVal > rangeMax)
    );

    const effectiveError = error ?? (outOfRange
      ? `Fuera de rango (${rangeMin ?? "—"} – ${rangeMax ?? "—"}${unit ? ` ${unit}` : ""})`
      : undefined);

    // ── Stepper ───────────────────────────────────────────────────────────────
    const incDec = (delta: number) => {
      const el = resolvedRef.current;
      if (!el) return;
      const cur     = parseFloat(el.value || "0");
      const s       = stepperStep ?? Number(step);
      const next    = parseFloat((cur + delta * s).toFixed(10));
      const clamped =
        min !== undefined && next < Number(min) ? Number(min) :
        max !== undefined && next > Number(max) ? Number(max) :
        next;
      el.value = String(clamped);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      onChange?.({ target: el } as React.ChangeEvent<HTMLInputElement>);
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
      <FieldWrapper
        label={label}
        error={effectiveError}
        hint={effectiveError ? undefined : hint}
        required={required}
        fullWidth={fullWidth}
        className={className}
      >
        <div className="field-input-wrapper">

          <input
            ref={resolvedRef}
            type="number"
            value={value}
            onChange={onChange}
            step={step}
            min={min}
            max={max}
            data-error={effectiveError  ? true : undefined}
            data-has-unit={unit         ? true : undefined}
            data-has-stepper={stepper   ? true : undefined}
            className="field-input field-number"
            style={style}
            {...rest}
          />

          {/* ── Addon derecho: unidad + stepper ── */}
          {(unit || stepper) && (
            <div className="field-number-addon">

              {/* Badge de unidad */}
              {unit && (
                <div
                  className="field-unit"
                  data-out-of-range={outOfRange ? true : undefined}
                  aria-hidden="true"
                >
                  {unit}
                </div>
              )}

              {/* Botones +/- */}
              {stepper && (
                <div className="field-stepper">
                  <button
                    type="button"
                    tabIndex={-1}
                    className="field-stepper-btn"
                    onClick={() => incDec(1)}
                    aria-label="Incrementar"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" className="field-stepper-icon" aria-hidden="true">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="field-stepper-btn"
                    onClick={() => incDec(-1)}
                    aria-label="Decrementar"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" className="field-stepper-icon" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </FieldWrapper>
    );
  }
);

export default NumberField;