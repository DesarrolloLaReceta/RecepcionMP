namespace RecepcionMP.Domain.Events;

/// <summary>
/// Evento publicado cuando un lote es liberado por Calidad
/// </summary>
public class LoteLiberadoEvent : DomainEvent
{
    public int LoteId { get; set; }
    public int RecepcionId { get; set; }
    public string LiberadoPor { get; set; }
    public string Observaciones { get; set; }
    public DateTime FechaLiberacion { get; set; }

    public LoteLiberadoEvent(int loteId, int recepcionId, string liberadoPor, string observaciones)
    {
        LoteId = loteId;
        RecepcionId = recepcionId;
        LiberadoPor = liberadoPor;
        Observaciones = observaciones ?? string.Empty;
        FechaLiberacion = DateTime.UtcNow;
    }
}
