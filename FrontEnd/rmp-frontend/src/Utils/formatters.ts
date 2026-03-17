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

export function formatCOP(valor: number): string {
  return COP_FMT.format(valor);
}

export function formatNumber(valor: number, decimales = 0): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
}

// ─── FECHAS ────────────────────────────────────────────────────────────────────

/** Parsea un ISO string forzando hora local para fechas sin hora (YYYY-MM-DD). */
function parseLocalDate(isoString: string): Date {
  return new Date(isoString.length === 10 ? isoString + "T00:00:00" : isoString);
}

/**
 * Fecha corta: día + mes abreviado + año.
 * @example formatDate("2026-02-26") → "26 feb 2026"
 * @example formatDate(undefined) → "—"
 */
export function formatDate(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    return parseLocalDate(isoString).toLocaleDateString("es-CO", {
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
    return parseLocalDate(isoString).toLocaleDateString("es-CO", {
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
  const dest = parseLocalDate(isoString); dest.setHours(0, 0, 0, 0);
  const dias = Math.round((dest.getTime() - hoy.getTime()) / 86_400_000);
  if (dias === 0)  return "hoy";
  if (dias === 1)  return "mañana";
  if (dias === -1) return "ayer";
  if (dias > 1)    return `en ${dias} días`;
  return `hace ${Math.abs(dias)} días`;
}

// ─── PORCENTAJE ────────────────────────────────────────────────────────────────

export function formatPercent(valor: number, decimales = 1): string {
  return `${formatNumber(valor, decimales)} %`;
}

// ─── CANTIDAD + UNIDAD ─────────────────────────────────────────────────────────

export function formatQuantity(cantidad: number, unidad: string): string {
  const decimales = Number.isInteger(cantidad) ? 0 : 2;
  return `${formatNumber(cantidad, decimales)} ${unidad}`;
}

// ─── TEMPERATURA ───────────────────────────────────────────────────────────────

export function formatTemp(valor?: number | null): string {
  if (valor === undefined || valor === null) return "—";
  return `${formatNumber(valor, 1)} °C`;
}

export function formatTempRange(min?: number | null, max?: number | null): string {
  if (min === undefined && max === undefined) return "—";
  return `${min ?? "?"} °C – ${max ?? "?"} °C`;
}

// ─── TEXTO ─────────────────────────────────────────────────────────────────────

export function truncate(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  return texto.slice(0, max - 1) + "…";
}

export function capitalize(texto: string): string {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatLoteId(id: string): string {
  return id.toUpperCase();
}

// ─── DURACIÓN ─────────────────────────────────────────────────────────────────

export function formatDuration(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h   = Math.floor(minutos / 60);
  const min = minutos % 60;
  return min > 0 ? `${h} h ${min} min` : `${h} h`;
}

// ─── URGENCIA DE VENCIMIENTO ──────────────────────────────────────────────────

export function vencimientoColor(dias: number): { text: string; dot: string } {
  if (dias < 0)   return { text: "#FCA5A5", dot: "#EF4444" };
  if (dias <= 7)  return { text: "#FCA5A5", dot: "#EF4444" };
  if (dias <= 30) return { text: "#FCD34D", dot: "#F59E0B" };
  return              { text: "#86EFAC", dot: "#22C55E" };
}