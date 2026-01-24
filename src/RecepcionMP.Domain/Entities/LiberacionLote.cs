namespace RecepcionMP.Domain.Entities;

/// <summary>
/// Decisión final de liberación o rechazo de un lote
/// Representa la salida del proceso de calidad
/// Audita quién, cuándo y bajo qué condiciones se libera/rechaza
/// </summary>
public class LiberacionLote
{
    public int Id { get; set; }

    public int LoteId { get; set; }
    public Lote Lote { get; set; } = null!;

    public int RecepcionId { get; set; }
    public Recepcion Recepcion { get; set; } = null!;

    // Decisión
    public EstadoLiberacion Estado { get; set; } = EstadoLiberacion.Pendiente;
    
    public DateTime FechaDecision { get; set; } = DateTime.UtcNow;
    public string LiberadoPor { get; set; } = string.Empty; // UserId
    public string Observaciones { get; set; } = string.Empty;

    // En caso de rechazo
    public string? MotivoRechazo { get; set; }

    // Auditoría
    public DateTime FechaUltimaActualizacion { get; set; } = DateTime.UtcNow;

    // Métodos de dominio
    public void Liberar(string usuarioId, string observaciones = "")
    {
        if (Estado != EstadoLiberacion.Pendiente)
            throw new InvalidOperationException($"No se puede liberar un lote en estado {Estado}");

        if (string.IsNullOrWhiteSpace(usuarioId))
            throw new ArgumentException("Usuario que libera es requerido", nameof(usuarioId));

        Estado = EstadoLiberacion.Liberado;
        LiberadoPor = usuarioId;
        Observaciones = observaciones ?? string.Empty;
        FechaDecision = DateTime.UtcNow;
        FechaUltimaActualizacion = DateTime.UtcNow;
    }

    public void Rechazar(string usuarioId, string motivo)
    {
        if (Estado != EstadoLiberacion.Pendiente)
            throw new InvalidOperationException($"No se puede rechazar un lote en estado {Estado}");

        if (string.IsNullOrWhiteSpace(usuarioId))
            throw new ArgumentException("Usuario que rechaza es requerido", nameof(usuarioId));

        if (string.IsNullOrWhiteSpace(motivo))
            throw new ArgumentException("Motivo de rechazo es requerido", nameof(motivo));

        Estado = EstadoLiberacion.Rechazado;
        LiberadoPor = usuarioId;
        MotivoRechazo = motivo;
        FechaDecision = DateTime.UtcNow;
        FechaUltimaActualizacion = DateTime.UtcNow;
    }

    // Eventos de dominio (para publicación por el servicio de aplicación)
    private readonly List<RecepcionMP.Domain.Events.DomainEvent> _domainEvents = new();
    public IReadOnlyCollection<RecepcionMP.Domain.Events.DomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void AgregarEvento(RecepcionMP.Domain.Events.DomainEvent evento)
    {
        if (evento != null)
            _domainEvents.Add(evento);
    }

    public void LimpiarEventos()
    {
        _domainEvents.Clear();
    }

    public bool PuedeLiberarse()
    {
        // No documentos pendientes (validado en servicio)
        // No no-conformidades abiertas sin acciones (validado en servicio)
        // CheckList aprobado (validado en servicio)
        return Estado == EstadoLiberacion.Pendiente;
    }
}

/// <summary>
/// Estados finales de un lote tras control de calidad
/// </summary>
public enum EstadoLiberacion
{
    Pendiente,   // Esperando decisión de calidad
    Liberado,    // Aprobado para venta/procesamiento
    Rechazado    // Rechazado, requiere acción (devolución, destrucción, etc)
}
