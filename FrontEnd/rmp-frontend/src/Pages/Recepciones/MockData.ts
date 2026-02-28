import type { RecepcionResumen } from "../../Services/recepciones.service";
import { EstadoRecepcion } from "../../Types/api";

export const MOCK_RECEPCIONES: RecepcionResumen[] = [
  {
    id: "rec-001", numeroRecepcion: "REC-2026-0048",
    ordenCompraNumero: "OC-2026-0112", proveedorNombre: "AviCol S.A.", proveedorId: "prov-001",
    fechaRecepcion: "2026-02-24", horaLlegadaVehiculo: "07:30:00",
    placaVehiculo: "OPQ-451", nombreTransportista: "Luis García",
    estado: EstadoRecepcion.PendienteCalidad,
    totalLotes: 3, lotesLiberados: 0, lotesRechazados: 0,
  },
  {
    id: "rec-002", numeroRecepcion: "REC-2026-0047",
    ordenCompraNumero: "OC-2026-0109", proveedorNombre: "Lácteos del Valle", proveedorId: "prov-002",
    fechaRecepcion: "2026-02-23", horaLlegadaVehiculo: "08:15:00",
    placaVehiculo: "JKL-782", nombreTransportista: "Carlos Rueda",
    estado: EstadoRecepcion.Liberada,
    totalLotes: 5, lotesLiberados: 5, lotesRechazados: 0,
  },
  {
    id: "rec-003", numeroRecepcion: "REC-2026-0046",
    ordenCompraNumero: "OC-2026-0105", proveedorNombre: "Riopaila Castilla", proveedorId: "prov-003",
    fechaRecepcion: "2026-02-23", horaLlegadaVehiculo: "10:00:00",
    placaVehiculo: "ABC-123",
    estado: EstadoRecepcion.Rechazada,
    totalLotes: 2, lotesLiberados: 1, lotesRechazados: 1,
  },
  {
    id: "rec-004", numeroRecepcion: "REC-2026-0045",
    ordenCompraNumero: "OC-2026-0101", proveedorNombre: "Frigorífico Guadalupe", proveedorId: "prov-004",
    fechaRecepcion: "2026-02-22", horaLlegadaVehiculo: "06:45:00",
    placaVehiculo: "DEF-999", nombreTransportista: "Mario Pérez",
    estado: EstadoRecepcion.Liberada,
    totalLotes: 4, lotesLiberados: 3, lotesRechazados: 1,
  },
  {
    id: "rec-005", numeroRecepcion: "REC-2026-0044",
    ordenCompraNumero: "OC-2026-0098", proveedorNombre: "Harinas del Meta S.A.", proveedorId: "prov-005",
    fechaRecepcion: "2026-02-21", horaLlegadaVehiculo: "09:30:00",
    estado: EstadoRecepcion.RegistroLotes,
    totalLotes: 2, lotesLiberados: 0, lotesRechazados: 0,
  },
  {
    id: "rec-006", numeroRecepcion: "REC-2026-0043",
    ordenCompraNumero: "OC-2026-0094", proveedorNombre: "Alimentos Deli Ltda.", proveedorId: "prov-006",
    fechaRecepcion: "2026-02-20", horaLlegadaVehiculo: "11:00:00",
    placaVehiculo: "GHI-555",
    estado: EstadoRecepcion.InspeccionVehiculo,
    totalLotes: 0, lotesLiberados: 0, lotesRechazados: 0,
  },
];