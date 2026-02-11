export interface Lote {
  id: string;
  itemId: number;
  nombreItem: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadRecibida: number;
  observaciones?: string;
}
