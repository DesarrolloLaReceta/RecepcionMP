import {
  type NoConformidad, EstadoNC, TipoNC, PrioridadNC,
} from "../../Services/no-conformidades.service";

export const MOCK_NC: NoConformidad[] = [
  {
    id: "nc-001", numero: "NC-2026-0018",
    tipo: TipoNC.TemperaturaFueraRango, prioridad: PrioridadNC.Alta,
    estado: EstadoNC.EnAnalisis,
    titulo: "Temperatura de recepción fuera de rango — pechuga de pollo",
    descripcion: "Al medir la temperatura del compartimento se obtuvo 6.8°C, superando el máximo permitido de 4°C para productos cárnicos refrigerados.",
    proveedorNombre: "AviCol S.A.",
    loteId: "lote-001", numeroLote: "L-2026-0048-01", itemNombre: "Pechuga de pollo",
    recepcionId: "rec-001", numeroRecepcion: "REC-2026-0048",
    fechaDeteccion: "2026-02-24", fechaLimite: "2026-03-03",
    detectadoPor: "Laura Gómez", asignadoA: "Laura Gómez",
    causaRaiz: "El vehículo presentó falla en el sistema de refrigeración durante el trayecto. Se evidenció alza de temperatura progresiva en bitácora.",
    notificarProveedor: true,
    creadoEn: "2026-02-24T09:00:00",
    accionesCorrectivas: [
      { id: "ac-001", descripcion: "Notificar formalmente a AviCol S.A. y solicitar plan de acción preventivo.", responsable: "Patricia Silva", fechaCompromiso: "2026-02-25", estado: "Pendiente", fechaCierre: "2026-02-25T14:30:00", evidencia: "Correo enviado con acuse de recibo." },
      { id: "ac-002", descripcion: "Verificar mantenimiento del vehículo. Solicitar certificado de calibración del sistema de frío.", responsable: "Laura Gómez", fechaCompromiso: "2026-03-01", estado: "EnCurso" },
      { id: "ac-003", descripcion: "Análisis microbiológico y sensorial del lote en cuarentena antes de decisión final.", responsable: "Laura Gómez", fechaCompromiso: "2026-03-03", estado: "Pendiente" },
    ],
    comentarios: []
  },
  {
    id: "nc-002", numero: "NC-2026-0017",
    tipo: TipoNC.DocumentacionIncompleta, prioridad: PrioridadNC.Media,
    estado: EstadoNC.EnEjecucion,
    titulo: "COA no presentado en recepción — azúcar morena",
    descripcion: "El proveedor Riopaila Castilla no presentó el Certificado de Análisis (COA) del lote de azúcar morena al momento de la recepción.",
    proveedorNombre: "Riopaila Castilla",
    loteId: "lote-004", numeroLote: "L-2026-0044-02", itemNombre: "Azúcar morena",
    recepcionId: "rec-005", numeroRecepcion: "REC-2026-0044",
    fechaDeteccion: "2026-02-21", fechaLimite: "2026-02-28",
    detectadoPor: "Andrés Torres", asignadoA: "Patricia Silva",
    notificarProveedor: true,
    creadoEn: "2026-02-21T11:00:00",
    accionesCorrectivas: [
      { id: "ac-004", descripcion: "Solicitar COA a Riopaila Castilla vía correo con plazo de 48 horas.", responsable: "Patricia Silva", fechaCompromiso: "2026-02-23", estado: "Completada", fechaCierre: "2026-02-22T10:00:00", evidencia: "COA recibido y archivado en sistema." },
    ],
    comentarios: []
  },
  {
    id: "nc-003", numero: "NC-2026-0016",
    tipo: TipoNC.MermaParcial, prioridad: PrioridadNC.Baja,
    estado: EstadoNC.Abierta,
    titulo: "Diferencia de 2 kg en cantidad recibida vs OC — azúcar refinada",
    descripcion: "Se recibieron 1,998 Kg de azúcar refinada contra los 2,000 Kg de la OC. Diferencia de 2 Kg (0.1%).",
    proveedorNombre: "Riopaila Castilla",
    loteId: "lote-003", numeroLote: "L-2026-0044-01", itemNombre: "Azúcar refinada",
    recepcionId: "rec-005", numeroRecepcion: "REC-2026-0044",
    fechaDeteccion: "2026-02-21",
    detectadoPor: "Andrés Torres",
    notificarProveedor: false,
    creadoEn: "2026-02-21T11:30:00",
    accionesCorrectivas: [],
    comentarios: []
  },
  {
    id: "nc-004", numero: "NC-2026-0015",
    tipo: TipoNC.RotuladoNoConforme, prioridad: PrioridadNC.Critica,
    estado: EstadoNC.Cerrada,
    titulo: "Etiqueta sin fecha de vencimiento visible — yogur natural",
    descripcion: "La etiqueta del yogur natural presentaba fecha de vencimiento ilegible por impresión defectuosa. Incumple Res. 5109/2005.",
    proveedorNombre: "Lácteos del Valle",
    itemNombre: "Yogur natural",
    recepcionId: "rec-002", numeroRecepcion: "REC-2026-0047",
    fechaDeteccion: "2026-02-23", fechaLimite: "2026-02-24", fechaCierre: "2026-02-24",
    detectadoPor: "Laura Gómez", asignadoA: "Laura Gómez",
    causaRaiz: "Falla en impresora de fechas del proveedor. Lote reemplazado con rotulado correcto.",
    notificarProveedor: true,
    creadoEn: "2026-02-23T08:30:00",
    accionesCorrectivas: [
      { id: "ac-005", descripcion: "Rechazar lote y solicitar reposición inmediata con rotulado conforme.", responsable: "Laura Gómez", fechaCompromiso: "2026-02-24", estado: "Completada", fechaCierre: "2026-02-24T07:00:00", evidencia: "Lote repuesto. Acta de reposición firmada y archivada." },
    ],
    comentarios: []
  },
  {
    id: "nc-005", numero: "NC-2026-0014",
    tipo: TipoNC.CalidadSensorial, prioridad: PrioridadNC.Alta,
    estado: EstadoNC.Cerrada,
    titulo: "Olor atípico en queso doble crema — rechazo total",
    descripcion: "Queso doble crema presentó olor ligeramente ácido-rancio durante inspección sensorial. Lote rechazado en recepción.",
    proveedorNombre: "Lácteos del Valle",
    itemNombre: "Queso doble crema",
    recepcionId: "rec-002", numeroRecepcion: "REC-2026-0047",
    fechaDeteccion: "2026-02-23", fechaCierre: "2026-02-23",
    detectadoPor: "Laura Gómez",
    causaRaiz: "Ruptura de cadena de frío en almacenamiento del proveedor previo al despacho.",
    notificarProveedor: true,
    creadoEn: "2026-02-23T09:15:00",
    accionesCorrectivas: [
      { id: "ac-006", descripcion: "Rechazo total del lote y devolución al proveedor con acta.", responsable: "Laura Gómez", fechaCompromiso: "2026-02-23", estado: "Completada", fechaCierre: "2026-02-23T12:00:00", evidencia: "Acta de devolución No. DEV-2026-0023 firmada." },
    ],
    comentarios: []
  },
];