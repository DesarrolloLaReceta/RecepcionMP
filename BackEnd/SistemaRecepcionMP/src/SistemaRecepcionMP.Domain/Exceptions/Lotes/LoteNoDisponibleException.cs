using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Exceptions.Lotes;

public sealed class LoteNoDisponibleException : DomainException
{
    public LoteNoDisponibleException(string codigoLote, EstadoLote estadoActual, string accionIntentada)
        : base($"No se puede ejecutar '{accionIntentada}' sobre el lote '{codigoLote}' " +
               $"porque su estado actual es '{estadoActual}'.") { }

    public LoteNoDisponibleException(string codigoLote, EstadoLote estadoActual)
        : base($"El lote '{codigoLote}' no está disponible para operaciones. " +
               $"Estado actual: '{estadoActual}'.") { }
}