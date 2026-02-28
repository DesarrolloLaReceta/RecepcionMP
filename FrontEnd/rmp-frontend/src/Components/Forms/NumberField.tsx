import { forwardRef, type InputHTMLAttributes, useRef } from "react";
import {
  type FieldBaseProps, FieldWrapper,
  fieldInputBase, fieldInputStyle,
  fieldInputFocusColor, fieldInputErrorColor, fieldInputNormalColor,
} from "./TextField";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface NumberFieldProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  /** Unidad de medida que se muestra como badge a la derecha (°C, Kg, %, etc.) */
  unit?: string;
  /** Si es true, muestra botones +/- para incrementar/decrementar */
  stepper?: boolean;
  /** Step para los botones +/- (default: coincide con el step del input o 1) */
  stepperStep?: number;
  /** Formato de display: "decimal" | "currency" | "none" (default "none") */
  format?: "decimal" | "currency" | "none";
  /** Decimales a mostrar cuando format !== "none" */
  decimals?: number;
  /** Rango: si el valor está fuera, muestra alerta visual */
  rangeMin?: number;
  rangeMax?: number;
}

// ─── NUMBERFIELD ──────────────────────────────────────────────────────────────

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
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
    { label, error, hint, required, fullWidth = true, className = "",
      unit, stepper, stepperStep, format = "none", decimals = 2,
      rangeMin, rangeMax, value, onChange, onFocus, onBlur, style,
      min, max, step = 1, ...rest },
    ref
  ) {
    const internalRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    const numVal = value !== undefined && value !== "" ? Number(value) : undefined;

    // Validación de rango (sin sobreescribir error del padre)
    const outOfRange = numVal !== undefined && (
      (rangeMin !== undefined && numVal < rangeMin) ||
      (rangeMax !== undefined && numVal > rangeMax)
    );
    const effectiveError = error ?? (outOfRange
      ? `Fuera de rango (${rangeMin ?? "—"} – ${rangeMax ?? "—"} ${unit ?? ""})`
      : undefined);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = effectiveError ? fieldInputErrorColor : fieldInputFocusColor;
      onFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = effectiveError ? fieldInputErrorColor : fieldInputNormalColor;
      onBlur?.(e);
    };

    const incDec = (delta: number) => {
      const el = resolvedRef.current;
      if (!el) return;
      const cur = parseFloat(el.value || "0");
      const s   = stepperStep ?? Number(step);
      const next = parseFloat((cur + delta * s).toFixed(10));
      const clamped =
        min !== undefined && next < Number(min) ? Number(min) :
        max !== undefined && next > Number(max) ? Number(max) :
        next;
      el.value = String(clamped);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      onChange?.({ target: el } as React.ChangeEvent<HTMLInputElement>);
    };

    const paddingRight = unit && stepper ? "pr-20"
      : unit          ? "pr-14"
      : stepper       ? "pr-14"
      : "";

    return (
      <FieldWrapper label={label} error={effectiveError} hint={!effectiveError ? hint : undefined}
        required={required} fullWidth={fullWidth} className={className}>
        <div className="relative">
          <input
            ref={resolvedRef}
            type="number"
            value={value}
            onChange={onChange}
            step={step}
            min={min}
            max={max}
            className={`${fieldInputBase} font-mono ${paddingRight}`}
            style={{
              ...fieldInputStyle,
              ...(effectiveError ? { borderColor: fieldInputErrorColor } : {}),
              ...style,
              // Ocultar flechas nativas del input number
              MozAppearance: "textfield" as any,
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />

          {/* Bloque derecho: unidad + stepper */}
          <div className="absolute right-0 top-0 h-full flex items-stretch overflow-hidden rounded-r-lg">
            {/* Badge unidad */}
            {unit && (
              <div className="flex items-center px-2.5 text-[11px] font-mono select-none shrink-0"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderLeft: "1px solid rgba(255,255,255,0.07)",
                  color: outOfRange ? "#FCA5A5" : "#64748B",
                }}>
                {unit}
              </div>
            )}

            {/* Botones stepper */}
            {stepper && (
              <div className="flex flex-col shrink-0"
                style={{ borderLeft: unit ? "none" : "1px solid rgba(255,255,255,0.07)" }}>
                <button type="button" tabIndex={-1}
                  onClick={() => incDec(1)}
                  className="flex-1 flex items-center justify-center px-2 transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                    stroke="#64748B" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <button type="button" tabIndex={-1}
                  onClick={() => incDec(-1)}
                  className="flex-1 flex items-center justify-center px-2 transition-colors"
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                    stroke="#64748B" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </FieldWrapper>
    );
  }
);

export default NumberField;