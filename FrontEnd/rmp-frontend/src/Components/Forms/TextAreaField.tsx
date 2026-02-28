import { forwardRef, type TextareaHTMLAttributes, useEffect, useRef } from "react";
import { type FieldBaseProps, FieldWrapper } from "./TextField";
import "./StylesForms/Fields.css";
import "./StylesForms/TextAreaField.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface TextAreaFieldProps
  extends FieldBaseProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  /**
   * Si es true, el textarea crece automáticamente con el contenido
   * hasta alcanzar `maxRows` (si se especifica).
   */
  autoGrow?:   boolean;
  /** Número máximo de filas visibles en modo autoGrow */
  maxRows?:    number;
  /** Muestra un contador "X / maxLength" en la esquina inferior derecha */
  showCounter?: boolean;
  /** Controla si el textarea es redimensionable manualmente */
  resize?:     "none" | "vertical" | "both";
}

// ─── TEXTAREA FIELD ───────────────────────────────────────────────────────────

/**
 * Área de texto estilizada del sistema con contador de caracteres
 * y crecimiento automático.
 *
 * @example
 * <TextAreaField
 *   label="Descripción"
 *   placeholder="Describe los criterios de aceptación…"
 *   rows={3}
 *   showCounter
 *   maxLength={500}
 *   value={form.descripcion}
 *   onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
 * />
 *
 * // Auto-creciente
 * <TextAreaField
 *   label="Observaciones"
 *   autoGrow
 *   maxRows={8}
 *   value={obs}
 *   onChange={e => setObs(e.target.value)}
 * />
 */
export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField(
    {
      label,
      error,
      hint,
      required,
      fullWidth    = true,
      className    = "",
      autoGrow,
      maxRows,
      showCounter,
      resize       = "none",
      value,
      onChange,
      style,
      rows         = 3,
      maxLength,
      ...rest
    },
    ref
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? internalRef;

    // ── Auto-grow — depende de scrollHeight, debe permanecer en JS ────────────
    useEffect(() => {
      if (!autoGrow) return;
      const el = resolvedRef.current;
      if (!el) return;

      el.style.height    = "auto";
      const lineHeight   = parseInt(getComputedStyle(el).lineHeight  || "20", 10);
      const paddingY     = parseInt(getComputedStyle(el).paddingTop  || "10", 10) * 2;
      const maxHeight    = maxRows ? lineHeight * maxRows + paddingY : Infinity;
      el.style.height    = Math.min(el.scrollHeight, maxHeight) + "px";
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [value, autoGrow, maxRows, resolvedRef]);

    // ── Contador de caracteres ────────────────────────────────────────────────
    const charCount   = value !== undefined ? String(value).length : 0;
    const nearLimit   = maxLength !== undefined && charCount > maxLength * 0.85;
    const overLimit   = maxLength !== undefined && charCount > maxLength;
    const counterColor = overLimit  ? "#FCA5A5"
                       : nearLimit  ? "#FCD34D"
                       : "#334155";

    // ─────────────────────────────────────────────────────────────────────────

    return (
      <FieldWrapper
        label={label}
        error={error}
        hint={hint}
        required={required}
        fullWidth={fullWidth}
        className={className}
      >
        <div className="field-textarea-wrapper">

          <textarea
            ref={resolvedRef}
            value={value}
            rows={autoGrow ? 1 : rows}
            maxLength={maxLength}
            onChange={onChange}
            data-error={error                       ? true    : undefined}
            data-resize={resize}
            className={[
              "field-input",
              "field-textarea",
              showCounter && maxLength !== undefined && "field-textarea-with-counter",
            ]
              .filter(Boolean)
              .join(" ")}
            style={style}
            {...rest}
          />

          {/* Contador de caracteres */}
          {showCounter && maxLength !== undefined && (
            <span
              className="field-char-counter"
              style={{ color: counterColor }}
              aria-live="polite"
            >
              {charCount} / {maxLength}
            </span>
          )}

        </div>
      </FieldWrapper>
    );
  }
);

export default TextAreaField;