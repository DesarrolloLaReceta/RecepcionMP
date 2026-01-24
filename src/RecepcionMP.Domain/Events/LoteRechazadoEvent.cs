namespace RecepcionMP.Domain.Events;

/// <summary>
/// Evento publicado cuando se rechaza un lote
/// </summary>
public class LoteRechazadoEvent : DomainEvent
{
    public int LoteId { get; set; }
    public int RecepcionId { get; set; }
    public string Motivo { get; set; }
    public string RechazadoPor { get; set; }
    public DateTime FechaRechazo { get; set; }

    public LoteRechazadoEvent(
        int loteId,
        int recepcionId,
        string motivo,
        string rechazadoPor)
    {
        LoteId = loteId;
        RecepcionId = recepcionId;
        Motivo = motivo;
        RechazadoPor = rechazadoPor;
        FechaRechazo = DateTime.UtcNow;
    }
}
