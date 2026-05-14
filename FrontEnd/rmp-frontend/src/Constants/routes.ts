// ─── RUTAS CENTRALIZADAS ──────────────────────────────────────────────────────
// Importar siempre desde aquí para evitar strings sueltos en el código.

export const ROUTES = {
  // Auth
  LOGIN:            "/login",
  SIN_ACCESO:       "/sin-acceso",

  // Principal
  DASHBOARD:        "/",
  RECEPCIONES:      "/recepciones",
  NUEVA_RECEPCION:  "/recepciones/nueva",
  DETALLE_RECEPCION: (id = ":id") => `/recepciones/${id}`,

  // Lotes
  LOTES:            "/lotes",
  DETALLE_LOTE:     (id = ":id") => `/lotes/${id}`,

  // Calidad
  LIBERACION:       "/liberacion",
  NO_CONFORMIDADES: "/no-conformidades",
  GESTION_CALIDAD: "/calidad",
  LIBERACION_COCINA: "/calidad/liberacion-cocina",
  /** Historial unificado (liberación cocina, verificación instalaciones, lavado botas/manos) */
  HISTORIAL_CALIDAD: "/calidad/historial",

  // Órdenes de compra
  ORDENES_COMPRA:        "/ordenes-compra",
  DETALLE_OC:            (id = ":id") => `/ordenes-compra/${id}`,

  // Maestros
  PROVEEDORES:      "/maestros/proveedores",
  ITEMS:            "/maestros/items",
  CHECKLISTS:       "/maestros/checklists",
} as const;

/** Ruta previa del historial unificado (compatibilidad: redirige en `App.tsx`). */
export const LEGACY_ROUTE_HISTORIAL_LIBERACION_COCINA =
  "/calidad/liberacion-cocina/historial" as const;

// ─── ETIQUETAS PARA BREADCRUMB ────────────────────────────────────────────────

export const ROUTE_LABELS: Record<string, string> = {
  "/":                      "Dashboard",
  "/recepciones":           "Recepciones",
  "/recepciones/nueva":     "Nueva recepción",
  "/lotes":                 "Lotes",
  "/liberacion":            "Liberación de lotes",
  "/no-conformidades":      "No conformidades",
  "/calidad": "Calidad",
  "/calidad/verificacion-instalaciones": "Verificación instalaciones",
  "/calidad/lavado-botas-manos": "Lavado botas y manos",
  "/calidad/liberacion-cocina": "Liberación de cocina",
  "/calidad/historial": "Historial unificado calidad",
  "/ordenes-compra":        "Órdenes de Compra",
  "/maestros":              "Maestros",
  "/maestros/proveedores":  "Proveedores",
  "/maestros/items":        "Ítems",
  "/maestros/checklists":   "Checklists BPM",
  "/sin-acceso":            "Acceso denegado",
};