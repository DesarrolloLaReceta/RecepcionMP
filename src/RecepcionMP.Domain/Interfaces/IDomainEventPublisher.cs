using RecepcionMP.Domain.Events;

namespace RecepcionMP.Domain.Interfaces;

/// <summary>
/// Interfaz para publicar eventos de dominio
/// </summary>
public interface IDomainEventPublisher
{
    Task PublishAsync(DomainEvent domainEvent);
    Task PublishManyAsync(IEnumerable<DomainEvent> domainEvents);
}
