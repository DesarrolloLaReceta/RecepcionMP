export interface ItemOC {
  id: number;
  nombre: string;
  cantidadEsperada: number;
  unidad: string;
}

export interface OrdenCompra {
  numero: string;
  proveedor: string;
  fecha: string;
  estado: string;
  items: ItemOC[];
}
