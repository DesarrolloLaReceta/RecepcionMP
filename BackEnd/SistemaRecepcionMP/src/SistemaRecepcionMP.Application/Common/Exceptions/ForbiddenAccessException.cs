using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Application.Common.Exceptions;

/// <summary>
/// Se lanza cuando el usuario está autenticado pero no tiene el perfil
/// necesario para ejecutar la operación solicitada.
/// Produce un HTTP 403 Forbidden en el middleware de la API.
/// </summary>
public sealed class ForbiddenAccessException : Exception
{
    public PerfilUsuario? PerfilRequerido { get; }
    public PerfilUsuario? PerfilActual { get; }

    /// <summary>
    /// Error genérico sin especificar perfiles.
    /// </summary>
    public ForbiddenAccessException()
        : base("No tiene permisos para ejecutar esta operación.") { }

    /// <summary>
    /// Especifica qué perfil se requiere y cuál tiene el usuario actual.
    /// </summary>
    public ForbiddenAccessException(PerfilUsuario perfilRequerido, PerfilUsuario perfilActual)
        : base($"Esta operación requiere el perfil '{perfilRequerido}'. " +
               $"Su perfil actual es '{perfilActual}'.")
    {
        PerfilRequerido = perfilRequerido;
        PerfilActual = perfilActual;
    }

    /// <summary>
    /// Especifica múltiples perfiles válidos y cuál tiene el usuario actual.
    /// </summary>
    public ForbiddenAccessException(IEnumerable<PerfilUsuario> perfilesRequeridos, PerfilUsuario perfilActual)
        : base($"Esta operación requiere uno de los siguientes perfiles: " +
               $"{string.Join(", ", perfilesRequeridos)}. " +
               $"Su perfil actual es '{perfilActual}'.")
    {
        PerfilActual = perfilActual;
    }

    /// <summary>
    /// Para operaciones con nombre específico, da más contexto al usuario.
    /// </summary>
    public ForbiddenAccessException(string operacion, PerfilUsuario perfilRequerido, PerfilUsuario perfilActual)
        : base($"La operación '{operacion}' requiere el perfil '{perfilRequerido}'. " +
               $"Su perfil actual es '{perfilActual}'.")
    {
        PerfilRequerido = perfilRequerido;
        PerfilActual = perfilActual;
    }
}