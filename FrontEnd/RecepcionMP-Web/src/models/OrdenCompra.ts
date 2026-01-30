import type { OrdenCompraItem } from "./OrdenCompraItem";

export interface OrdenCompra {
  id: number;
  numero: string;
  fecha: string;        // ISO string
  proveedor: {
    id: number;
    nombre: string;
    nit: string;
  };
  items: OrdenCompraItem[];
}
