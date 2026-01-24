namespace RecepcionMP.Domain.Events;

/// <summary>
/// Evento de dominio base para todos los eventos del sistema
/// </summary>
public abstract class DomainEvent
{
    public DateTime OcurridoEn { get; set; } = DateTime.UtcNow;
    public Guid EventId { get; set; } = Guid.NewGuid();
}
