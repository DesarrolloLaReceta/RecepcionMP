import { forwardRef, type InputHTMLAttributes } from "react";
import {
  type FieldBaseProps, FieldWrapper,
  fieldInputBase, fieldInputStyle,
  fieldInputFocusColor, fieldInputErrorColor, fieldInputNormalColor,
} from "./TextField";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface DateFieldProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  /** "date" (default) | "datetime-local" | "time" */
  variant?: "date" | "datetime-local" | "time";
  /**
   * Cuando se pasa, muestra una pastilla debajo del campo indicando
   * cuántos días faltan (o cuántos han pasado si es negativo).
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
  if (dias < 0)   return "#FCA5A5";
  if (dias <= 7)  return "#FCA5A5";
  if (dias <= 30) return "#FCD34D";
  return "#86EFAC";
}

function countdownLabel(dias: number): string {
  if (dias === 0)   return "Hoy";
  if (dias < 0)     return `Hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? "s" : ""}`;
  if (dias === 1)   return "Mañana";
  return `En ${dias} días`;
}

// ─── DATEFIELD ────────────────────────────────────────────────────────────────

/**
 * Selector de fecha/hora del sistema.
 *
 * @example
 * <DateField
 *   label="Fecha de entrega esperada"
 *   min={today}
 *   value={form.fechaEntrega}
 *   onChange={e => setForm(p => ({ ...p, fechaEntrega: e.target.value }))}
 *   showCountdown
 * />
 */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  function DateField(
    { label, error, hint, required, fullWidth = true, className = "",
      variant = "date", showCountdown, value, onFocus, onBlur, style, ...rest },
    ref
  ) {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = error ? fieldInputErrorColor : fieldInputFocusColor;
      onFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = error ? fieldInputErrorColor : fieldInputNormalColor;
      onBlur?.(e);
    };

    const dias   = showCountdown && value ? diasParaFecha(String(value).slice(0, 10)) : null;
    const color  = dias !== null ? countdownColor(dias) : "";

    return (
      <FieldWrapper label={label} error={error} hint={hint}
        required={required} fullWidth={fullWidth} className={className}>

        <div className="relative">
          {/* Ícono calendario */}
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>

          <input
            ref={ref}
            type={variant}
            value={value}
            className={`${fieldInputBase} pl-9`}
            style={{
              ...fieldInputStyle,
              ...(error ? { borderColor: fieldInputErrorColor } : {}),
              ...style,
              // Forzar color del picker nativo
              colorScheme: "dark",
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
        </div>

        {/* Countdown badge */}
        {dias !== null && value && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[10px] font-mono" style={{ color }}>
              {countdownLabel(dias)}
            </span>
          </div>
        )}
      </FieldWrapper>
    );
  }
);

export default DateField;