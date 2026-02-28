// ─── UTILS / VALIDATORS ───────────────────────────────────────────────────────
// Validaciones para formularios y reglas de negocio del sistema RMP.
// Todos los validadores son funciones puras — sin efectos secundarios.
//
// Patrón de uso:
//   const err = required(valor) ?? isEmail(valor);
//   if (err) showError(err);
//
// @example
//   import { required, isNIT, isEmail, validateProveedor } from "../../utils/validators";

import { isBefore, daysUntilExpiry, hasMinimumShelfLife, parseDate } from "./dates";

// ─── TIPO BASE ────────────────────────────────────────────────────────────────

/**
 * Retorna un mensaje de error si la validación falla, o `undefined` si pasa.
 * Úsalo con `??` para encadenar validadores:
 *   `const err = required(v) ?? minLength(v, 3) ?? isEmail(v);`
 */
export type Validator<T = string> = (value: T) => string | undefined;

/**
 * Resultado de una validación de formulario completo.
 * Claves = nombre del campo, valor = mensaje de error o undefined.
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>;

// ─── VALIDADORES DE CAMPO ─────────────────────────────────────────────────────

/** Campo obligatorio — string, número o array. */
export function required(value: unknown): string | undefined {
  if (value === null || value === undefined) return "Campo obligatorio.";
  if (typeof value === "string" && value.trim() === "") return "Campo obligatorio.";
  if (Array.isArray(value) && value.length === 0) return "Selecciona al menos un elemento.";
  return undefined;
}

/** Longitud mínima de texto (ignora espacios extremos). */
export function minLength(value: string, min: number): string | undefined {
  if (value.trim().length < min) return `Mínimo ${min} caracteres.`;
  return undefined;
}

/** Longitud máxima de texto. */
export function maxLength(value: string, max: number): string | undefined {
  if (value.length > max) return `Máximo ${max} caracteres.`;
  return undefined;
}

/** Solo letras, números y espacios (sin caracteres especiales). */
export function alphanumeric(value: string): string | undefined {
  if (!/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ\-.,()]+$/.test(value.trim()))
    return "Solo se permiten letras, números y caracteres básicos.";
  return undefined;
}

// ─── COLOMBIA: IDENTIFICACIONES ───────────────────────────────────────────────

/**
 * NIT colombiano.
 * Formatos aceptados: "900123456", "900.123.456", "900123456-7", "900.123.456-7"
 * El dígito de verificación (después del guion) es opcional en UI — solo valida
 * que el cuerpo sea numérico de 6-10 dígitos.
 *
 * @example isNIT("900123456-7") → undefined (válido)
 * @example isNIT("ABC123")      → "NIT inválido…"
 */
export function isNIT(value: string): string | undefined {
  if (!value) return undefined; // campo opcional — usar required() si es obligatorio
  const clean = value.replace(/[\s.]/g, ""); // quitar puntos y espacios
  if (!/^\d{6,10}(-\d)?$/.test(clean))
    return "NIT inválido. Formato esperado: 900123456 o 900123456-7.";
  return undefined;
}

/**
 * Cédula de ciudadanía / extranjería colombiana.
 * 5-10 dígitos, sin guiones ni puntos.
 */
export function isCedula(value: string): string | undefined {
  if (!value) return undefined;
  const clean = value.replace(/[\s.]/g, "");
  if (!/^\d{5,10}$/.test(clean))
    return "Número de identificación inválido (5-10 dígitos).";
  return undefined;
}

// ─── CONTACTO ─────────────────────────────────────────────────────────────────

/**
 * Email básico (RFC 5322 simplificado).
 *
 * @example isEmail("user@empresa.com.co") → undefined
 * @example isEmail("user@@empresa")       → "Correo electrónico inválido."
 */
export function isEmail(value: string): string | undefined {
  if (!value) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()))
    return "Correo electrónico inválido.";
  return undefined;
}

/**
 * Teléfono colombiano.
 * Acepta: celular (3XX-XXX-XXXX), fijo (60X XXXXXXX), con/sin guiones/espacios.
 *
 * @example isTelefono("300 123 4567")  → undefined
 * @example isTelefono("(601) 2345678") → undefined
 * @example isTelefono("123")           → "Teléfono inválido…"
 */
export function isTelefono(value: string): string | undefined {
  if (!value) return undefined;
  const clean = value.replace(/[\s\-().+]/g, "");
  if (!/^\d{7,12}$/.test(clean))
    return "Teléfono inválido. Ingresa entre 7 y 12 dígitos.";
  return undefined;
}

// ─── NUMÉRICOS ────────────────────────────────────────────────────────────────

/** Valor numérico mínimo. */
export function minValue(value: number, min: number): string | undefined {
  if (value < min) return `El valor mínimo es ${min}.`;
  return undefined;
}

/** Valor numérico máximo. */
export function maxValue(value: number, max: number): string | undefined {
  if (value > max) return `El valor máximo es ${max}.`;
  return undefined;
}

/** Rango numérico inclusivo. */
export function inRange(value: number, min: number, max: number): string | undefined {
  return minValue(value, min) ?? maxValue(value, max);
}

/**
 * Temperatura dentro del rango aceptable del ítem.
 * Retorna `undefined` si la temperatura está dentro del rango, mensaje si está fuera.
 */
export function isTemperaturaEnRango(
  medida: number | null | undefined,
  min:    number | null | undefined,
  max:    number | null | undefined
): string | undefined {
  if (medida === null || medida === undefined) return undefined; // no aplica
  if (min !== null && min !== undefined && medida < min)
    return `Temperatura ${medida} °C está por debajo del mínimo permitido (${min} °C).`;
  if (max !== null && max !== undefined && medida > max)
    return `Temperatura ${medida} °C supera el máximo permitido (${max} °C).`;
  return undefined;
}

/**
 * Cantidad positiva y no cero.
 */
export function isCantidadValida(
  cantidad: number | null | undefined,
  min = 0.001
): string | undefined {
  if (cantidad === null || cantidad === undefined || isNaN(Number(cantidad)))
    return "Ingresa una cantidad válida.";
  if (cantidad < min) return `La cantidad debe ser mayor a ${min}.`;
  return undefined;
}

// ─── FECHAS DE LOTE (BPM) ────────────────────────────────────────────────────

/**
 * Fecha de vencimiento posterior a la de fabricación.
 */
export function isFechaVencimientoPostFabricacion(
  fechaVencimiento: string | null | undefined,
  fechaFabricacion: string | null | undefined
): string | undefined {
  if (!fechaVencimiento || !fechaFabricacion) return undefined;
  if (!isBefore(fechaFabricacion, fechaVencimiento))
    return "La fecha de vencimiento debe ser posterior a la de fabricación.";
  return undefined;
}

/**
 * Fecha de vencimiento en el futuro (no vencido al recibir).
 */
export function isFechaVencimientoFutura(
  fechaVencimiento: string | null | undefined
): string | undefined {
  if (!fechaVencimiento) return undefined;
  if (daysUntilExpiry(fechaVencimiento) < 0)
    return "El lote está vencido. No puede recibirse.";
  return undefined;
}

/**
 * Vida útil mínima al momento de la recepción (regla BPM configurable).
 *
 * @example
 *   isVidaUtilMinima("2026-02-28", 7)
 *   // → "Vida útil insuficiente: quedan 2 días, se requieren al menos 7."
 */
export function isVidaUtilMinima(
  fechaVencimiento: string | null | undefined,
  diasMinimos: number
): string | undefined {
  if (!fechaVencimiento || diasMinimos <= 0) return undefined;
  if (!hasMinimumShelfLife(fechaVencimiento, diasMinimos)) {
    const restantes = daysUntilExpiry(fechaVencimiento);
    return `Vida útil insuficiente: quedan ${restantes} día${restantes !== 1 ? "s" : ""}, se requieren al menos ${diasMinimos}.`;
  }
  return undefined;
}

/**
 * Fecha de fabricación no futura (un lote no puede fabricarse en el futuro).
 */
export function isFechaFabricacionValida(
  fechaFabricacion: string | null | undefined
): string | undefined {
  if (!fechaFabricacion) return undefined;
  const d = parseDate(fechaFabricacion);
  if (!d) return "Fecha de fabricación inválida.";
  if (d > new Date()) return "La fecha de fabricación no puede ser futura.";
  return undefined;
}

// ─── FORMATOS DE CÓDIGOS INTERNOS ────────────────────────────────────────────

/**
 * Número de OC: letras/números, guiones, hasta 30 caracteres.
 * @example isNumeroOC("OC-2026-001") → undefined
 */
export function isNumeroOC(value: string): string | undefined {
  if (!value) return undefined;
  if (value.trim().length < 2) return "El número de OC debe tener al menos 2 caracteres.";
  if (value.length > 30) return "El número de OC no puede superar 30 caracteres.";
  return undefined;
}

/**
 * Código interno de ítem: alfanumérico con guiones, sin espacios.
 * @example isCodigoItem("CAR-001") → undefined
 */
export function isCodigoItem(value: string): string | undefined {
  if (!value) return undefined;
  if (!/^[A-Z0-9\-]{2,20}$/i.test(value.trim()))
    return "Código inválido. Use letras, números y guiones (máx. 20 caracteres).";
  return undefined;
}

/**
 * Número de lote proveedor: máx. 50 caracteres, sin caracteres de control.
 */
export function isNumeroLote(value: string): string | undefined {
  if (!value) return undefined;
  if (value.length > 50) return "El número de lote no puede superar 50 caracteres.";
  if (/[\x00-\x1F\x7F]/.test(value)) return "El número de lote contiene caracteres no válidos.";
  return undefined;
}

// ─── COMPONER VALIDADORES ─────────────────────────────────────────────────────

/**
 * Ejecuta todos los validadores en orden y retorna el primer error.
 *
 * @example
 *   const err = composeValidators(
 *     () => required(form.nit),
 *     () => isNIT(form.nit),
 *   );
 */
export function composeValidators(...fns: Array<() => string | undefined>): string | undefined {
  for (const fn of fns) {
    const err = fn();
    if (err) return err;
  }
  return undefined;
}

/**
 * Ejecuta un array de validadores sobre el mismo valor (atajos para un campo).
 *
 * @example
 *   const errEmail = validateField(form.email, required, isEmail);
 */
export function validateField<T>(
  value: T,
  ...validators: Array<Validator<T>>
): string | undefined {
  for (const v of validators) {
    const err = v(value);
    if (err) return err;
  }
  return undefined;
}

// ─── VALIDADORES DE FORMULARIO COMPLETO ───────────────────────────────────────

// ── Proveedor ──────────────────────────────────────────────────────────────

export interface ProveedorFormValues {
  razonSocial:    string;
  nit:            string;
  emailContacto?: string;
  telefono?:      string;
}

/**
 * Valida el formulario de creación/edición de proveedor.
 * Retorna un objeto con los errores por campo. Si está vacío → formulario válido.
 *
 * @example
 *   const errors = validateProveedor(form);
 *   const isValid = Object.keys(errors).length === 0;
 */
export function validateProveedor(
  form: ProveedorFormValues
): FormErrors<ProveedorFormValues> {
  const errors: FormErrors<ProveedorFormValues> = {};

  const errRazon = validateField(form.razonSocial, required, v => minLength(v, 3), v => maxLength(v, 150));
  if (errRazon) errors.razonSocial = errRazon;

  const errNIT = composeValidators(
    () => required(form.nit),
    () => isNIT(form.nit),
  );
  if (errNIT) errors.nit = errNIT;

  if (form.emailContacto) {
    const errEmail = isEmail(form.emailContacto);
    if (errEmail) errors.emailContacto = errEmail;
  }

  if (form.telefono) {
    const errTel = isTelefono(form.telefono);
    if (errTel) errors.telefono = errTel;
  }

  return errors;
}

// ── Ítem / Materia Prima ───────────────────────────────────────────────────

export interface ItemFormValues {
  nombre:            string;
  categoriaId:       string;
  unidadMedida:      string;
  vidaUtilDias:      number | string;
  temperaturaMinima?: number | string;
  temperaturaMaxima?: number | string;
  codigoInterno?:    string;
}

/**
 * Valida el formulario de creación/edición de ítem.
 */
export function validateItem(form: ItemFormValues): FormErrors<ItemFormValues> {
  const errors: FormErrors<ItemFormValues> = {};

  const errNombre = validateField(form.nombre, required, v => minLength(v, 2), v => maxLength(v, 100));
  if (errNombre) errors.nombre = errNombre;

  if (!form.categoriaId) errors.categoriaId = "Selecciona una categoría.";
  if (!form.unidadMedida) errors.unidadMedida = "Selecciona una unidad de medida.";

  const vida = Number(form.vidaUtilDias);
  if (isNaN(vida) || vida < 1) errors.vidaUtilDias = "La vida útil debe ser mayor a 0 días.";

  if (form.codigoInterno) {
    const errCod = isCodigoItem(form.codigoInterno);
    if (errCod) errors.codigoInterno = errCod;
  }

  // Rango de temperatura coherente
  const tMin = form.temperaturaMinima !== "" && form.temperaturaMinima !== undefined
    ? Number(form.temperaturaMinima) : undefined;
  const tMax = form.temperaturaMaxima !== "" && form.temperaturaMaxima !== undefined
    ? Number(form.temperaturaMaxima) : undefined;

  if (tMin !== undefined && tMax !== undefined && tMin >= tMax)
    errors.temperaturaMaxima = "La temperatura máxima debe ser mayor a la mínima.";

  return errors;
}

// ── Lote recibido (paso 3 del wizard) ─────────────────────────────────────

export interface LoteFormValues {
  fechaFabricacion?:  string;
  fechaVencimiento:   string;
  cantidadRecibida:   number | string;
  temperaturaMedida?: number | string;
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
  numeroLoteProveedor?: string;
  vidaUtilMinimaRequerida?: number;
}

/**
 * Valida el formulario de registro de lote en la recepción.
 */
export function validateLoteRecibido(form: LoteFormValues): FormErrors<LoteFormValues> {
  const errors: FormErrors<LoteFormValues> = {};

  // Fecha de vencimiento obligatoria
  const errVenc = composeValidators(
    () => required(form.fechaVencimiento),
    () => isFechaVencimientoFutura(form.fechaVencimiento),
    () => isFechaVencimientoPostFabricacion(form.fechaVencimiento, form.fechaFabricacion),
    () => form.vidaUtilMinimaRequerida
      ? isVidaUtilMinima(form.fechaVencimiento, form.vidaUtilMinimaRequerida)
      : undefined,
  );
  if (errVenc) errors.fechaVencimiento = errVenc;

  // Fecha de fabricación opcional pero válida si se ingresa
  if (form.fechaFabricacion) {
    const errFab = isFechaFabricacionValida(form.fechaFabricacion);
    if (errFab) errors.fechaFabricacion = errFab;
  }

  // Cantidad
  const errCant = isCantidadValida(Number(form.cantidadRecibida));
  if (errCant) errors.cantidadRecibida = errCant;

  // Temperatura (si aplica cadena de frío)
  if (form.temperaturaMedida !== undefined && form.temperaturaMedida !== "") {
    const errTemp = isTemperaturaEnRango(
      Number(form.temperaturaMedida),
      form.temperaturaMinima,
      form.temperaturaMaxima
    );
    if (errTemp) errors.temperaturaMedida = errTemp;
  }

  // Número de lote proveedor (opcional)
  if (form.numeroLoteProveedor) {
    const errLote = isNumeroLote(form.numeroLoteProveedor);
    if (errLote) errors.numeroLoteProveedor = errLote;
  }

  return errors;
}

// ── Orden de Compra ────────────────────────────────────────────────────────

export interface OCFormValues {
  numeroOC:              string;
  proveedorId:           string;
  fechaEntregaEsperada?: string;
  observaciones?:        string;
}

/**
 * Valida el formulario de creación de Orden de Compra.
 */
export function validateOrdenCompra(form: OCFormValues): FormErrors<OCFormValues> {
  const errors: FormErrors<OCFormValues> = {};

  const errOC = composeValidators(
    () => required(form.numeroOC),
    () => isNumeroOC(form.numeroOC),
  );
  if (errOC) errors.numeroOC = errOC;

  if (!form.proveedorId) errors.proveedorId = "Selecciona un proveedor.";

  if (form.observaciones && form.observaciones.length > 500)
    errors.observaciones = "Las observaciones no pueden superar 500 caracteres.";

  return errors;
}

// ── Acción correctiva (CAPA) ───────────────────────────────────────────────

export interface CapaFormValues {
  descripcionAccion: string;
  responsableId:     string;
  fechaCompromiso:   string;
}

/**
 * Valida el formulario de acción correctiva.
 */
export function validateCapa(form: CapaFormValues): FormErrors<CapaFormValues> {
  const errors: FormErrors<CapaFormValues> = {};

  const errDesc = validateField(form.descripcionAccion, required, v => minLength(v, 10), v => maxLength(v, 500));
  if (errDesc) errors.descripcionAccion = errDesc;

  if (!form.responsableId) errors.responsableId = "Asigna un responsable.";

  const errFecha = composeValidators(
    () => required(form.fechaCompromiso),
    () => {
      const d = parseDate(form.fechaCompromiso);
      if (d && d < new Date(new Date().setHours(0, 0, 0, 0)))
        return "La fecha de compromiso no puede ser en el pasado.";
      return undefined;
    }
  );
  if (errFecha) errors.fechaCompromiso = errFecha;

  return errors;
}

// ─── HELPER: ¿FORMULARIO VÁLIDO? ──────────────────────────────────────────────

/**
 * Retorna `true` si el objeto de errores no tiene ninguna clave con valor.
 *
 * @example
 *   const errors = validateProveedor(form);
 *   if (isFormValid(errors)) guardar();
 */
export function isFormValid<T>(errors: FormErrors<T>): boolean {
  return Object.values(errors).every(v => !v);
}