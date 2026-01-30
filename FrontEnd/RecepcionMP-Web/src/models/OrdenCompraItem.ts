export interface OrdenCompraItem {
  id: number;
  itemId: number;
  nombre: string;
  cantidadEsperada: number;
  unidadMedida: string;
  requiereCadenaFrio: boolean;
}
