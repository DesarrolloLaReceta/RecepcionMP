using SistemaRecepcionMP.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Infrastructure.ExternalServices;

/// <summary>
/// Implementa IEmailService usando SendGrid.
/// Requiere el paquete: SendGrid
/// </summary>
public sealed class EmailService : IEmailService
{
    private readonly ISendGridClient _sendGridClient;
    private readonly string _remitente;
    private readonly string _nombreRemitente;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        var apiKey = configuration["SendGrid:ApiKey"]
            ?? throw new InvalidOperationException("SendGrid:ApiKey no está configurado.");

        _sendGridClient = new SendGridClient(apiKey);
        _remitente = configuration["SendGrid:Remitente"] ?? "noreply@empresa.com";
        _nombreRemitente = configuration["SendGrid:NombreRemitente"] ?? "Sistema Recepción MP";
        _logger = logger;
    }

    public async Task EnviarAsync(
        string destinatario,
        string asunto,
        string cuerpoHtml,
        bool esHtml,
        CancellationToken cancellationToken = default)
    {
        var mensaje = MailHelper.CreateSingleEmail(
            new EmailAddress(_remitente, _nombreRemitente),
            new EmailAddress(destinatario),
            asunto,
            plainTextContent: null,
            htmlContent: cuerpoHtml);

        var response = await _sendGridClient.SendEmailAsync(mensaje, cancellationToken);

        if (!response.IsSuccessStatusCode)
            _logger.LogWarning("Error al enviar email a {Destinatario}: {Status}",
                destinatario, response.StatusCode);
        else
            _logger.LogInformation("Email enviado a {Destinatario}: {Asunto}", destinatario, asunto);
    }

    public async Task EnviarAVariosAsync(
        IEnumerable<string> destinatarios,
        string asunto,
        string cuerpoHtml,
        bool esHtml,
        CancellationToken cancellationToken = default)
    {
        var tareas = destinatarios
            .Select(d => EnviarAsync(d, asunto, cuerpoHtml, esHtml, cancellationToken));

        await Task.WhenAll(tareas);
    }

    public async Task EnviarConAdjuntosAsync(
        string destinatario,
        string asunto,
        string cuerpoHtml,
        IEnumerable<(string NombreArchivo, byte[] Contenido, string TipoMime)> adjuntos,
        CancellationToken cancellationToken = default)
    {
        var mensaje = MailHelper.CreateSingleEmail(
            new EmailAddress(_remitente, _nombreRemitente),
            new EmailAddress(destinatario),
            asunto,
            plainTextContent: null,
            htmlContent: cuerpoHtml);

        foreach (var (nombreArchivo, contenido, tipoMime) in adjuntos)
        {
            mensaje.AddAttachment(nombreArchivo,
                Convert.ToBase64String(contenido),
                type: tipoMime);
        }

        await _sendGridClient.SendEmailAsync(mensaje, cancellationToken);
    }

    public async Task EnviarConPlantillaAsync(
        string destinatario,
        string plantilla,
        IDictionary<string, string> variables,
        CancellationToken cancellationToken = default)
    {
        // Construir cuerpo HTML desde plantilla simple con reemplazos de variables
        // En producción puedes usar plantillas de SendGrid Dynamic Templates
        var cuerpo = ObtenerPlantilla(plantilla, variables.ToDictionary(kv => kv.Key, kv => kv.Value));
        var asunto = ObtenerAsunto(plantilla);

        await EnviarAsync(destinatario, asunto, cuerpo, true, cancellationToken);
    }

    private static string ObtenerAsunto(string plantilla) => plantilla switch
    {
        "LoteRechazado"         => "Notificación: Lote rechazado en recepción",
        "LoteLiberado"          => "Notificación: Lote aprobado y liberado",
        "DocumentoPorVencer"    => "Alerta: Documento sanitario próximo a vencer",
        "NoConformidadCreada"   => "Nueva no conformidad registrada",
        _                       => "Notificación del Sistema de Recepción"
    };

    private static string ObtenerPlantilla(string plantilla, Dictionary<string, string> vars)
    {
        // Plantillas HTML básicas — en producción usar archivos .html o SendGrid Dynamic Templates
        var cuerpo = plantilla switch
        {
            "LoteRechazado" =>
                $"<p>El lote <strong>{vars.GetValueOrDefault("CodigoLote", "")}</strong> fue rechazado.</p>" +
                $"<p><strong>Motivo:</strong> {vars.GetValueOrDefault("Motivo", "")}</p>" +
                $"<p><strong>Responsable:</strong> {vars.GetValueOrDefault("Responsable", "")}</p>",

            "LoteLiberado" =>
                $"<p>El lote <strong>{vars.GetValueOrDefault("CodigoLote", "")}</strong> fue aprobado y liberado.</p>",

            "DocumentoPorVencer" =>
                $"<p>El documento <strong>{vars.GetValueOrDefault("TipoDocumento", "")}</strong> del proveedor " +
                $"<strong>{vars.GetValueOrDefault("Proveedor", "")}</strong> vence el " +
                $"<strong>{vars.GetValueOrDefault("FechaVencimiento", "")}</strong>.</p>",

            _ => "<p>Notificación del sistema.</p>"
        };

        return $"<html><body>{cuerpo}</body></html>";
    }
}