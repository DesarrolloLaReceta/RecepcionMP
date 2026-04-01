import { EstadoOC, type OrdenCompraResumen, type OrdenCompra } from "../../Services/ordenes-compra.service";

// ─── LISTA (para wizard de recepción y futuro módulo OC) ─────────────────────

export const MOCK_OC_ABIERTAS: OrdenCompraResumen[] = [
  {
    id: "oc-001",
    numeroOC: "OC-2026-0112",
    proveedorId: "prov-001",
    proveedorNombre: "AviCol S.A.",
    proveedorNit: "800.123.456-7",
    fechaEmision: "2026-02-20",
    fechaEntregaEsperada: "2026-02-24",
    fechaVencimiento: "2026-03-06",
    estado: EstadoOC.Abierta,
    totalItems: 2,
    valorTotal: 8_960_000,
    requiereCadenaFrio: true,
    detalles: [
      {
        id: "det-001",
        itemId: "item-001", itemNombre: "Pechuga de pollo", itemCodigo: "CAR-001",
        categoriaId: "cat-001", categoriaNombre: "Cárnicos",
        cantidadSolicitada: 500, cantidadRecibida: 0, cantidadPendiente: 500,
        unidadMedida: "Kg", precioUnitario: 12_800, subtotal: 6_400_000,
        requiereCadenaFrio: true, temperaturaMinima: 0, temperaturaMaxima: 4,
      },
      {
        id: "det-002",
        itemId: "item-002", itemNombre: "Muslo de pollo", itemCodigo: "CAR-002",
        categoriaId: "cat-001", categoriaNombre: "Cárnicos",
        cantidadSolicitada: 300, cantidadRecibida: 0, cantidadPendiente: 300,
        unidadMedida: "Kg", precioUnitario: 8_533, subtotal: 2_560_000,
        requiereCadenaFrio: true, temperaturaMinima: 0, temperaturaMaxima: 4,
      },
    ],
  },
  {
    id: "oc-002",
    numeroOC: "OC-2026-0110",
    proveedorId: "prov-003",
    proveedorNombre: "Riopaila Castilla",
    proveedorNit: "860.000.491-3",
    fechaEmision: "2026-02-18",
    fechaEntregaEsperada: "2026-02-26",
    fechaVencimiento: "2026-03-10",
    estado: EstadoOC.ParcialmenteRecibida,
    totalItems: 2,
    valorTotal: 6_500_000,
    requiereCadenaFrio: false,
    detalles: [
      {
        id: "det-003",
        itemId: "item-006", itemNombre: "Azúcar refinada", itemCodigo: "SEC-001",
        categoriaId: "cat-003", categoriaNombre: "Secos",
        cantidadSolicitada: 2000, cantidadRecibida: 2000, cantidadPendiente: 0,
        unidadMedida: "Kg", precioUnitario: 2_800, subtotal: 5_600_000,
        requiereCadenaFrio: false,
      },
      {
        id: "det-004",
        itemId: "item-007", itemNombre: "Azúcar morena", itemCodigo: "SEC-002",
        categoriaId: "cat-003", categoriaNombre: "Secos",
        cantidadSolicitada: 500, cantidadRecibida: 0, cantidadPendiente: 500,
        unidadMedida: "Kg", precioUnitario: 1_800, subtotal: 900_000,
        requiereCadenaFrio: false,
      },
    ],
  },
  {
    id: "oc-003",
    numeroOC: "OC-2026-0108",
    proveedorId: "prov-002",
    proveedorNombre: "Lácteos del Valle",
    proveedorNit: "900.234.567-8",
    fechaEmision: "2026-02-17",
    fechaEntregaEsperada: "2026-02-25",
    fechaVencimiento: "2026-03-03",
    estado: EstadoOC.Abierta,
    totalItems: 2,
    valorTotal: 4_200_000,
    requiereCadenaFrio: true,
    detalles: [
      {
        id: "det-005",
        itemId: "item-003", itemNombre: "Leche entera UHT", itemCodigo: "LAC-001",
        categoriaId: "cat-002", categoriaNombre: "Lácteos",
        cantidadSolicitada: 1000, cantidadRecibida: 0, cantidadPendiente: 1000,
        unidadMedida: "L", precioUnitario: 3_200, subtotal: 3_200_000,
        requiereCadenaFrio: true, temperaturaMinima: 2, temperaturaMaxima: 8,
      },
      {
        id: "det-006",
        itemId: "item-004", itemNombre: "Queso doble crema", itemCodigo: "LAC-002",
        categoriaId: "cat-002", categoriaNombre: "Lácteos",
        cantidadSolicitada: 100, cantidadRecibida: 0, cantidadPendiente: 100,
        unidadMedida: "Kg", precioUnitario: 10_000, subtotal: 1_000_000,
        requiereCadenaFrio: true, temperaturaMinima: 2, temperaturaMaxima: 8,
      },
    ],
  },
];

export const MOCK_OC_TODAS: OrdenCompraResumen[] = [
  ...MOCK_OC_ABIERTAS,
  {
    id: "oc-004",
    numeroOC: "OC-2026-0095",
    proveedorId: "prov-001",
    proveedorNombre: "AviCol S.A.",
    proveedorNit: "800.123.456-7",
    fechaEmision: "2026-02-01",
    fechaEntregaEsperada: "2026-02-10",
    estado: EstadoOC.TotalmenteRecibida,
    totalItems: 1,
    valorTotal: 5_120_000,
    requiereCadenaFrio: true,
    detalles: [
      {
        id: "det-007",
        itemId: "item-001", itemNombre: "Pechuga de pollo", itemCodigo: "CAR-001",
        categoriaId: "cat-001", categoriaNombre: "Cárnicos",
        cantidadSolicitada: 400, cantidadRecibida: 400, cantidadPendiente: 0,
        unidadMedida: "Kg", precioUnitario: 12_800, subtotal: 5_120_000,
        requiereCadenaFrio: true, temperaturaMinima: 0, temperaturaMaxima: 4,
      },
    ],
  },
  {
    id: "oc-005",
    numeroOC: "OC-2026-0080",
    proveedorId: "prov-006",
    proveedorNombre: "Alimentos Deli Ltda.",
    proveedorNit: "800.987.654-3",
    fechaEmision: "2026-01-15",
    fechaEntregaEsperada: "2026-01-20",
    fechaVencimiento: "2026-01-31",
    estado: EstadoOC.Cancelada,
    totalItems: 1,
    valorTotal: 1_200_000,
    requiereCadenaFrio: false,
    detalles: [
      {
        id: "det-008",
        itemId: "item-006", itemNombre: "Azúcar refinada", itemCodigo: "SEC-001",
        categoriaId: "cat-003", categoriaNombre: "Secos",
        cantidadSolicitada: 400, cantidadRecibida: 0, cantidadPendiente: 400,
        unidadMedida: "Kg", precioUnitario: 3_000, subtotal: 1_200_000,
        requiereCadenaFrio: false,
      },
    ],
  },
];

// ─── DETALLE COMPLETO (para DetalleOCPage) ────────────────────────────────────

export const MOCK_OC_DETALLE: OrdenCompra = {
  ...MOCK_OC_ABIERTAS[0],
  observaciones: "Entrega en muelle 2. Llamar a portería antes de ingresar. Requiere bitácora de temperatura del vehículo.",
  creadoPorNombre: "Pedro Gómez (Compras)",
  creadoEn: "2026-02-20T14:30:00",
  recepciones: [],
};