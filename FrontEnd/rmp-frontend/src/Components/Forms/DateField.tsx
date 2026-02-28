import { forwardRef, type InputHTMLAttributes } from "react";
import { type FieldBaseProps, FieldWrapper } from "./TextField";
import "./StylesForms/Fields.css";
import "./StylesForms/DateField.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface DateFieldProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  /** "date" (default) | "datetime-local" | "time" */
  variant?: "date" | "datetime-local" | "time";
  /**
   * Muestra una pastilla debajo indicando cuántos días faltan
   * (o cuántos han pasado si el valor es negativo).
   */
  showCountdown?: boolean;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function diasParaFecha(iso: string): number {
  const hoy  = new Date(); hoy.setHours(0, 0, 0, 0);
  const dest = new Date(iso); dest.setHours(0, 0, 0, 0);
  return Math.round((dest.getTime() - hoy.getTime()) / 86_400_000);
}

function countdownColor(dias: number): string {
  if (dias < 0)   return "#FCA5A5";   // vencido
  if (dias <= 7)  return "#FCA5A5";   // próximo a vencer
  if (dias <= 30) return "#FCD34D";   // advertencia
  return "#86EFAC";                   // ok
}

function countdownLabel(dias: number): string {
  if (dias === 0) return "Hoy";
  if (dias < 0)   return `Hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? "s" : ""}`;
  if (dias === 1) return "Mañana";
  return `En ${dias} días`;
}

// ─── DATE FIELD ───────────────────────────────────────────────────────────────

/**
 * Selector de fecha/hora del sistema.
 *
 * @example
 * <DateField
 *   label="Fecha de vencimiento"
 *   required
 *   value={form.fechaVencimiento}
 *   onChange={e => setForm(p => ({ ...p, fechaVencimiento: e.target.value }))}
 *   showCountdown
 * />
 *
 * // Con variante datetime-local
 * <DateField
 *   label="Fecha y hora de recepción"
 *   variant="datetime-local"
 *   value={form.fechaRecepcion}
 *   onChange={e => setForm(p => ({ ...p, fechaRecepcion: e.target.value }))}
 * />
 */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  function DateField(
    {
      label,
      error,
      hint,
      required,
      fullWidth = true,
      className = "",
      variant   = "date",
      showCountdown,
      value,
      style,
      ...rest
    },
    ref
  ) {
    const dias  = showCountdown && value
      ? diasParaFecha(String(value).slice(0, 10))
      : null;
    const color = dias !== null ? countdownColor(dias) : "";

    return (
      <FieldWrapper
        label={label}
        error={error}
        hint={hint}
        required={required}
        fullWidth={fullWidth}
        className={className}
      >
        <div className="field-input-wrapper">

          {/* Ícono calendario */}
          <svg
            className="field-icon-left"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8"  y1="2" x2="8"  y2="6" />
            <line x1="3"  y1="10" x2="21" y2="10" />
          </svg>

          <input
            ref={ref}
            type={variant}
            value={value}
            data-error={error ? true : undefined}
            className="field-input field-input-with-icon field-date"
            style={style}
            {...rest}
          />
        </div>

        {/* Countdown — solo cuando hay valor y showCountdown=true */}
        {dias !== null && value && (
          <div className="field-countdown">
            <span
              className="field-countdown-dot"
              style={{ background: color }}
              aria-hidden="true"
            />
            <span
              className="field-countdown-label"
              style={{ color }}
            >
              {countdownLabel(dias)}
            </span>
          </div>
        )}
      </FieldWrapper>
    );
  }
);

export default DateField;