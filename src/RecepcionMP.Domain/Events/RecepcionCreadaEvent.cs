namespace RecepcionMP.Domain.Events;

/// <summary>
/// Evento publicado cuando se crea una recepción
/// </summary>
public class RecepcionCreadaEvent : DomainEvent
{
    public int RecepcionId { get; set; }
    public int OrdenCompraId { get; set; }
    public int? ProveedorId { get; set; }
    public DateTime FechaRecepcion { get; set; }
    public bool RequiereAprobacionCalidad { get; set; }
    public string CreadoPor { get; set; }

    public RecepcionCreadaEvent(
        int recepcionId,
        int ordenCompraId,
        int? proveedorId,
        DateTime fechaRecepcion,
        bool requiereAprobacionCalidad,
        string creadoPor)
    {
        RecepcionId = recepcionId;
        OrdenCompraId = ordenCompraId;
        ProveedorId = proveedorId;
        FechaRecepcion = fechaRecepcion;
        RequiereAprobacionCalidad = requiereAprobacionCalidad;
        CreadoPor = creadoPor;
    }
}
