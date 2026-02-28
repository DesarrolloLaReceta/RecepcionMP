// ─── FORMATTERS ───────────────────────────────────────────────────────────────
// Utilidades de formato centralizadas para el sistema RMP.
// Reemplaza llamadas inline a Intl/Date dispersas en cada página.
//
// @example
//   import { formatCOP, formatDate, formatPercent } from "../../utils/formatters";

// ─── MONEDA ────────────────────────────────────────────────────────────────────

const COP_FMT = new Intl.NumberFormat("es-CO", {
  style:                 "currency",
  currency:              "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formatea un número como pesos colombianos.
 * @example formatCOP(1250000) → "$ 1.250.000"
 */
export function formatCOP(valor: number): string {
  return COP_FMT.format(valor);
}

/**
 * Formatea solo el número con separadores de miles (sin símbolo).
 * @example formatNumber(1250000) → "1.250.000"
 * @example formatNumber(3.14159, 2) → "3,14"
 */
export function formatNumber(valor: number, decimales = 0): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
}

// ─── FECHAS ────────────────────────────────────────────────────────────────────

/**
 * Fecha corta: día + mes abreviado + año.
 * @example formatDate("2026-02-26") → "26 feb 2026"
 * @example formatDate(undefined) → "—"
 */
export function formatDate(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("es-CO", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    });
  } catch {
    return isoString;
  }
}

/**
 * Fecha con hora.
 * @example formatDateTime("2026-02-26T14:32:00") → "26 feb 2026, 14:32"
 */
export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("es-CO", {
      day:    "2-digit",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/**
 * Fecha larga con día de la semana (para el header/dashboard).
 * @example formatDateLong("2026-02-26") → "jueves, 26 de febrero de 2026"
 */
export function formatDateLong(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("es-CO", {
      weekday: "long",
      day:     "numeric",
      month:   "long",
      year:    "numeric",
    });
  } catch {
    return isoString;
  }
}

/**
 * Distancia relativa a hoy en días.
 * @example formatDaysFromNow("2026-03-01") → "en 3 días"
 * @example formatDaysFromNow("2026-02-20") → "hace 6 días"
 * @example formatDaysFromNow(today)        → "hoy"
 */
export function formatDaysFromNow(isoString?: string | null): string {
  if (!isoString) return "—";
  const hoy  = new Date(); hoy.setHours(0, 0, 0, 0);
  const dest = new Date(isoString); dest.setHours(0, 0, 0, 0);
  const dias = Math.round((dest.getTime() - hoy.getTime()) / 86_400_000);
  if (dias === 0)  return "hoy";
  if (dias === 1)  return "mañana";
  if (dias === -1) return "ayer";
  if (dias > 1)    return `en ${dias} días`;
  return `hace ${Math.abs(dias)} días`;
}

// ─── PORCENTAJE ────────────────────────────────────────────────────────────────

/**
 * Porcentaje con decimales opcionales.
 * @example formatPercent(87.2)   → "87,2 %"
 * @example formatPercent(100, 0) → "100 %"
 */
export function formatPercent(valor: number, decimales = 1): string {
  return `${formatNumber(valor, decimales)} %`;
}

// ─── CANTIDAD + UNIDAD ─────────────────────────────────────────────────────────

/**
 * Cantidad con su unidad de medida.
 * @example formatQuantity(500, "Kg")  → "500 Kg"
 * @example formatQuantity(1.5, "L")   → "1,5 L"
 */
export function formatQuantity(cantidad: number, unidad: string): string {
  const decimales = Number.isInteger(cantidad) ? 0 : 2;
  return `${formatNumber(cantidad, decimales)} ${unidad}`;
}

// ─── TEMPERATURA ───────────────────────────────────────────────────────────────

/**
 * Temperatura con unidad.
 * @example formatTemp(3.5) → "3,5 °C"
 * @example formatTemp(undefined) → "—"
 */
export function formatTemp(valor?: number | null): string {
  if (valor === undefined || valor === null) return "—";
  return `${formatNumber(valor, 1)} °C`;
}

/**
 * Rango de temperaturas.
 * @example formatTempRange(0, 4) → "0 °C – 4 °C"
 */
export function formatTempRange(min?: number | null, max?: number | null): string {
  if (min === undefined && max === undefined) return "—";
  return `${min ?? "?"} °C – ${max ?? "?"} °C`;
}

// ─── TEXTO ─────────────────────────────────────────────────────────────────────

/**
 * Trunca texto largo con elipsis al final.
 * @example truncate("Lorem ipsum dolor sit amet", 20) → "Lorem ipsum dolor si…"
 */
export function truncate(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  return texto.slice(0, max - 1) + "…";
}

/**
 * Primera letra en mayúscula, el resto sin cambiar.
 * @example capitalize("harina de trigo") → "Harina de trigo"
 */
export function capitalize(texto: string): string {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Convierte un número de lote interno al formato de pantalla.
 * @example formatLoteId("L-2026-0048-01") → "L-2026-0048-01"  (ya correcto)
 */
export function formatLoteId(id: string): string {
  return id.toUpperCase();
}

// ─── DURACIÓN ─────────────────────────────────────────────────────────────────

/**
 * Formatea minutos en "X h Y min" o solo "Y min".
 * @example formatDuration(90)  → "1 h 30 min"
 * @example formatDuration(45)  → "45 min"
 */
export function formatDuration(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h   = Math.floor(minutos / 60);
  const min = minutos % 60;
  return min > 0 ? `${h} h ${min} min` : `${h} h`;
}

// ─── URGENCIA DE VENCIMIENTO ──────────────────────────────────────────────────

/**
 * Color semántico según días restantes para un vencimiento.
 * Devuelve tokens del design system del proyecto.
 */
export function vencimientoColor(dias: number): { text: string; dot: string } {
  if (dias < 0)   return { text: "#FCA5A5", dot: "#EF4444" }; // vencido
  if (dias <= 7)  return { text: "#FCA5A5", dot: "#EF4444" }; // crítico
  if (dias <= 30) return { text: "#FCD34D", dot: "#F59E0B" }; // advertencia
  return              { text: "#86EFAC", dot: "#22C55E" };    // ok
}