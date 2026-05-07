namespace SistemaRecepcionMP.Application.Common.Interfaces;

public interface IEmailService
{
    Task EnviarAsync(EmailMessage mensaje, CancellationToken cancellationToken = default);
    Task EnviarAVariosAsync(IEnumerable<EmailMessage> mensajes, CancellationToken cancellationToken = default);
}

public sealed record EmailMessage(
    string Destinatario,
    string Asunto,
    string Cuerpo,
    bool EsHtml = true,
    IReadOnlyCollection<EmailAttachment>? Adjuntos = null
);

public sealed record EmailAttachment(
    string NombreArchivo,
    byte[] Contenido,
    string TipoMime
);