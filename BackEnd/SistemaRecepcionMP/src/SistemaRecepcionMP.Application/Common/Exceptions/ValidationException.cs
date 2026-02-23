namespace SistemaRecepcionMP.Application.Common.Exceptions;

/// <summary>
/// Se lanza cuando FluentValidation detecta errores en un Command o Query
/// antes de que llegue al Handler. Agrupa todos los errores por campo.
/// </summary>
public sealed class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    /// <summary>
    /// Constructor para múltiples errores de validación agrupados por campo.
    /// </summary>
    public ValidationException(IDictionary<string, string[]> errors)
        : base("Se encontraron uno o más errores de validación.")
    {
        Errors = errors;
    }

    /// <summary>
    /// Constructor para un único error en un campo específico.
    /// </summary>
    public ValidationException(string campo, string mensaje)
        : base("Se encontraron uno o más errores de validación.")
    {
        Errors = new Dictionary<string, string[]>
        {
            { campo, new[] { mensaje } }
        };
    }

    /// <summary>
    /// Constructor para un error general no asociado a un campo específico.
    /// Útil cuando la validación cruza múltiples campos.
    /// </summary>
    public ValidationException(string mensaje)
        : base("Se encontraron uno o más errores de validación.")
    {
        Errors = new Dictionary<string, string[]>
        {
            { "General", new[] { mensaje } }
        };
    }
}