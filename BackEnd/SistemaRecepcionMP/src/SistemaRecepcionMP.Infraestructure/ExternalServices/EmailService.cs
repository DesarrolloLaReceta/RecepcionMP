using SistemaRecepcionMP.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace SistemaRecepcionMP.Infrastructure.ExternalServices;

public sealed class SmtpEmailService : IEmailService
{
    private const string Office365Sender = "notificaciones@lareceta.co";
    private readonly string _host;
    private readonly int _port;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _nombreRemitente;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _host = configuration["Email:Smtp:Host"]
            ?? throw new InvalidOperationException("Email:Smtp:Host no est? configurado.");
        _port = int.TryParse(configuration["Email:Smtp:Port"], out var port)
            ? port
            : throw new InvalidOperationException("Email:Smtp:Port no est? configurado.");
        _smtpUsername = configuration["Email:Smtp:Username"]
            ?? throw new InvalidOperationException("Email:Smtp:Username no est? configurado.");
        _smtpPassword = configuration["Email:Smtp:Password"]
            ?? throw new InvalidOperationException("Email:Smtp:Password no est? configurado.");
        _nombreRemitente = configuration["Email:Smtp:FromName"]
            ?? "Sistema Recepci?n MP";
        _logger = logger;

        if (!string.Equals(_smtpUsername, Office365Sender, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"Email:Smtp:Username debe ser {Office365Sender} para evitar bloqueos de Office 365.");
        }
    }

    public async Task EnviarAsync(EmailMessage mensaje, CancellationToken cancellationToken = default)
    {
        var mimeMessage = new MimeMessage();
        mimeMessage.From.Add(new MailboxAddress(_nombreRemitente, Office365Sender));
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
        await smtpClient.ConnectAsync(_host, _port, SecureSocketOptions.StartTls, cancellationToken);
        await smtpClient.AuthenticateAsync(_smtpUsername, _smtpPassword, cancellationToken);
        await smtpClient.SendAsync(mimeMessage, cancellationToken);
        await smtpClient.DisconnectAsync(true, cancellationToken);

        _logger.LogInformation(
            "Email enviado por SMTP autenticado a {Destinatario} con asunto {Asunto}",
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