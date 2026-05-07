using SistemaRecepcionMP.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace SistemaRecepcionMP.Infrastructure.ExternalServices;

public sealed class SmtpEmailService : IEmailService
{
    private readonly string _host;
    private readonly int _port;
    private readonly string _remitenteEmail;
    private readonly string _nombreRemitente;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _host = configuration["Email:Smtp:Host"]
            ?? throw new InvalidOperationException("Email:Smtp:Host no est? configurado.");
        _port = int.TryParse(configuration["Email:Smtp:Port"], out var port)
            ? port
            : throw new InvalidOperationException("Email:Smtp:Port no est? configurado.");
        _remitenteEmail = configuration["Email:Smtp:From"]
            ?? "noreply@lareceta.co";
        _nombreRemitente = configuration["Email:Smtp:FromName"]
            ?? "Sistema Recepci?n MP";
        _logger = logger;
    }

    public async Task EnviarAsync(EmailMessage mensaje, CancellationToken cancellationToken = default)
    {
        var mimeMessage = new MimeMessage();
        mimeMessage.From.Add(new MailboxAddress(_nombreRemitente, _remitenteEmail));
        mimeMessage.To.Add(MailboxAddress.Parse(mensaje.Destinatario));
        mimeMessage.Subject = mensaje.Asunto;

        var bodyBuilder = new BodyBuilder();
        if (mensaje.EsHtml)
            bodyBuilder.HtmlBody = mensaje.Cuerpo;
        else
            bodyBuilder.TextBody = mensaje.Cuerpo;

        if (mensaje.Adjuntos is not null)
        {
            foreach (var adjunto in mensaje.Adjuntos)
            {
                bodyBuilder.Attachments.Add(adjunto.NombreArchivo, adjunto.Contenido, ContentType.Parse(adjunto.TipoMime));
            }
        }

        mimeMessage.Body = bodyBuilder.ToMessageBody();

        using var smtpClient = new SmtpClient();
        await smtpClient.ConnectAsync(_host, _port, SecureSocketOptions.None, cancellationToken);
        // Relay por IP autorizado: no autenticaci?n.
        await smtpClient.SendAsync(mimeMessage, cancellationToken);
        await smtpClient.DisconnectAsync(true, cancellationToken);

        _logger.LogInformation(
            "Email enviado por relay SMTP a {Destinatario} con asunto {Asunto}",
            mensaje.Destinatario,
            mensaje.Asunto);
    }

    public async Task EnviarAVariosAsync(
        IEnumerable<EmailMessage> mensajes,
        CancellationToken cancellationToken = default)
    {
        var tareas = mensajes
            .Select(m => EnviarAsync(m, cancellationToken));

        await Task.WhenAll(tareas);
    }
}