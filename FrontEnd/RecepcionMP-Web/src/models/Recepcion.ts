import type { Lote } from "./Lote";
import type { CheckListItem } from "./CheckListItem";
import type { NoConformidad } from "./NoComformidad";

export type ResultadoRecepcion =
  | "ACEPTADO"
  | "RECHAZO_PARCIAL"
  | "RECHAZO_TOTAL"
  | "CUARENTENA";

export interface Recepcion {
  ordenCompraId: number;

  factura: {
    numero: string;
    fecha: string;          // ISO string
    valorTotal: number;
    archivoUrl?: string;    // o fileId si luego lo manejas así
  };

  lotes: Lote[];

  condicionesTransporte?: {
    placaVehiculo?: string;
    transportista?: string;
    temperatura?: number;
    estadoEmpaque?: string;
    evidenciaUrl?: string;
  };

  checklist: CheckListItem[];

  noConformidades?: NoConformidad[];

  resultado: ResultadoRecepcion;
}
