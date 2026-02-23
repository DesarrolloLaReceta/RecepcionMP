namespace SistemaRecepcionMP.Domain.Exceptions.Calidad;

public sealed class LiberacionNoAutorizadaException : DomainException
{
    public LiberacionNoAutorizadaException(string nombreUsuario)
        : base($"El usuario '{nombreUsuario}' no tiene autorización para liberar lotes. " +
               $"Esta acción está reservada para usuarios con perfil de Calidad.") { }
}