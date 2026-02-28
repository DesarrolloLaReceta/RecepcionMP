import { forwardRef,type TextareaHTMLAttributes, useEffect, useRef } from "react";
import {
  type FieldBaseProps, FieldWrapper,
  fieldInputBase, fieldInputStyle,
  fieldInputFocusColor, fieldInputErrorColor, fieldInputNormalColor,
} from "./TextField";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface TextAreaFieldProps
  extends FieldBaseProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  /**
   * Si es true, el textarea crece automáticamente con el contenido
   * hasta alcanzar `maxRows` (si se especifica).
   */
  autoGrow?: boolean;
  /** Número máximo de filas visibles en modo autoGrow */
  maxRows?: number;
  /** Muestra un contador "X / maxLength" en la esquina inferior derecha */
  showCounter?: boolean;
  /** Controla si el textarea es redimensionable manualmente: "none" | "vertical" | "both" */
  resize?: "none" | "vertical" | "both";
}

// ─── TEXTAREA FIELD ────────────────────────────────────────────────────────────

/**
 * Área de texto estilizada del sistema con soporte de contador de caracteres
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
      label, error, hint, required, fullWidth = true, className = "",
      autoGrow, maxRows, showCounter, resize = "none",
      value, onFocus, onBlur, onChange, style,
      rows = 3, maxLength, ...rest
    },
    ref
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? internalRef;

    // ── Auto-grow ─────────────────────────────────────────────────────────────
    useEffect(() => {
      if (!autoGrow) return;
      const el = resolvedRef.current;
      if (!el) return;

      el.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(el).lineHeight || "20", 10);
      const paddingY   = parseInt(getComputedStyle(el).paddingTop || "10", 10) * 2;
      const maxHeight  = maxRows ? lineHeight * maxRows + paddingY : Infinity;
      el.style.height  = Math.min(el.scrollHeight, maxHeight) + "px";
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [value, autoGrow, maxRows, resolvedRef]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = error ? fieldInputErrorColor : fieldInputFocusColor;
      onFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = error ? fieldInputErrorColor : fieldInputNormalColor;
      onBlur?.(e);
    };

    const charCount   = value !== undefined ? String(value).length : 0;
    const nearLimit   = maxLength && charCount > maxLength * 0.85;
    const overLimit   = maxLength && charCount > maxLength;
    const counterColor = overLimit ? "#FCA5A5" : nearLimit ? "#FCD34D" : "#334155";

    return (
      <FieldWrapper
        label={label} error={error} hint={hint}
        required={required} fullWidth={fullWidth} className={className}
      >
        <div className="relative">
          <textarea
            ref={resolvedRef}
            value={value}
            rows={autoGrow ? 1 : rows}
            maxLength={maxLength}
            onChange={onChange}
            className={`${fieldInputBase} leading-relaxed`}
            style={{
              ...fieldInputStyle,
              resize,
              ...(error ? { borderColor: fieldInputErrorColor } : {}),
              // Espacio para el contador si está activo
              paddingBottom: showCounter && maxLength ? "1.75rem" : undefined,
              ...style,
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />

          {/* Contador caracteres */}
          {showCounter && maxLength !== undefined && (
            <span
              className="absolute bottom-2 right-3 text-[10px] font-mono pointer-events-none select-none"
              style={{ color: counterColor }}
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