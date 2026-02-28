import { forwardRef, type SelectHTMLAttributes } from "react";
import {
  type FieldBaseProps, FieldWrapper,
  fieldInputBase, fieldInputStyle,
  fieldInputFocusColor, fieldInputErrorColor, fieldInputNormalColor,
} from "./TextField";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string | number;
  label: string;
  /** Deshabilita la opción individualmente */
  disabled?: boolean;
}

export interface SelectOptionGroup {
  group: string;
  options: SelectOption[];
}

export type SelectOptions = SelectOption[] | SelectOptionGroup[];

function isGrouped(opts: SelectOptions): opts is SelectOptionGroup[] {
  return opts.length > 0 && "group" in opts[0];
}

export interface SelectFieldProps
  extends FieldBaseProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  options: SelectOptions;
  /**
   * Texto del placeholder (opción vacía al inicio).
   * Si no se pasa, no se agrega la opción vacía.
   */
  placeholder?: string;
  /** Muestra un indicador de carga en lugar de las opciones */
  loading?: boolean;
}

// ─── SELECTFIELD ──────────────────────────────────────────────────────────────

/**
 * Select estilizado del sistema, compatible con opciones planas y agrupadas.
 *
 * @example
 * // Opciones planas
 * <SelectField
 *   label="Categoría"
 *   required
 *   placeholder="Selecciona una categoría"
 *   value={form.categoriaId}
 *   onChange={e => setForm(p => ({ ...p, categoriaId: e.target.value }))}
 *   options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
 * />
 *
 * // Opciones agrupadas
 * <SelectField
 *   label="Estado"
 *   options={[
 *     { group: "Activos", options: [{ value: 0, label: "Abierta" }] },
 *     { group: "Cerrados", options: [{ value: 3, label: "Cerrada" }] },
 *   ]}
 * />
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    { label, error, hint, required, fullWidth = true, className = "",
      options, placeholder, loading, value, onFocus, onBlur, style, ...rest },
    ref
  ) {
    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = error ? fieldInputErrorColor : fieldInputFocusColor;
      onFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = error ? fieldInputErrorColor : fieldInputNormalColor;
      onBlur?.(e);
    };

    const renderOptions = () => {
      if (loading) {
        return <option disabled value="">Cargando…</option>;
      }
      const grouped = isGrouped(options);
      return grouped
        ? (options as SelectOptionGroup[]).map(g => (
            <optgroup key={g.group} label={g.group}>
              {g.options.map(o => (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))
        : (options as SelectOption[]).map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ));
    };

    return (
      <FieldWrapper
        label={label} error={error} hint={hint}
        required={required} fullWidth={fullWidth} className={className}
      >
        <div className="relative">
          <select
            ref={ref}
            value={value}
            className={`${fieldInputBase} pr-9 appearance-none cursor-pointer`}
            style={{
              ...fieldInputStyle,
              // El color del placeholder (opción vacía) lo manejamos con CSS
              color: value === "" || value === undefined ? "#475569" : "#CBD5E1",
              ...(error ? { borderColor: fieldInputErrorColor } : {}),
              ...style,
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          >
            {placeholder !== undefined && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {renderOptions()}
          </select>

          {/* Chevron derecho */}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </FieldWrapper>
    );
  }
);

export default SelectField;