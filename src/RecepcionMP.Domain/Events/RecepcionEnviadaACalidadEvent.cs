namespace RecepcionMP.Domain.Events;

/// <summary>
/// Evento publicado cuando se envía una recepción a calidad
/// </summary>
public class RecepcionEnviadaACalidadEvent : DomainEvent
{
    public int RecepcionId { get; set; }
    public int OrdenCompraId { get; set; }
    public int LoteCount { get; set; }
    public string EnviadoPor { get; set; }
    public DateTime FechaEnvio { get; set; }

    public RecepcionEnviadaACalidadEvent(
        int recepcionId,
        int ordenCompraId,
        int loteCount,
        string enviadoPor)
    {
        RecepcionId = recepcionId;
        OrdenCompraId = ordenCompraId;
        LoteCount = loteCount;
        EnviadoPor = enviadoPor;
        FechaEnvio = DateTime.UtcNow;
    }
}
