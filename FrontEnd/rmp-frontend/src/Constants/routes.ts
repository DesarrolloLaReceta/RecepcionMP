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
  VERIFICACION_INSTALACIONES: "/calidad/verificacion-instalaciones",

  // Órdenes de compra
  ORDENES_COMPRA:        "/ordenes-compra",
  DETALLE_OC:            (id = ":id") => `/ordenes-compra/${id}`,

  // Maestros
  PROVEEDORES:      "/maestros/proveedores",
  ITEMS:            "/maestros/items",
  CHECKLISTS:       "/maestros/checklists",
} as const;

// ─── ETIQUETAS PARA BREADCRUMB ────────────────────────────────────────────────

export const ROUTE_LABELS: Record<string, string> = {
  "/":                      "Dashboard",
  "/recepciones":           "Recepciones",
  "/recepciones/nueva":     "Nueva recepción",
  "/lotes":                 "Lotes",
  "/liberacion":            "Liberación de lotes",
  "/no-conformidades":      "No conformidades",
  "/calidad/verificacion-instalaciones": "Verificación instalaciones",
  "/ordenes-compra":        "Órdenes de Compra",
  "/maestros":              "Maestros",
  "/maestros/proveedores":  "Proveedores",
  "/maestros/items":        "Ítems",
  "/maestros/checklists":   "Checklists BPM",
  "/sin-acceso":            "Acceso denegado",
};