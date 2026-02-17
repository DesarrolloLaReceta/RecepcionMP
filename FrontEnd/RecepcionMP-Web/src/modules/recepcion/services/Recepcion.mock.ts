import type { OrdenCompra } from "../components/BuscarOC/BuscarOC.types";

export const buscarOrdenesCompra: OrdenCompra[] = [
  {
    numero: "10045",
    proveedor: "Proveedor Alimentos SAS",
    fecha: "2026-02-10",
    estado: "Abierta",
    items: [
      { id: 1, nombre: "Leche Entera", cantidadEsperada: 200, unidad: "L" },
      { id: 2, nombre: "Harina de Trigo", cantidadEsperada: 500, unidad: "Kg" }
    ]
  }
];
