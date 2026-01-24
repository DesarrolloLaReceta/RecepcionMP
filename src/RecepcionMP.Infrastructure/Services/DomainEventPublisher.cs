using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RecepcionMP.Domain.Events;
using RecepcionMP.Domain.Interfaces;

namespace RecepcionMP.Infrastructure.Services
{
    /// <summary>
    /// Implementación de publicador de eventos de dominio.
    /// En una implementación más avanzada, esto podría integrarse con MediatR o un event bus.
    /// </summary>
    public class DomainEventPublisher : IDomainEventPublisher
    {
        private readonly List<Func<DomainEvent, Task>> _subscribers = new();

        /// <summary>
        /// Registra un manejador de eventos
        /// </summary>
        public void Subscribe<T>(Func<T, Task> handler) where T : DomainEvent
        {
            _subscribers.Add(async (evt) =>
            {
                if (evt is T typedEvent)
                {
                    await handler(typedEvent);
                }
            });
        }

        /// <summary>
        /// Publica un evento de dominio a todos los suscriptores
        /// </summary>
        public async Task PublishAsync(DomainEvent domainEvent)
        {
            if (domainEvent == null)
                throw new ArgumentNullException(nameof(domainEvent));

            // Ejecutar todos los suscriptores
            var tasks = _subscribers.Select(sub => sub(domainEvent));
            await Task.WhenAll(tasks);
        }

        /// <summary>
        /// Publica múltiples eventos de dominio
        /// </summary>
        public async Task PublishManyAsync(IEnumerable<DomainEvent> domainEvents)
        {
            if (domainEvents == null)
                throw new ArgumentNullException(nameof(domainEvents));

            foreach (var evt in domainEvents)
            {
                await PublishAsync(evt);
            }
        }
    }
}
