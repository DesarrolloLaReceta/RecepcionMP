namespace SistemaRecepcionMP.Application.Common.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Envía un correo simple con cuerpo en texto plano o HTML.
    /// </summary>
    Task EnviarAsync(
        string destinatario,
        string asunto,
        string cuerpo,
        bool esHtml = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Envía un correo a múltiples destinatarios.
    /// </summary>
    Task EnviarAVariosAsync(
        IEnumerable<string> destinatarios,
        string asunto,
        string cuerpo,
        bool esHtml = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Envía un correo usando una plantilla predefinida con parámetros de sustitución.
    /// Ejemplo de plantilla: "NoConformidadCreada", "LoteLiberado", "DocumentoPorVencer".
    /// </summary>
    Task EnviarConPlantillaAsync(
        string destinatario,
        string nombrePlantilla,
        IDictionary<string, string> parametros,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Envía un correo con archivos adjuntos.
    /// </summary>
    Task EnviarConAdjuntosAsync(
        string destinatario,
        string asunto,
        string cuerpo,
        IEnumerable<(string NombreArchivo, byte[] Contenido, string TipoMime)> adjuntos,
        CancellationToken cancellationToken = default);
}