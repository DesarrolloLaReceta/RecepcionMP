import { forwardRef, type SelectHTMLAttributes } from "react";
import { type FieldBaseProps, FieldWrapper } from "./TextField";
import "./StylesForms/Fields.css";
import "./StylesForms/SelectField.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value:     string | number;
  label:     string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  group:   string;
  options: SelectOption[];
}

export type SelectOptions = SelectOption[] | SelectOptionGroup[];

function isGrouped(opts: SelectOptions): opts is SelectOptionGroup[] {
  return opts.length > 0 && "group" in opts[0];
}

export interface SelectFieldProps
  extends FieldBaseProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  options:      SelectOptions;
  /**
   * Texto del placeholder (opción vacía al inicio).
   * Si no se pasa, no se agrega la opción vacía.
   */
  placeholder?: string;
  /** Muestra un indicador de carga en lugar de las opciones */
  loading?:     boolean;
}

// ─── SELECT FIELD ─────────────────────────────────────────────────────────────

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
 *     { group: "Activos",   options: [{ value: 0, label: "Abierta"  }] },
 *     { group: "Cerrados",  options: [{ value: 3, label: "Cerrada"  }] },
 *   ]}
 * />
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    {
      label,
      error,
      hint,
      required,
      fullWidth = true,
      className = "",
      options,
      placeholder,
      loading,
      value,
      style,
      ...rest
    },
    ref
  ) {
    // Determina si el select está en estado "sin valor" (placeholder visible)
    const isEmpty = value === "" || value === undefined || value === null;

    const renderOptions = () => {
      if (loading) {
        return <option disabled value="">Cargando…</option>;
      }

      if (isGrouped(options)) {
        return (options as SelectOptionGroup[]).map(g => (
          <optgroup key={g.group} label={g.group}>
            {g.options.map(o => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ));
      }

      return (options as SelectOption[]).map(o => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ));
    };

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
          <select
            ref={ref}
            value={value}
            data-error={error    ? true      : undefined}
            data-empty={isEmpty  ? true      : undefined}
            className="field-input field-select"
            style={style}
            {...rest}
          >
            {placeholder !== undefined && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {renderOptions()}
          </select>

          {/* Chevron custom — reemplaza la flecha nativa del SO */}
          <svg
            className="field-select-chevron"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </FieldWrapper>
    );
  }
);

export default SelectField;