// ─── COMPONENTES DE FORMULARIO ────────────────────────────────────────────────
// Importar siempre desde este barrel para evitar paths relativos profundos.
//
// @example
//   import { TextField, SelectField, DateField, NumberField, TextAreaField }
//     from "../../components/forms";

export { TextField, FieldWrapper } from "./TextField";
export type { TextFieldProps, FieldBaseProps } from "./TextField";

// Tokens de estilo reutilizables para inputs custom que no usen los componentes
export {
  fieldLabelCls,
  fieldInputBase,
  fieldInputStyle,
  fieldInputFocusColor,
  fieldInputErrorColor,
  fieldInputNormalColor,
} from "./TextField";

export { DateField } from "./DateField";
export type { DateFieldProps } from "./DateField";

export { NumberField } from "./NumberField";
export type { NumberFieldProps } from "./NumberField";

export { SelectField } from "./SelectField";
export type { SelectFieldProps, SelectOption, SelectOptionGroup, SelectOptions } from "./SelectField";

export { TextAreaField } from "./TextAreaField";
export type { TextAreaFieldProps } from "./TextAreaField";