#if false
using RecepcionMP.Application.DTOs;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Domain.Events;
using RecepcionMP.Domain.Interfaces;

namespace RecepcionMP.Application.Services
{
    /// <summary>
    /// Ejemplo de cómo integrar los manejadores de eventos con el sistema.
    /// En una aplicación real, esto se podría hacer automáticamente con reflexión o MediatR.
    /// </summary>
    public class EventHandlerRegistration
    {
        /// <summary>
        /// Registra los manejadores de eventos con el publicador.
        /// Se ejecuta una sola vez al inicializar la aplicación.
        /// </summary>
        public static void RegisterHandlers(IDomainEventPublisher publisher)
        {
            var recepcionHandler = new RecepcionCreadaEventHandler();
            var loteHandler = new LoteRechazadoEventHandler();
            var calidadHandler = new RecepcionEnviadaACalidadEventHandler();

            // Suscribir handlers a eventos
            publisher.Subscribe<RecepcionCreadaEvent>(recepcionHandler.HandleAsync);
            publisher.Subscribe<LoteRechazadoEvent>(loteHandler.HandleAsync);
            publisher.Subscribe<RecepcionEnviadaACalidadEvent>(calidadHandler.HandleAsync);
        }
    }

    /// <summary>
    /// Ejemplo de flujo completo de recepción con eventos.
    /// Este código demuestra cómo los eventos se propagan a través del sistema.
    /// </summary>
    public class EjemploFlujoCompleto
    {
        private readonly IRecepcionService _recepcionService;
        private readonly ICalidadService _calidadService;
        private readonly IDomainEventPublisher _eventPublisher;

        public EjemploFlujoCompleto(
            IRecepcionService recepcionService,
            ICalidadService calidadService,
            IDomainEventPublisher eventPublisher)
        {
            _recepcionService = recepcionService;
            _calidadService = calidadService;
            _eventPublisher = eventPublisher;
        }

        /// <summary>
        /// Flujo de ejemplo: Recepción → Envío a Calidad → Evaluación de Lotes
        /// </summary>
        public async Task EjecutarFlujoRecepcionCompleto()
        {
            // 1. Crear recepción
            var createDto = new CreateRecepcionDto
            {
                OrdenCompraId = 1,
                FechaRecepcion = DateTime.UtcNow,
                PlacaVehiculo = "ABC-123",
                NombreTransportista = "Juan Pérez",
                UsuarioId = "user@example.com",
                Lotes = new List<CreateLoteDto>
                {
                    new CreateLoteDto
                    {
                        ItemId = 1,
                        NumeroLote = "LOTE-001",
                        FechaFabricacion = DateTime.UtcNow.AddMonths(-1),
                        FechaVencimiento = DateTime.UtcNow.AddMonths(6),
                        CantidadRecibida = 100,
                        UnidadMedida = "kg"
                    }
                },
                ChecklistItems = new List<CreateCheckListItemDto>
                {
                    new CreateCheckListItemDto
                    {
                        Nombre = "Vehículo refrigerado",
                        EsConforme = true,
                        EsCritico = true,
                        Observacion = "Temperatura óptima"
                    }
                }
            };

            // Al ejecutar CrearAsync:
            // 1. Recepcion se crea en estado PendienteCalidad
            // 2. RecepcionCreadaEvent se dispara
            // 3. Handlers reaccionan:
            //    - RecepcionCreadaEventHandler: Audita + notifica Calidad
            //    - Otros handlers: Actualizan métricas, etc.

            int recepcionId = await _recepcionService.CrearAsync(createDto);
            Console.WriteLine($"✅ Recepción #{recepcionId} creada y enviada a Calidad");

            // 2. Evaluar lotes en Calidad (ejemplo simplificado)
            // En Sprint 3.2 esta lógica estará en CalidadService

            // Al rechazar un lote:
            // 1. LoteRechazadoEvent se dispara
            // 2. Handlers reaccionan:
            //    - LoteRechazadoEventHandler: Notifica proveedor, crea no-conformidad

            // var rechazarDto = new RechazarLoteDto { ... };
            // await _calidadService.RechazarLoteAsync(loteId, rechazarDto);
            // Console.WriteLine("Lote rechazado - Evento propagado");

            // 3. Si todos los lotes son rechazados, estado es Rechazada
            // Si algún lote es aceptado, estado es Aceptada

            // Si se acepta:
            // 1. LiberacionLote se crea
            // 2. Estado final: Aceptada
            // 3. Se puede proceder a bodega de producto terminado

            // var liberarDto = new LiberarLoteDto { ... };
            // await _calidadService.LiberarLoteAsync(loteId, liberarDto);
            // Console.WriteLine("Lote liberado - Recepción completada");
        }

        /// <summary>
        /// Demuestra la arquitectura sin acoplamiento entre servicios
        /// </summary>
        public async Task DemostrarDesacoplamiento()
        {
            Console.WriteLine("ARQUITECTURA DE EVENTOS - SIN ACOPLAMIENTO\n");

            Console.WriteLine("Antes (Acoplado):");
            Console.WriteLine("RecepcionService → CalidadService → NotificacionService → AuditoriaService");
            Console.WriteLine("Problema: Si CalidadService falla, Auditoria no se ejecuta\n");

            Console.WriteLine("Después (Con Eventos):");
            Console.WriteLine(@"
RecepcionService crea Recepcion
    ↓
    Event: RecepcionCreadaEvent
    ↙         ↓         ↘
CalidadHandler  MetricasHandler  AuditoriaHandler
(Independientes - se ejecutan en paralelo)
            ");

            Console.WriteLine("\nBeneficios:");
            Console.WriteLine("1. Desacoplamiento: Cada handler es independiente");
            Console.WriteLine("2. Escalabilidad: Agregar handlers sin modificar RecepcionService");
            Console.WriteLine("3. Resiliencia: Si un handler falla, otros continúan");
            Console.WriteLine("4. Trazabilidad: Todos los eventos están registrados");
            Console.WriteLine("5. Testing: Handlers se prueban aisladamente");
        }
    }

    /// <summary>
    /// Ejemplo de cómo extender el sistema con nuevos handlers sin modificar código existente.
    /// Este es el poder de los eventos de dominio.
    /// </summary>
    public class NuevoHandlerEjemplo
    {
        /// <summary>
        /// Ejemplo: Nuevo handler para integración con sistema externo
        /// </summary>
        public class RecepcionCreadaIntegracionSAPHandler
        {
            public async Task HandleAsync(RecepcionCreadaEvent evento)
            {
                // Enviar a SAP sin que RecepcionService lo conozca
                Console.WriteLine($"Sincronizando recepción {evento.RecepcionId} a SAP...");
                await Task.Delay(100); // Simulación
                Console.WriteLine("Sincronización SAP completada");
            }
        }

        /// <summary>
        /// Ejemplo: Handler para enviar notificación por email
        /// </summary>
        public class RecepcionCreadaEmailHandler
        {
            public async Task HandleAsync(RecepcionCreadaEvent evento)
            {
                if (evento.RequiereAprobacionCalidad)
                {
                    Console.WriteLine($"Enviando email a equipo de Calidad para recepción {evento.RecepcionId}...");
                    await Task.Delay(100); // Simulación
                    Console.WriteLine("Email enviado");
                }
            }
        }

        /// <summary>
        /// Ejemplo: Handler para logging en sistema externo
        /// </summary>
        public class RecepcionCreadaLoggingHandler
        {
            public async Task HandleAsync(RecepcionCreadaEvent evento)
            {
                Console.WriteLine($"Registrando evento en ELK Stack...");
                var logEntry = new
                {
                    Timestamp = evento.OcurridoEn,
                    EventId = evento.EventId,
                    EventType = nameof(RecepcionCreadaEvent),
                    RecepcionId = evento.RecepcionId,
                    OrdenCompraId = evento.OrdenCompraId,
                    Usuario = evento.CreadoPor
                };
                await Task.Delay(100); // Simulación
                Console.WriteLine("Evento registrado en logs");
            }
        }
    }
}
#endif