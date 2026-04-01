import {
  EstadoProveedor,
  type ProveedorResumen,
  type Proveedor,
  type ItemResumen,
  type Item,
  type Categoria,
  type ChecklistResumen,
  type Checklist,
} from "../../Services/maestros.service";

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

export const MOCK_CATEGORIAS: Categoria[] = [
  {
    id: "cat-001",
    nombre: "Cárnicos",
    descripcion: "Carnes frescas y procesadas",
    requiereCadenaFrio: true,
    requierePresenciaCalidad: true,
    vidaUtilMinimaDias: 3,
    rangoTemperaturaMinima: 0,
    rangoTemperaturaMaxima: 4,
  },
];

// ─── PROVEEDORES ──────────────────────────────────────────────────────────────

export const MOCK_PROVEEDORES_LIST: ProveedorResumen[] = [
  {
    id: "prov-001",
    razonSocial: "AviCol S.A.",
    nit: "800123456-7",
    estado: EstadoProveedor.Activo,
    categorias: ["Cárnicos"],
    documentosVigentes: 2,
    documentosPorVencer: 1,
    documentosVencidos: 0,
    totalRecepciones: 5,
    tasaAceptacion: 98.5,
  },
  {
    id: "prov-002",
    razonSocial: "Lácteos del Valle",
    nit: "900654321-0",
    estado: EstadoProveedor.Inactivo,
    categorias: ["Lácteos"],
    documentosVigentes: 0,
    documentosPorVencer: 0,
    documentosVencidos: 0,
    totalRecepciones: 0,
    tasaAceptacion: 0,
  },
  {
    id: "prov-003",
    razonSocial: "Riopaila Castilla",
    nit: "890123456-1",
    estado: EstadoProveedor.Activo,
    categorias: ["Lácteos"],
    documentosVigentes: 0,
    documentosPorVencer: 0,
    documentosVencidos: 0,
    totalRecepciones: 0,
    tasaAceptacion: 0,
  },
];

export const MOCK_PROVEEDOR_DETALLE: Proveedor = {
  id: "prov-001",
  razonSocial: "AviCol S.A.",
  nit: "800.123.456-7",
  emailContacto: "recepcion@avicol.com.co",
  direccion: "Cra 68 #13-42, Zona Industrial",
  estado: EstadoProveedor.Activo,
  categorias: ["Cárnicos"],
  totalRecepciones: 48,
  ultimaRecepcion: "2026-02-24",
  tasaAceptacion: 94.2,
  creadoEn: "2024-03-15",
  contactos: [],
  documentosSanitarios: [
    {
      id: "doc-001",
      tipoDocumento: 0,
      numeroDocumento: "RSA-B-0001234",
      fechaExpedicion: "2024-01-15",
      fechaVencimiento: "2029-01-15",
      adjuntoUrl: undefined,
      estaVigente: true,
      diasParaVencer: 1055,
      estadoVigencia: 0,
    },
  ],
};

// ─── ÍTEMS ────────────────────────────────────────────────────────────────────

export const MOCK_ITEMS_LIST: ItemResumen[] = [
  {
    id: "item-001",
    codigo: "AVE-001",
    nombre: "Pechuga de pollo",
    categoriaId: "cat-001",
    categoriaNombre: "Cárnicos",
    unidadMedida: "Kg",
    estado: true,
    requiereCadenaFrio: true,
    temperaturaMinima: 0,
    temperaturaMaxima: 4,
    totalLotesRecibidos: 5,
  },
  {
    id: "item-002",
    codigo: "CAR-002",
    nombre: "Muslo de pollo",
    categoriaId: "cat-001",
    categoriaNombre: "Cárnicos",
    unidadMedida: "Kg",
    estado: true,
    requiereCadenaFrio: true,
    temperaturaMinima: 0,
    temperaturaMaxima: 4,
    totalLotesRecibidos: 3,
  },
];

export const MOCK_ITEM_DETALLE: Item = {
  id: "item-001",
  codigo: "CAR-001",
  nombre: "Pechuga de pollo",
  descripcion: "Pechuga de pollo fresca sin hueso, sin piel. Origen nacional. Uso en línea de producción cocida.",
  categoriaId: "cat-001",
  categoriaNombre: "Cárnicos",
  unidadMedida: "Kg",
  estado: true,
  requiereCadenaFrio: true,
  temperaturaMinima: 0,
  temperaturaMaxima: 4,
  vidaUtilDias: 7,
  criteriosAceptacion: "Color rosado uniforme. Ausencia de olores anormales. Sin coágulos ni hematomas extensos. Temperatura en rango 0°C–4°C al recibo. Rotulado conforme Res. 5109/2005 y Decreto 1500.",
  totalLotesRecibidos: 8,
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
    id: "check-001",
    nombre: "Cárnicos BPM v3",
    categoriaId: "cat-001",
    categoriaNombre: "Cárnicos",
    version: 3,
    estado: true,
    totalCriterios: 8,
    obligatorios: 6,
    creadoEn: "2026-01-15",
  },
  {
    id: "check-002",
    nombre: "Lácteos BPM v2",
    categoriaId: "cat-002",
    categoriaNombre: "Lácteos",
    version: 2,
    estado: true,
    totalCriterios: 8,
    obligatorios: 6,
    creadoEn: "2026-01-15",
  },
];

export const MOCK_CHECKLIST_DETALLE: Checklist = {
  id: "cl-001",
  nombre: "Inspección cárnicos frescos",
  categoriaId: "cat-001",
  categoriaNombre: "Cárnicos",
  version: 3,
  estado: true,
  creadoEn: "2024-06-01",
  items: [
    {
      id: "cr-001",
      orden: 1,
      criterio: "Temperatura del producto dentro del rango aceptable (0°C–4°C)",
      descripcion: "Medir temperatura del producto al ingreso",
      esCritico: true,
      tipoCriterio: 1,
      valorMinimo: 0,
      valorMaximo: 4,
      unidad: "°C",
    },
    {
      id: "cr-002",
      orden: 2,
      criterio: "Color uniforme, rosado, sin manchas verdosas o pardas",
      esCritico: true,
      tipoCriterio: 0,
    },
    {
      id: "cr-003",
      orden: 3,
      criterio: "Ausencia de olores anormales o de putrefacción",
      esCritico: true,
      tipoCriterio: 0,
    },
    {
      id: "cr-004",
      orden: 4,
      criterio: "Integridad del empaque sin roturas ni humedad externa",
      esCritico: true,
      tipoCriterio: 0,
    },
    {
      id: "cr-005",
      orden: 5,
      criterio: "Rotulado conforme a Res. 5109/2005 y Decreto 1500",
      esCritico: true,
      tipoCriterio: 0,
    },
    {
      id: "cr-006",
      orden: 6,
      criterio: "Registro Sanitario INVIMA vigente presentado",
      esCritico: true,
      tipoCriterio: 0,
    },
    {
      id: "cr-007",
      orden: 7,
      criterio: "Fecha de vencimiento mínima en días desde hoy",
      esCritico: false,
      tipoCriterio: 1,
      valorMinimo: 7,
      unidad: "días",
    },
    {
      id: "cr-008",
      orden: 8,
      criterio: "Observaciones adicionales del inspector",
      esCritico: false,
      tipoCriterio: 2,
    },
  ],
};