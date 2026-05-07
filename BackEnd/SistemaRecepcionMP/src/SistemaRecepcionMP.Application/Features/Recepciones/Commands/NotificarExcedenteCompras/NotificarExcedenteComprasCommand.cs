using MediatR;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.NotificarExcedenteCompras;

public sealed class NotificarExcedenteComprasCommand : IRequest<NotificarExcedenteComprasResult>
{
    public Guid RecepcionId { get; set; }
}

public sealed record NotificarExcedenteComprasResult(
    bool Exito,
    Guid RecepcionId,
    Guid RecepcionNovedadId,
    DateTime FechaNotificacionUtc,
    string Mensaje
);

public sealed class NotificarExcedenteComprasCommandHandler
    : IRequestHandler<NotificarExcedenteComprasCommand, NotificarExcedenteComprasResult>
{
    private const string ComprasDestino = "equipocompras@lareceta.co";
    private readonly IRecepcionNovedadRepository _novedadesRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public NotificarExcedenteComprasCommandHandler(
        IRecepcionNovedadRepository novedadesRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _novedadesRepository = novedadesRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<NotificarExcedenteComprasResult> Handle(
        NotificarExcedenteComprasCommand request,
        CancellationToken cancellationToken)
    {
        var novedad = await _novedadesRepository.ObtenerPendienteExcedenteAsync(request.RecepcionId, cancellationToken);
        if (novedad is null)
        {
            throw new NotFoundException("RecepcionNovedadPendiente", request.RecepcionId);
        }

        var asunto = $"[Recepción MP] Excedente detectado - Recepción {novedad.Recepcion.NumeroRecepcion}";
        var cuerpo = ConstruirCuerpoCorreo(novedad);

        await _emailService.EnviarAsync(
            new EmailMessage(
                Destinatario: ComprasDestino,
                Asunto: asunto,
                Cuerpo: cuerpo,
                EsHtml: true),
            cancellationToken);

        novedad.AgregarNotificacion(new RecepcionNovedadNotificacion(
            novedad.Id,
            ComprasDestino,
            asunto,
            "Enviado"));
        novedad.MarcarComoNotificada();

        _novedadesRepository.Update(novedad);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new NotificarExcedenteComprasResult(
            Exito: true,
            RecepcionId: request.RecepcionId,
            RecepcionNovedadId: novedad.Id,
            FechaNotificacionUtc: DateTime.UtcNow,
            Mensaje: "Notificación enviada correctamente al equipo de Compras."
        );
    }

    private static string ConstruirCuerpoCorreo(RecepcionNovedad novedad)
    {
        var filas = string.Join(
            "",
            novedad.Detalles.Select(d =>
                $"""
                 <tr>
                   <td style="padding:8px;border:1px solid #e5e7eb;">{d.Item.Nombre}</td>
                   <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">{d.CantidadFisica:N2}</td>
                   <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">{d.CantidadSiesa:N2}</td>
                   <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;color:#b91c1c;"><strong>{d.Diferencia:N2}</strong></td>
                   <td style="padding:8px;border:1px solid #e5e7eb;">{d.UnidadMedida}</td>
                 </tr>
                 """));

        return $"""
                <div style="font-family:Segoe UI, Arial, sans-serif; color:#111827;">
                  <h2 style="margin-bottom:4px;">Novedad por Excedente - Recepción de Materia Prima</h2>
                  <p style="margin-top:0;color:#4b5563;">La Receta</p>
                  <p>Se detectó un excedente entre la cantidad física recibida y la cantidad reportada por SIESA.</p>
                  <p><strong>Recepción:</strong> {novedad.Recepcion.NumeroRecepcion}</p>
                  <p><strong>Fecha detección (UTC):</strong> {novedad.FechaDeteccionUtc:yyyy-MM-dd HH:mm:ss}</p>

                  <table style="border-collapse:collapse; width:100%; margin-top:12px;">
                    <thead>
                      <tr style="background:#f9fafb;">
                        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Ítem</th>
                        <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Cantidad Física</th>
                        <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Cantidad SIESA</th>
                        <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Diferencia</th>
                        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">UM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filas}
                    </tbody>
                  </table>

                  <p style="margin-top:16px;">
                    Por favor gestionar el ajuste correspondiente en el flujo de compras y OC.
                  </p>
                </div>
                """;
    }
}
