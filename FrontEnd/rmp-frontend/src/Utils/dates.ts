// ─── UTILS / DATES ────────────────────────────────────────────────────────────
// Utilidades de fecha para el sistema RMP.
// Sin dependencias externas — solo Date nativo.
//
// Convención de entrada: strings ISO 8601 ("YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss").
// Convención de salida : strings ISO 8601 o tipos primitivos (number, boolean).
//
// @example
//   import { todayISO, daysUntilExpiry, isExpired } from "../../utils/dates";

// ─── PRIMITIVOS ───────────────────────────────────────────────────────────────

/**
 * Hoy a medianoche local como objeto Date.
 * Referencia base para todos los cálculos de días.
 */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Convierte cualquier Date a "YYYY-MM-DD" (zona local).
 * Úsalo en `<input type="date" min={toISODate(new Date())} />`.
 *
 * @example toISODate(new Date()) → "2026-02-26"
 */
export function toISODate(date: Date): string {
  const y  = date.getFullYear();
  const m  = String(date.getMonth() + 1).padStart(2, "0");
  const d  = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Fecha de hoy como string "YYYY-MM-DD".
 * Atajo directo para `min` en campos de fecha.
 *
 * @example todayISO() → "2026-02-26"
 */
export function todayISO(): string {
  return toISODate(new Date());
}

/**
 * Parsea una cadena ISO a Date.
 * Retorna `null` si la cadena es inválida.
 *
 * @example parseDate("2026-03-01") → Date(2026-03-01)
 * @example parseDate("")           → null
 */
export function parseDate(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  const d = new Date(isoString);
  return isNaN(d.getTime()) ? null : d;
}

// ─── CÁLCULOS DE DÍAS ─────────────────────────────────────────────────────────

/**
 * Días enteros entre dos fechas (de → hasta).
 * Negativo si `hasta` es anterior a `desde`.
 *
 * @example daysBetween("2026-02-20", "2026-03-01") → 9
 */
export function daysBetween(desde: string | Date, hasta: string | Date): number {
  const a = typeof desde === "string" ? parseDate(desde) : desde;
  const b = typeof hasta === "string" ? parseDate(hasta) : hasta;
  if (!a || !b) return 0;
  const ms = b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

/**
 * Días que quedan hasta el vencimiento de un lote desde hoy.
 * - Positivo → aún vigente.
 * - 0        → vence hoy.
 * - Negativo → ya vencido.
 *
 * @example daysUntilExpiry("2026-03-01") → 3  (si hoy es 2026-02-26)
 * @example daysUntilExpiry("2026-02-20") → -6 (ya vencido)
 */
export function daysUntilExpiry(fechaVencimiento: string | null | undefined): number {
  if (!fechaVencimiento) return 0;
  return daysBetween(startOfToday(), fechaVencimiento);
}

/**
 * Días de vida útil de un lote desde su fabricación.
 *
 * @example shelfLifeDays("2026-02-01", "2026-03-01") → 28
 */
export function shelfLifeDays(
  fechaFabricacion: string | null | undefined,
  fechaVencimiento: string | null | undefined
): number {
  if (!fechaFabricacion || !fechaVencimiento) return 0;
  return daysBetween(fechaFabricacion, fechaVencimiento);
}

/**
 * Porcentaje de vida útil consumida en el momento de la recepción.
 * Útil para la regla "vida útil restante mínima configurable" (BPM).
 *
 * @example
 *   consumedLifePct("2026-02-01", "2026-03-01", "2026-02-26") → 89.3
 */
export function consumedLifePct(
  fechaFabricacion: string,
  fechaVencimiento: string,
  fechaReferencia: string = todayISO()
): number {
  const total    = shelfLifeDays(fechaFabricacion, fechaVencimiento);
  const consumed = daysBetween(fechaFabricacion, fechaReferencia);
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, (consumed / total) * 100));
}

// ─── COMPARACIONES BOOLEANAS ──────────────────────────────────────────────────

/**
 * ¿El lote está vencido hoy?
 */
export function isExpired(fechaVencimiento: string | null | undefined): boolean {
  return daysUntilExpiry(fechaVencimiento) < 0;
}

/**
 * ¿El lote vence dentro de `dias` días (inclusive)?
 * Incluye ya-vencidos.
 *
 * @example isExpiringWithin("2026-03-01", 7) → true (si quedan 3 días)
 */
export function isExpiringWithin(
  fechaVencimiento: string | null | undefined,
  dias: number
): boolean {
  const remaining = daysUntilExpiry(fechaVencimiento);
  return remaining <= dias;
}

/**
 * ¿Quedan al menos `dias` días de vida útil?
 * Regla BPM: vida útil mínima configurable en el maestro de ítems.
 *
 * @example hasMinimumShelfLife("2026-03-01", 30) → false (solo quedan 3 días)
 */
export function hasMinimumShelfLife(
  fechaVencimiento: string | null | undefined,
  diasMinimos: number
): boolean {
  return daysUntilExpiry(fechaVencimiento) >= diasMinimos;
}

/**
 * ¿`a` es anterior a `b`?
 */
export function isBefore(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const da = parseDate(a);
  const db = parseDate(b);
  if (!da || !db) return false;
  return da.getTime() < db.getTime();
}

/**
 * ¿`a` es posterior a `b`?
 */
export function isAfter(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const da = parseDate(a);
  const db = parseDate(b);
  if (!da || !db) return false;
  return da.getTime() > db.getTime();
}

/**
 * ¿Las dos fechas son el mismo día (ignorando hora)?
 */
export function isSameDay(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  return toISODate(parseDate(a) ?? new Date(0)) === toISODate(parseDate(b) ?? new Date(1));
}

// ─── MANIPULACIÓN ─────────────────────────────────────────────────────────────

/**
 * Suma `n` días a una fecha y devuelve "YYYY-MM-DD".
 * `n` puede ser negativo para restar.
 *
 * @example addDays("2026-02-26", 3)  → "2026-03-01"
 * @example addDays("2026-02-26", -7) → "2026-02-19"
 */
export function addDays(isoString: string, n: number): string {
  const d = parseDate(isoString);
  if (!d) return isoString;
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/**
 * Primer día del mes de una fecha dada.
 *
 * @example startOfMonth("2026-02-15") → "2026-02-01"
 */
export function startOfMonth(isoString: string): string {
  const d = parseDate(isoString);
  if (!d) return isoString;
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

/**
 * Último día del mes de una fecha dada.
 *
 * @example endOfMonth("2026-02-15") → "2026-02-28"
 */
export function endOfMonth(isoString: string): string {
  const d = parseDate(isoString);
  if (!d) return isoString;
  return toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

// ─── HELPERS DE CADENA DE FRÍO ────────────────────────────────────────────────

/**
 * Umbral de alerta de vencimiento según categoría BPM del ítem.
 * Retorna los días de umbral recomendados para activar alertas visuales.
 *
 * | Categoría  | Umbral crítico | Umbral advertencia |
 * |------------|----------------|--------------------|
 * | Cárnicos   | 3 d            | 7 d                |
 * | Lácteos    | 3 d            | 7 d                |
 * | Congelados | 7 d            | 30 d               |
 * | Secos      | 15 d           | 60 d               |
 * | default    | 7 d            | 30 d               |
 */
export function expiryThresholdDays(categoria?: string): { critico: number; advertencia: number } {
  const cat = (categoria ?? "").toLowerCase();
  if (cat.includes("cárnic") || cat.includes("carnic") || cat.includes("lácteo") || cat.includes("lacteo"))
    return { critico: 3, advertencia: 7 };
  if (cat.includes("congelado"))
    return { critico: 7, advertencia: 30 };
  if (cat.includes("seco") || cat.includes("granel"))
    return { critico: 15, advertencia: 60 };
  return { critico: 7, advertencia: 30 };
}

/**
 * Nivel de urgencia según días restantes y categoría.
 * Retorna "vencido" | "critico" | "advertencia" | "ok".
 */
export function expiryLevel(
  diasRestantes: number,
  categoria?: string
): "vencido" | "critico" | "advertencia" | "ok" {
  if (diasRestantes < 0)  return "vencido";
  const { critico, advertencia } = expiryThresholdDays(categoria);
  if (diasRestantes <= critico)     return "critico";
  if (diasRestantes <= advertencia) return "advertencia";
  return "ok";
}

// ─── HELPERS DE RANGO VÁLIDO PARA INPUTS ─────────────────────────────────────

/**
 * Fecha mínima para fechaVencimiento: mañana (no se acepta vencer hoy).
 */
export function minFechaVencimiento(): string {
  return addDays(todayISO(), 1);
}

/**
 * Fecha máxima para fechaFabricacion: hoy (no puede ser en el futuro).
 */
export function maxFechaFabricacion(): string {
  return todayISO();
}

/**
 * Fecha mínima para fechaEntregaEsperada de una OC: hoy.
 */
export function minFechaEntrega(): string {
  return todayISO();
}