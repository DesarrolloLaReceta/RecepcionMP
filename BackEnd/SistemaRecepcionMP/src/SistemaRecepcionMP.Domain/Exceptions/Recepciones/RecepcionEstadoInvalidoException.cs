using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Exceptions.Recepciones;

public sealed class RecepcionEstadoInvalidoException : DomainException
{
    public RecepcionEstadoInvalidoException(string numeroRecepcion, EstadoRecepcion estadoActual, string accionIntentada)
        : base($"No se puede ejecutar '{accionIntentada}' sobre la recepción '{numeroRecepcion}' porque su estado actual es '{estadoActual}'.") { }
}