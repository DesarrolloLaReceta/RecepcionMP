import {
  EstadoProveedor, EstadoItem,
  type ProveedorResumen, type Proveedor,
  type ItemResumen, type Item,
  type Categoria,
  type ChecklistResumen, type Checklist,
} from "../../Services/maestros.service";

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

export const MOCK_CATEGORIAS: Categoria[] = [
  { id: "cat-001", nombre: "Cárnicos",       descripcion: "Carnes frescas y procesadas", requiereCadenaFrio: true,  color: "#FCA5A5" },
  { id: "cat-002", nombre: "Lácteos",        descripcion: "Leche y derivados",           requiereCadenaFrio: true,  color: "#93C5FD" },
  { id: "cat-003", nombre: "Secos",          descripcion: "Harinas, azúcares, cereales", requiereCadenaFrio: false, color: "#FCD34D" },
  { id: "cat-004", nombre: "Frutas/Verduras",descripcion: "Productos frescos de origen vegetal", requiereCadenaFrio: false, color: "#86EFAC" },
  { id: "cat-005", nombre: "Congelados",     descripcion: "Productos a temperatura negativa", requiereCadenaFrio: true, color: "#C4B5FD" },
];

// ─── PROVEEDORES ──────────────────────────────────────────────────────────────

export const MOCK_PROVEEDORES_LIST: ProveedorResumen[] = [
  {
    id: "prov-001", razonSocial: "AviCol S.A.", nit: "800.123.456-7",
    ciudad: "Bogotá", estado: EstadoProveedor.Activo,
    categorias: ["Cárnicos"],
    documentosVigentes: 3, documentosPorVencer: 1, documentosVencidos: 0,
    totalRecepciones: 48, tasaAceptacion: 94.2,
  },
  {
    id: "prov-002", razonSocial: "Lácteos del Valle", nit: "900.234.567-8",
    ciudad: "Cali", estado: EstadoProveedor.Activo,
    categorias: ["Lácteos"],
    documentosVigentes: 4, documentosPorVencer: 0, documentosVencidos: 0,
    totalRecepciones: 36, tasaAceptacion: 98.6,
  },
  {
    id: "prov-003", razonSocial: "Riopaila Castilla", nit: "860.000.491-3",
    ciudad: "Palmira", estado: EstadoProveedor.Activo,
    categorias: ["Secos"],
    documentosVigentes: 2, documentosPorVencer: 1, documentosVencidos: 0,
    totalRecepciones: 24, tasaAceptacion: 100,
  },
  {
    id: "prov-004", razonSocial: "Frigorífico Guadalupe", nit: "700.456.789-1",
    ciudad: "Bogotá", estado: EstadoProveedor.Activo,
    categorias: ["Cárnicos", "Congelados"],
    documentosVigentes: 3, documentosPorVencer: 2, documentosVencidos: 1,
    totalRecepciones: 31, tasaAceptacion: 87.5,
  },
  {
    id: "prov-005", razonSocial: "Harinas del Meta S.A.", nit: "901.234.567-2",
    ciudad: "Villavicencio", estado: EstadoProveedor.Activo,
    categorias: ["Secos"],
    documentosVigentes: 2, documentosPorVencer: 0, documentosVencidos: 0,
    totalRecepciones: 18, tasaAceptacion: 100,
  },
  {
    id: "prov-006", razonSocial: "Alimentos Deli Ltda.", nit: "800.987.654-3",
    ciudad: "Medellín", estado: EstadoProveedor.Suspendido,
    categorias: ["Secos", "Frutas/Verduras"],
    documentosVigentes: 1, documentosPorVencer: 0, documentosVencidos: 2,
    totalRecepciones: 12, tasaAceptacion: 75.0,
  },
];

export const MOCK_PROVEEDOR_DETALLE: Proveedor = {
  id: "prov-001", razonSocial: "AviCol S.A.", nit: "800.123.456-7",
  nombreContacto: "Roberto Ávila", emailContacto: "recepcion@avicol.com.co",
  telefonoContacto: "+57 601 234 5678", direccion: "Cra 68 #13-42, Zona Industrial",
  ciudad: "Bogotá", estado: EstadoProveedor.Activo,
  categorias: ["Cárnicos"],
  totalRecepciones: 48, ultimaRecepcion: "2026-02-24", tasaAceptacion: 94.2,
  createdAt: "2024-03-15",
  documentos: [
    {
      id: "doc-001", tipo: "Registro Sanitario INVIMA", nombre: "RSA-2024-001234",
      numeroDocumento: "RSA-B-0001234",
      fechaEmision: "2024-01-15", fechaVencimiento: "2029-01-15",
      diasParaVencer: 1055,
    },
    {
      id: "doc-002", tipo: "Decreto 1500 — Habilitación Frigorífico",
      nombre: "Habilitación planta AviCol",
      numeroDocumento: "HAB-2024-0089",
      fechaEmision: "2024-06-01", fechaVencimiento: "2026-06-01",
      diasParaVencer: 96,
    },
    {
      id: "doc-003", tipo: "Certificado BPA — Buenas Prácticas Avícolas",
      nombre: "BPA Granja La Esperanza",
      fechaEmision: "2025-03-01", fechaVencimiento: "2026-03-01",
      diasParaVencer: 4,
    },
    {
      id: "doc-004", tipo: "Póliza de responsabilidad civil",
      nombre: "Póliza Sura 2026",
      fechaEmision: "2026-01-01", fechaVencimiento: "2026-12-31",
      diasParaVencer: 309,
    },
  ],
};

// ─── ÍTEMS ────────────────────────────────────────────────────────────────────

export const MOCK_ITEMS_LIST: ItemResumen[] = [
  {
    id: "item-001", codigo: "CAR-001", nombre: "Pechuga de pollo",
    categoriaNombre: "Cárnicos", unidadMedida: "Kg",
    estado: EstadoItem.Activo, requiereCadenaFrio: true,
    temperaturaMinima: 0, temperaturaMaxima: 4,
    totalLotesRecibidos: 42,
  },
  {
    id: "item-002", codigo: "CAR-002", nombre: "Muslo de pollo",
    categoriaNombre: "Cárnicos", unidadMedida: "Kg",
    estado: EstadoItem.Activo, requiereCadenaFrio: true,
    temperaturaMinima: 0, temperaturaMaxima: 4,
    totalLotesRecibidos: 38,
  },
  {
    id: "item-003", codigo: "LAC-001", nombre: "Leche entera UHT",
    categoriaNombre: "Lácteos", unidadMedida: "L",
    estado: EstadoItem.Activo, requiereCadenaFrio: true,
    temperaturaMinima: 2, temperaturaMaxima: 8,
    totalLotesRecibidos: 29,
  },
  {
    id: "item-004", codigo: "LAC-002", nombre: "Queso doble crema",
    categoriaNombre: "Lácteos", unidadMedida: "Kg",
    estado: EstadoItem.Activo, requiereCadenaFrio: true,
    temperaturaMinima: 2, temperaturaMaxima: 8,
    totalLotesRecibidos: 18,
  },
  {
    id: "item-005", codigo: "LAC-003", nombre: "Yogur natural",
    categoriaNombre: "Lácteos", unidadMedida: "Kg",
    estado: EstadoItem.Activo, requiereCadenaFrio: true,
    temperaturaMinima: 2, temperaturaMaxima: 8,
    totalLotesRecibidos: 14,
  },
  {
    id: "item-006", codigo: "SEC-001", nombre: "Azúcar refinada",
    categoriaNombre: "Secos", unidadMedida: "Kg",
    estado: EstadoItem.Activo, requiereCadenaFrio: false,
    totalLotesRecibidos: 21,
  },
  {
    id: "item-007", codigo: "SEC-002", nombre: "Azúcar morena",
    categoriaNombre: "Secos", unidadMedida: "Kg",
    estado: EstadoItem.Activo, requiereCadenaFrio: false,
    totalLotesRecibidos: 10,
  },
  {
    id: "item-008", codigo: "SEC-003", nombre: "Harina de trigo",
    categoriaNombre: "Secos", unidadMedida: "Kg",
    estado: EstadoItem.Inactivo, requiereCadenaFrio: false,
    totalLotesRecibidos: 5,
  },
];

export const MOCK_ITEM_DETALLE: Item = {
  id: "item-001", codigo: "CAR-001", nombre: "Pechuga de pollo",
  descripcion: "Pechuga de pollo fresca sin hueso, sin piel. Origen nacional. Uso en línea de producción cocida.",
  categoriaId: "cat-001", categoriaNombre: "Cárnicos",
  unidadMedida: "Kg", estado: EstadoItem.Activo,
  requiereCadenaFrio: true, temperaturaMinima: 0, temperaturaMaxima: 4,
  vidaUtilMinimaDias: 7,
  criteriosAceptacion: "Color rosado uniforme. Ausencia de olores anormales. Sin coágulos ni hematomas extensos. Temperatura en rango 0°C–4°C al recibo. Rotulado conforme Res. 5109/2005 y Decreto 1500.",
  createdAt: "2024-03-20",
  documentosRequeridos: [
    { tipoDocumento: 1, nombreTipo: "Registro Sanitario INVIMA", obligatorio: true },
    { tipoDocumento: 2, nombreTipo: "Certificado de Análisis (COA)", obligatorio: true },
    { tipoDocumento: 3, nombreTipo: "Certificado de transporte / temperatura", obligatorio: true },
    { tipoDocumento: 5, nombreTipo: "Habilitación Decreto 1500", obligatorio: true },
  ],
};

// ─── CHECKLISTS ───────────────────────────────────────────────────────────────

export const MOCK_CHECKLISTS_LIST: ChecklistResumen[] = [
  {
    id: "cl-001", nombre: "Inspección cárnicos frescos",
    categoriaNombre: "Cárnicos", version: 3,
    activo: true, totalCriterios: 8, obligatorios: 6,
    updatedAt: "2026-01-15",
  },
  {
    id: "cl-002", nombre: "Inspección lácteos refrigerados",
    categoriaNombre: "Lácteos", version: 2,
    activo: true, totalCriterios: 7, obligatorios: 5,
    updatedAt: "2025-11-20",
  },
  {
    id: "cl-003", nombre: "Inspección productos secos",
    categoriaNombre: "Secos", version: 1,
    activo: true, totalCriterios: 5, obligatorios: 4,
    updatedAt: "2025-09-10",
  },
  {
    id: "cl-004", nombre: "Inspección frutas y verduras",
    categoriaNombre: "Frutas/Verduras", version: 1,
    activo: false, totalCriterios: 6, obligatorios: 4,
    updatedAt: "2025-06-01",
  },
];

export const MOCK_CHECKLIST_DETALLE: Checklist = {
  id: "cl-001", nombre: "Inspección cárnicos frescos",
  categoriaId: "cat-001", categoriaNombre: "Cárnicos",
  version: 3, activo: true,
  createdAt: "2024-06-01", updatedAt: "2026-01-15",
  criterios: [
    { id: "cr-001", orden: 1, descripcion: "Temperatura del producto dentro del rango aceptable (0°C–4°C)", obligatorio: true,  tipoCriterio: "Numerico", valorMinimo: 0, valorMaximo: 4, unidad: "°C" },
    { id: "cr-002", orden: 2, descripcion: "Color uniforme, rosado, sin manchas verdosas o pardas",         obligatorio: true,  tipoCriterio: "SiNo" },
    { id: "cr-003", orden: 3, descripcion: "Ausencia de olores anormales o de putrefacción",                obligatorio: true,  tipoCriterio: "SiNo" },
    { id: "cr-004", orden: 4, descripcion: "Integridad del empaque sin roturas ni humedad externa",         obligatorio: true,  tipoCriterio: "SiNo" },
    { id: "cr-005", orden: 5, descripcion: "Rotulado conforme a Res. 5109/2005 y Decreto 1500",            obligatorio: true,  tipoCriterio: "SiNo" },
    { id: "cr-006", orden: 6, descripcion: "Registro Sanitario INVIMA vigente presentado",                  obligatorio: true,  tipoCriterio: "SiNo" },
    { id: "cr-007", orden: 7, descripcion: "Fecha de vencimiento mínima en días desde hoy",                obligatorio: false, tipoCriterio: "Numerico", valorMinimo: 7, unidad: "días" },
    { id: "cr-008", orden: 8, descripcion: "Observaciones adicionales del inspector",                       obligatorio: false, tipoCriterio: "Texto" },
  ],
};