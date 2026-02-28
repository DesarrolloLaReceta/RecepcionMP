import { type ReactNode, forwardRef, type InputHTMLAttributes } from "react";
import "./StylesForms/Fields.css";

// ─── TIPOS BASE ───────────────────────────────────────────────────────────────

export interface FieldBaseProps {
  /** Label visible encima del campo */
  label?:     string;
  /** Texto de error — activa el estado de error visual */
  error?:     string;
  /** Texto auxiliar debajo del campo */
  hint?:      string;
  /** Asterisco rojo — marca el campo como requerido */
  required?:  boolean;
  /** Ocupa todo el ancho del padre (default: true) */
  fullWidth?: boolean;
  /** Clase extra para el contenedor externo */
  className?: string;
}

export interface TextFieldProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  /** SVG path para ícono decorativo a la izquierda */
  leadingIcon?: string;
}

// ─── CONSTANTES EXPORTADAS ────────────────────────────────────────────────────
// Mantenemos los exports para compatibilidad con los demás campos que las
// importan. Ahora apuntan a clases CSS en lugar de valores Tailwind/inline.

/** Clase CSS del label */
export const fieldLabelCls = "field-label";

/** Clase CSS base del input/select/textarea */
export const fieldInputBase = "field-input";

/** Objeto de estilos inline — vacío: todo lo maneja Fields.css */
export const fieldInputStyle: React.CSSProperties = {};

/**
 * Los colores de focus/error/normal ya no se aplican via JS.
 * CSS los maneja con :focus y [data-error="true"].
 * Se mantienen como strings vacíos para no romper imports existentes.
 */
export const fieldInputFocusColor  = "";
export const fieldInputErrorColor  = "";
export const fieldInputNormalColor = "";

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────

/**
 * Contenedor estándar: label + children + error/hint.
 * Usado por todos los campos del sistema.
 */
export function FieldWrapper({
  label,
  error,
  hint,
  required,
  fullWidth = true,
  className = "",
  children,
}: FieldBaseProps & { children: ReactNode }) {
  const cls = [
    "field-wrapper",
    fullWidth && "field-wrapper-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      {label && (
        <label className="field-label">
          {label}
          {required && <span className="field-required-mark" aria-hidden="true">*</span>}
        </label>
      )}

      {children}

      {error && (
        <p className="field-error-msg" role="alert">⚠ {error}</p>
      )}
      {hint && !error && (
        <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}

// ─── TEXT FIELD ───────────────────────────────────────────────────────────────

/**
 * Campo de texto estándar del sistema.
 *
 * @example
 * <TextField
 *   label="Número de factura"
 *   required
 *   placeholder="FAC-0001…"
 *   value={form.numero}
 *   onChange={e => setForm(p => ({ ...p, numero: e.target.value }))}
 * />
 *
 * // Con ícono izquierdo
 * <TextField
 *   label="Buscar proveedor"
 *   leadingIcon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
 *   placeholder="Razón social o NIT…"
 * />
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      error,
      hint,
      required,
      fullWidth = true,
      className = "",
      leadingIcon,
      style,
      ...rest
    },
    ref
  ) {
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
          {leadingIcon && (
            <svg
              className="field-icon-left"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d={leadingIcon} />
            </svg>
          )}

          <input
            ref={ref}
            data-error={error ? true : undefined}
            className={[
              "field-input",
              leadingIcon && "field-input-with-icon",
            ]
              .filter(Boolean)
              .join(" ")}
            style={style}
            {...rest}
          />
        </div>
      </FieldWrapper>
    );
  }
);

export default TextField;