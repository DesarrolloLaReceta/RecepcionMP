import { forwardRef, type InputHTMLAttributes } from "react";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface FieldBaseProps {
  /** Label visible encima del campo */
  label?: string;
  /** Texto de error — muestra el campo en estado error */
  error?: string;
  /** Texto auxiliar debajo del campo */
  hint?: string;
  /** Asterisco rojo — marca el campo como requerido */
  required?: boolean;
  /** Ocupa todo el ancho del padre (default true) */
  fullWidth?: boolean;
  /** Clase extra para el contenedor externo */
  className?: string;
}

export interface TextFieldProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  /** Ícono SVG path(s) para mostrar a la izquierda */
  leadingIcon?: string;
}

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────

export const fieldLabelCls =
  "text-[11px] font-semibold tracking-wider uppercase font-mono text-[#64748B]";

export const fieldInputBase =
  "w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors";

export const fieldInputStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#CBD5E1",
} as React.CSSProperties;

export const fieldInputFocusColor  = "rgba(245,158,11,0.3)";
export const fieldInputErrorColor  = "rgba(239,68,68,0.4)";
export const fieldInputNormalColor = "rgba(255,255,255,0.08)";

// ─── COMPONENTE LABEL + ERROR + HINT ─────────────────────────────────────────

export function FieldWrapper({
  label, error, hint, required, fullWidth = true, className = "", children,
}: FieldBaseProps & { children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""} ${className}`}>
      {label && (
        <label className={fieldLabelCls}>
          {label}
          {required && <span className="text-[#FCA5A5] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-[11px] font-mono" style={{ color: "#FCA5A5" }}>
          ⚠ {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[10px] text-[#334155] font-mono leading-relaxed">{hint}</p>
      )}
    </div>
  );
}

// ─── TEXTFIELD ────────────────────────────────────────────────────────────────

/**
 * Campo de texto estándar del sistema.
 *
 * @example
 * <TextField
 *   label="Nombre"
 *   required
 *   placeholder="Razón social…"
 *   value={form.nombre}
 *   onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
 * />
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, error, hint, required, fullWidth = true, className = "",
      leadingIcon, onFocus, onBlur, style, ...rest },
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

    return (
      <FieldWrapper label={label} error={error} hint={hint}
        required={required} fullWidth={fullWidth} className={className}>
        <div className="relative">
          {leadingIcon && (
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
              <path d={leadingIcon} />
            </svg>
          )}
          <input
            ref={ref}
            className={`${fieldInputBase} ${leadingIcon ? "pl-9" : ""}`}
            style={{
              ...fieldInputStyle,
              ...(error ? { borderColor: fieldInputErrorColor } : {}),
              ...style,
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
        </div>
      </FieldWrapper>
    );
  }
);

export default TextField;